'use strict';

/**
 * news-source service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const axios = require('axios');
const Parser = require('rss-parser');

module.exports = createCoreService('api::news-source.news-source', ({ strapi }) => ({
  async fetchFromRSS(rssUrl) {
    try {
      const parser = new Parser({
        customFields: {
          item: ['media:content', 'enclosure']
        }
      });
      
      const feed = await parser.parseURL(rssUrl);
      const items = [];
      
      for (const item of feed.items) {
        items.push({
          title: item.title || '',
          description: item.contentSnippet || item.content || '',
          url: item.link || '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: { name: feed.title || 'RSS Feed' },
          author: item.creator || item['dc:creator'] || '',
          categories: item.categories || []
        });
      }
      
      return items;
    } catch (error) {
      strapi.log.error(`Failed to fetch RSS from ${rssUrl}:`, error.message);
      throw error;
    }
  },

  async fetchFromNewsAPI(source) {
    try {
      const params = {
        apiKey: source.apiKey || process.env.NEWS_API_KEY,
        country: 'th', // Thailand
        pageSize: 20
      };

      const response = await axios.get('https://newsapi.org/v2/top-headlines', { params });
      
      if (response.data.status === 'ok') {
        return response.data.articles;
      }
      
      throw new Error(`News API error: ${response.data.message}`);
    } catch (error) {
      strapi.log.error('Failed to fetch from News API:', error.message);
      throw error;
    }
  },

  async fetchFromGNews(source) {
    try {
      const apiKey = source.apiKey || process.env.GNEWS_API_KEY;
      const url = `https://gnews.io/api/v4/top-headlines?country=th&token=${apiKey}&lang=en&max=20`;
      
      const response = await axios.get(url);
      
      if (response.data.articles) {
        return response.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: new Date(article.publishedAt),
          source: { name: article.source.name },
          author: '',
          categories: []
        }));
      }
      
      throw new Error('No articles in GNews response');
    } catch (error) {
      strapi.log.error('Failed to fetch from GNews:', error.message);
      throw error;
    }
  },

  async fetchFromSource(source) {
    switch (source.sourceType) {
      case 'rss':
      case 'rss_feed':
        return await this.fetchFromRSS(source.url || source.rssUrl);
      case 'newsapi':
      case 'news_api':
        return await this.fetchFromNewsAPI(source);
      case 'gnews':
        return await this.fetchFromGNews(source);
      case 'facebook_page':
        // Facebook requires special handling - for now, return empty array
        strapi.log.info(`Facebook source ${source.name} requires manual setup`);
        return [];
      case 'website_scraper':
        // Website scraping would require custom implementation per site
        strapi.log.info(`Website scraper for ${source.name} requires custom implementation`);
        return [];
      default:
        throw new Error(`Unsupported source type: ${source.sourceType}`);
    }
  }
}));
