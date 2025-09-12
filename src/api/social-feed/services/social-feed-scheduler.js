'use strict';

/**
 * Social Feed Scheduler Service
 * Handles automated content fetching and processing
 */

// @ts-nocheck
const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::social-feed.social-feed', ({ strapi }) => ({
  // Scheduler status
  _isRunning: false,
  _lastRun: null,
  _nextRun: null,
  _intervalId: null,

  /**
   * Start the scheduler
   * @param {number} intervalMinutes - Interval in minutes (default: 15)
   */
  async startScheduler(intervalMinutes = 15) {
    if (this._isRunning) {
      strapi.log.warn('Social feed scheduler is already running');
      return;
    }

    this._isRunning = true;
    this._intervalId = setInterval(async () => {
      // @ts-ignore
      await this.runScheduledTask();
    }, intervalMinutes * 60 * 1000);

    // Run immediately on start
    // @ts-ignore
    await this.runScheduledTask();

    strapi.log.info(`Social feed scheduler started with ${intervalMinutes} minute intervals`);
  },

  /**
   * Stop the scheduler
   */
  stopScheduler() {
    if (this._intervalId) {
      // @ts-ignore
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._isRunning = false;
    strapi.log.info('Social feed scheduler stopped');
  },

  /**
   * Run the scheduled aggregation task
   */
  async runScheduledTask() {
    try {
      strapi.log.info('Running scheduled social feed aggregation...');
      this._lastRun = new Date();
      this._nextRun = new Date(Date.now() + 15 * 60 * 1000); // Next run in 15 minutes

      // @ts-ignore
      const enhancedService = strapi.service('api::social-feed.social-feed-enhanced');
      const keywords = ['Pattaya', 'Thailand', 'Beach', 'Nightlife', 'Food', 'Tourism'];
      
      // @ts-ignore
      const newPosts = await enhancedService.aggregatePosts(keywords, false);
      
      strapi.log.info(`Scheduled aggregation completed: ${newPosts.length} posts processed`);
      
      // Update scheduler status
      // @ts-ignore
      await this.updateSchedulerStatus({
        lastRun: this._lastRun,
        nextRun: this._nextRun,
        status: 'success',
        postsProcessed: newPosts.length
      });

    } catch (error) {
      strapi.log.error('Scheduled aggregation failed:', error.message);
      
      // Update scheduler status with error
      // @ts-ignore
      await this.updateSchedulerStatus({
        lastRun: this._lastRun,
        nextRun: this._nextRun,
        status: 'error',
        error: error.message
      });
    }
  },

  /**
   * Get scheduler status
   * @returns {Object} Scheduler status
   */
  getStatus() {
    return {
      isRunning: this._isRunning,
      lastRun: this._lastRun,
      nextRun: this._nextRun,
      // @ts-ignore
      uptime: this._isRunning ? Date.now() - (this._lastRun?.getTime() || Date.now()) : 0
    };
  },

  /**
   * Update scheduler status in database
   * @param {Object} statusData - Status data to save
   */
  async updateSchedulerStatus(statusData) {
    try {
      // This would typically save to a scheduler status collection
      // For now, we'll just log it
      strapi.log.info('Scheduler status updated:', statusData);
    } catch (error) {
      strapi.log.error('Failed to update scheduler status:', error.message);
    }
  },

  /**
   * Force run the aggregation task
   * @param {boolean} forceRefresh - Force refresh from APIs
   * @returns {Promise<Array>} Processed posts
   */
  async forceRun(forceRefresh = true) {
    try {
      strapi.log.info('Force running social feed aggregation...');
      
      // @ts-ignore
      const enhancedService = strapi.service('api::social-feed.social-feed-enhanced');
      const keywords = ['Pattaya', 'Thailand', 'Beach', 'Nightlife', 'Food', 'Tourism'];
      
      // @ts-ignore
      const newPosts = await enhancedService.aggregatePosts(keywords, forceRefresh);
      
      strapi.log.info(`Force run completed: ${newPosts.length} posts processed`);
      return newPosts;
      
    } catch (error) {
      strapi.log.error('Force run failed:', error.message);
      throw error;
    }
  },

  /**
   * Get aggregation statistics
   * @returns {Promise<Object>} Aggregation stats
   */
  async getAggregationStats() {
    try {
      // @ts-ignore
      const stats = await strapi.entityService.findMany('api::social-posts.social-post', {
        filters: {},
        fields: ['id', 'timestamp', 'status', 'source_platform'],
        sort: { timestamp: 'desc' },
        limit: 1000
      });

      const platformStats = {};
      const statusStats = {};
      const hourlyStats = {};

      // @ts-ignore
      const statsArray = Array.isArray(stats) ? stats : [];

      // @ts-ignore
      statsArray.forEach(post => {
        // Platform stats
        // @ts-ignore
        const platform = post.source_platform;
        platformStats[platform] = (platformStats[platform] || 0) + 1;

        // Status stats
        // @ts-ignore
        const status = post.status;
        statusStats[status] = (statusStats[status] || 0) + 1;

        // Hourly stats
        // @ts-ignore
        const hour = new Date(post.timestamp).getHours();
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      });

      return {
        // @ts-ignore
        totalPosts: statsArray.length,
        platformDistribution: platformStats,
        statusDistribution: statusStats,
        hourlyDistribution: hourlyStats,
        // @ts-ignore
        lastProcessed: statsArray.length > 0 ? statsArray[0].timestamp : null
      };

    } catch (error) {
      strapi.log.error('Failed to get aggregation stats:', error.message);
      return {
        totalPosts: 0,
        platformDistribution: {},
        statusDistribution: {},
        hourlyDistribution: {},
        lastProcessed: null
      };
    }
  }
}));