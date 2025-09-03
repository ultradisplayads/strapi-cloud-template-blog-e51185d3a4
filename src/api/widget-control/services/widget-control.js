'use strict';

/**
 * widget-control service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::widget-control.widget-control', ({ strapi }) => ({
  async getConfig() {
    try {
      const configs = await strapi.entityService.findMany('api::widget-control.widget-control');
      
      // Return first config or create default
      if (configs.length > 0) {
        return configs[0];
      }
      
      // Create default config if none exists
      const defaultConfig = await strapi.entityService.create('api::widget-control.widget-control', {
        data: {
          WidgetTitle: 'Pattaya Breaking News',
          NumberOfArticles: 5,
          UpdateFrequencyMinutes: 5,
          IsSponsored: false,
          ShowVotingButtons: true,
          ShowSourceNames: true,
          ShowTimestamps: true,
          EnableAutoRefresh: true,
          WidgetTheme: 'light'
        }
      });
      
      return defaultConfig;
    } catch (error) {
      strapi.log.error('Failed to get widget config:', error.message);
      throw error;
    }
  },

  async getNewsWithSponsored() {
    try {
      const config = await this.getConfig();
      
      // Get breaking news articles
      const breakingNews = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters: {
          moderationStatus: 'approved',
          isHidden: false
        },
        sort: ['-isPinned', '-pinnedAt', '-voteScore', '-PublishedTimestamp'],
        limit: config.NumberOfArticles,
        populate: '*'
      });
      
      // Get sponsored posts and insert them
      const sponsoredService = strapi.service('api::sponsored-post.sponsored-post');
      const finalFeed = await sponsoredService.insertIntoFeed(breakingNews, 3);
      
      return {
        articles: finalFeed,
        config: {
          title: config.WidgetTitle,
          updateFrequency: config.UpdateFrequencyMinutes,
          isSponsored: config.IsSponsored,
          sponsorName: config.SponsorName,
          sponsorMessage: config.SponsorMessage,
          showVoting: config.ShowVotingButtons,
          showSources: config.ShowSourceNames,
          showTimestamps: config.ShowTimestamps,
          autoRefresh: config.EnableAutoRefresh,
          theme: config.WidgetTheme
        }
      };
    } catch (error) {
      strapi.log.error('Failed to get news with sponsored content:', error.message);
      throw error;
    }
  }
}));
