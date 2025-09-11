'use strict';

/**
 * Social Feed Scheduler Service
 * Automatically fetches new social media posts every 15 minutes
 */

module.exports = ({ strapi }) => ({
  // Start the scheduler
  async startScheduler() {
    strapi.log.info('Starting social feed scheduler...');
    
    // Fetch posts immediately
    await this.fetchNewPosts();
    
    // Set up interval to fetch posts every 15 minutes
    setInterval(async () => {
      try {
        await this.fetchNewPosts();
      } catch (error) {
        strapi.log.error('Scheduled social feed fetch failed:', error.message);
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    strapi.log.info('Social feed scheduler started - fetching every 15 minutes');
  },

  // Fetch new posts from all sources
  async fetchNewPosts() {
    try {
      strapi.log.info('Fetching new social media posts...');
      
      const socialFeedService = strapi.service('api::social-feed.social-feed');
      const keywords = ['Pattaya', 'Thailand', 'Beach', 'Nightlife', 'Food', 'Tourism'];
      
      const newPosts = await socialFeedService.aggregatePosts(keywords);
      
      if (newPosts.length > 0) {
        strapi.log.info(`Successfully fetched ${newPosts.length} new social media posts`);
      } else {
        strapi.log.info('No new posts found');
      }
      
      return newPosts;
    } catch (error) {
      strapi.log.error('Failed to fetch new posts:', error.message);
      throw error;
    }
  },

  // Manual trigger for fetching posts
  async triggerFetch() {
    return await this.fetchNewPosts();
  },

  // Get scheduler status
  getStatus() {
    return {
      running: true,
      lastFetch: new Date().toISOString(),
      interval: '15 minutes'
    };
  }
});
