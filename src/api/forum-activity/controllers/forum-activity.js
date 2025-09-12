'use strict';

/**
 * forum-activity controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::forum-activity.forum-activity', ({ strapi }) => ({
  /**
   * Get enhanced forum activity data
   */
  async getEnhanced(ctx) {
    try {
      const { limit = 5 } = ctx.query;
      
      const topics = await strapi.service('api::forum-activity.forum-activity').getEnhancedForumActivity(parseInt(String(limit)));
      
      return {
        data: topics,
        meta: {
          total: topics.length,
          timestamp: new Date().toISOString(),
          cached: false
        }
      };
    } catch (error) {
      strapi.log.error('Error in getEnhanced forum activity:', error);
      return ctx.badRequest('Failed to fetch forum activity', { error: error.message });
    }
  }
}));
