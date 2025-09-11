'use strict';

/**
 * breaking-news service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const axios = require('axios');

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
        return response.data.articles;
      }

      throw new Error(`News API error: ${response.data.message}`);
    } catch (error) {
      strapi.log.error('Failed to fetch from News API:', error.message);
      throw error;
    }
  },

  async checkModerationKeywords(title, summary) {
    const settings = await this.getSettings();
    
    if (!settings.autoModerationEnabled) {
      return 'approved';
    }

    const content = `${title} ${summary}`.toLowerCase();
    const keywords = settings.moderationKeywords || [];
    
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
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
          publishedAt: moderationStatus === 'approved' ? new Date() : null
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
      strapi.log.info('Starting news fetch from News API...');
      
      let totalProcessed = 0;
      let totalApproved = 0;
      let totalReview = 0;

      // Use News API as the primary source
      strapi.log.info('Using News API as primary source');
      const articles = await this.fetchFromNewsAPI(params);
      
      for (const article of articles) {
        const processed = await this.processArticle(article, 'News API');
        if (processed) {
          totalProcessed++;
          if (processed.moderationStatus === 'approved') {
            totalApproved++;
          } else {
            totalReview++;
          }
        }
      }

      strapi.log.info(`News fetch completed: ${totalProcessed} new articles (${totalApproved} approved, ${totalReview} need review)`);
      
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
