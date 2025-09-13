'use strict';

/**
 * review-settings controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore - Strapi type system needs regeneration
module.exports = createCoreController('api::review-settings.review-settings', ({ strapi }) => ({
  // Override find to get or create default settings
  async find(ctx) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      let settings = await strapi.entityService.findMany('api::review-settings.review-settings');
      
      // @ts-ignore - Strapi type system needs regeneration
      if (!settings || (Array.isArray(settings) ? settings.length === 0 : !settings)) {
        // Create default settings if none exist
        // @ts-ignore - Strapi type system needs regeneration
        settings = await strapi.entityService.create('api::review-settings.review-settings', {
          data: {
            google_places: {
              platform_name: 'Google Places',
              is_enabled: true,
              daily_limit: 20,
              rate_limit_per_minute: 10
            },
            yelp: {
              platform_name: 'Yelp',
              is_enabled: true,
              daily_limit: 500,
              rate_limit_per_minute: 5
            },
            foursquare: {
              platform_name: 'Foursquare',
              is_enabled: true,
              daily_limit: 1000,
              rate_limit_per_minute: 10
            },
            facebook: {
              platform_name: 'Facebook',
              is_enabled: false,
              daily_limit: 200,
              rate_limit_per_minute: 5
            },
            daily_fetch_limit: 20,
            cache_duration_days: 30,
            fetch_frequency_hours: 24
          }
        });
      }
      
      return { data: settings };
    } catch (error) {
      strapi.log.error('Error fetching review settings:', error);
      return ctx.internalServerError('Failed to fetch review settings');
    }
  },

  // Update platform status
  async updatePlatformStatus(ctx) {
    try {
      const { platform, isEnabled } = ctx.request.body;
      
      if (!platform || typeof isEnabled !== 'boolean') {
        return ctx.badRequest('Invalid platform or status');
      }

      // @ts-ignore - Strapi type system needs regeneration
      const settings = await strapi.entityService.findMany('api::review-settings.review-settings');
      // @ts-ignore - Strapi type system needs regeneration
      if (!settings || (Array.isArray(settings) ? settings.length === 0 : !settings)) {
        return ctx.notFound('Review settings not found');
      }

      const updateData = {};
      updateData[platform] = {
        ...settings[0][platform],
        is_enabled: isEnabled
      };

      // @ts-ignore - Strapi type system needs regeneration
      const updatedSettings = await strapi.entityService.update('api::review-settings.review-settings', settings[0].id, {
        data: updateData
      });

      strapi.log.info(`Platform ${platform} ${isEnabled ? 'enabled' : 'disabled'}`);
      return { data: updatedSettings };
    } catch (error) {
      strapi.log.error('Error updating platform status:', error);
      return ctx.internalServerError('Failed to update platform status');
    }
  },

  // Get fetch statistics
  async getStats(ctx) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const settings = await strapi.entityService.findMany('api::review-settings.review-settings');
      // @ts-ignore - Strapi type system needs regeneration
      if (!settings || (Array.isArray(settings) ? settings.length === 0 : !settings)) {
        return ctx.notFound('Review settings not found');
      }

      const stats = settings[0].fetch_stats || {};
      return { data: stats };
    } catch (error) {
      strapi.log.error('Error fetching review stats:', error);
      return ctx.internalServerError('Failed to fetch review stats');
    }
  }
}));
