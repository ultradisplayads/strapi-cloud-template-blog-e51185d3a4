'use strict';

/**
 * breaking-news service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const axios = require('axios');
const Parser = require('rss-parser');

module.exports = createCoreService('api::breaking-news.breaking-news', ({ strapi }) => ({
  // News API configuration - you'll need to set these in your environment
  newsApiConfig: {
    apiKey: process.env.NEWS_API_KEY || 'your-news-api-key-here',
    baseUrl: 'https://newsapi.org/v2',
    endpoints: {
      topHeadlines: '/top-headlines',
      everything: '/everything'
    }
  },

  async getSettings() {
    try {
      const settings = await strapi.entityService.findMany('api::news-settings.news-settings');
      return settings || {
        fetchIntervalMinutes: 30,
        moderationKeywords: ['spam', 'fake', 'clickbait', 'scam', 'adult', 'explicit'],
        autoModerationEnabled: true,
        maxArticlesPerFetch: 20,
        cronJobEnabled: true,
        newsApiCountry: 'us',
        newsApiCategory: 'general'
      };
    } catch (error) {
      strapi.log.warn('Could not load news settings, using defaults');
      return {
        fetchIntervalMinutes: 30,
        moderationKeywords: ['spam', 'fake', 'clickbait', 'scam', 'adult', 'explicit'],
        autoModerationEnabled: true,
        maxArticlesPerFetch: 20,
        cronJobEnabled: true,
        newsApiCountry: 'us',
        newsApiCategory: 'general'
      };
    }
  },

  async fetchFromNewsAPI(params = {}) {
    try {
      const settings = await this.getSettings();
      
      const defaultParams = {
        apiKey: this.newsApiConfig.apiKey,
        country: settings.newsApiCountry || 'us',
        pageSize: settings.maxArticlesPerFetch || 20,
        category: settings.newsApiCategory,
        ...params
      };

      const response = await axios.get(
        `${this.newsApiConfig.baseUrl}${this.newsApiConfig.endpoints.topHeadlines}`,
        { params: defaultParams }
      );

      if (response.data.status === 'ok') {
        // Process News API articles to include image data
        return response.data.articles.map(article => ({
          ...article,
          featuredImage: article.urlToImage || null,
          imageAlt: article.title || '',
          imageCaption: ''
        }));
      }

      throw new Error(`News API error: ${response.data.message}`);
    } catch (error) {
      strapi.log.error('Failed to fetch from News API:', error.message);
      throw error;
    }
  },

  /**
   * Fetch and normalize articles from a single RSS feed
   */
  async fetchFromRSS(rssUrl, sourceName) {
    try {
      if (!rssUrl) return [];
      
      // Enhanced parser with custom fields for image extraction
      const parser = new Parser({
        customFields: {
          item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['enclosure', 'enclosure'],
            ['description', 'fullDescription']
          ]
        }
      });
      
      const feed = await parser.parseURL(rssUrl);
      if (!feed || !Array.isArray(feed.items)) return [];

      return feed.items.map(item => {
        // Extract featured image with multiple methods
        let featuredImage = null;
        let imageAlt = '';
        let imageCaption = '';
        
        // Method 1: Check media fields
        if (item.mediaContent && item.mediaContent.url) {
          featuredImage = item.mediaContent.url;
        } else if (item.mediaThumbnail && item.mediaThumbnail.url) {
          featuredImage = item.mediaThumbnail.url;
        } else if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
          featuredImage = item.enclosure.url;
        }
        
        // Method 2: Extract from content
        if (!featuredImage) {
          const contentToSearch = item.content || item.description || item.fullDescription || '';
          const imgRegex = /<img[^>]+src="([^">]+)"/i;
          const match = imgRegex.exec(contentToSearch);
          if (match) {
            featuredImage = match[1];
            
            // Extract alt text
            const altRegex = /<img[^>]+alt="([^">]*)"/i;
            const altMatch = altRegex.exec(contentToSearch);
            if (altMatch) {
              imageAlt = altMatch[1];
            }
          }
        }
        
        // Ensure full URL for relative paths
        if (featuredImage && !featuredImage.startsWith('http')) {
          try {
            const sourceUrl = new URL(rssUrl);
            featuredImage = `${sourceUrl.protocol}//${sourceUrl.hostname}${featuredImage.startsWith('/') ? '' : '/'}${featuredImage}`;
          } catch (urlError) {
            strapi.log.warn(`Failed to resolve relative image URL: ${featuredImage}`);
          }
        }
        
        return {
          title: item.title || item.contentSnippet || 'No Title',
          description: item.contentSnippet || item.content || '',
          url: item.link,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          source: { name: sourceName || feed.title || 'RSS' },
          featuredImage: featuredImage,
          imageAlt: imageAlt,
          imageCaption: imageCaption
        };
      });
    } catch (error) {
      strapi.log.error(`Failed to fetch RSS from ${sourceName || rssUrl}:`, error.message);
      return [];
    }
  },

  /**
   * Fetch from all active non-API sources (e.g., RSS) defined in news-sources
   */
  async fetchFromActiveSources() {
    // @ts-ignore
    const sources = await strapi.entityService.findMany('api::news-source.news-source', {
      filters: {
        isActive: true,
        sourceType: 'rss_feed'
      },
      fields: ['id', 'name', 'rssUrl', 'totalArticlesFetched']
    });
    const allArticles = [];
    const list = Array.isArray(sources) ? sources : [];
    for (const src of list) {
      // @ts-ignore
      const items = await this.fetchFromRSS(src.rssUrl, src.name);
      allArticles.push(...items);

      // Update source telemetry
      try {
        // @ts-ignore
        await strapi.entityService.update('api::news-source.news-source', src.id, {
          data: {
            lastFetchedAt: new Date(),
            lastFetchStatus: items.length > 0 ? 'success' : 'pending',
            // @ts-ignore
            totalArticlesFetched: (src.totalArticlesFetched || 0) + (items.length || 0)
          }
        });
      } catch (e) {
        // Best effort, ignore
      }
    }

    return allArticles;
  },

  async checkModerationKeywords(title, summary) {
    const settings = await this.getSettings();
    
    if (!settings.autoModerationEnabled) {
      return 'approved';
    }

    const content = `${title} ${summary}`.toLowerCase();
    const keywords = settings.moderationKeywords || [];
    
    for (const keyword of (Array.isArray(keywords) ? keywords : [])) {
      if (typeof keyword === 'string' && content.includes(keyword.toLowerCase())) {
        return 'needs_review';
      }
    }
    
    return 'approved';
  },

  async processArticle(article, sourceName = 'Unknown') {
    try {
      // Check if article already exists
      const existing = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters: { URL: article.url }
      });

      if (existing.length > 0) {
        return null; // Skip duplicate
      }

      // Check moderation
      const moderationStatus = await this.checkModerationKeywords(
        article.title || '',
        article.description || ''
      );

      // Create breaking news entry
      const breakingNews = await strapi.entityService.create('api::breaking-news.breaking-news', {
        data: {
          Title: article.title || 'No Title',
          Summary: article.description || 'No Summary',
          Category: 'General',
          Source: article.source?.name || 'Unknown',
          URL: article.url,
          IsBreaking: false,
          PublishedTimestamp: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          isPinned: false,
          voteScore: 0,
          upvotes: 0,
          downvotes: 0,
          moderationStatus,
          isHidden: false,
          fetchedFromAPI: true,
          apiSource: 'NewsAPI',
          originalAPIData: article,
          publishedAt: moderationStatus === 'approved' ? new Date() : null,
          // Store image data
          FeaturedImage: article.featuredImage || null,
          ImageAlt: article.imageAlt || '',
          ImageCaption: article.imageCaption || ''
        }
      });

      return breakingNews;
    } catch (error) {
      strapi.log.error('Failed to process article:', error.message);
      return null;
    }
  },

  async fetchAndProcessNews(params = {}) {
    try {
      strapi.log.info('Starting news fetch from active sources (RSS)...');

      let totalProcessed = 0;
      let totalApproved = 0;
      let totalReview = 0;

      // Prefer RSS/alternative sources over News API
      let articles = await this.fetchFromActiveSources();

      // Optional fallback to News API if explicitly requested and key exists
      if ((!articles || articles.length === 0) && process.env.NEWS_API_KEY && params.useNewsAPI === true) {
        strapi.log.info('RSS returned no items; falling back to News API...');
        articles = await this.fetchFromNewsAPI(params);
      }
      
      for (const article of (articles || [])) {
        const processed = await this.processArticle({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          featuredImage: article.featuredImage,
          imageAlt: article.imageAlt,
          imageCaption: article.imageCaption
        }, article.source?.name || 'RSS');
        if (processed) {
          totalProcessed++;
          if (processed.moderationStatus === 'approved') {
            totalApproved++;
          } else {
            totalReview++;
          }
        }
      }

      strapi.log.info(`News fetch completed (RSS): ${totalProcessed} new articles (${totalApproved} approved, ${totalReview} need review)`);
      
      return {
        total: totalProcessed,
        approved: totalApproved,
        needsReview: totalReview
      };
    } catch (error) {
      strapi.log.error('News fetching failed:', error.message);
      throw error;
    }
  }
}));
