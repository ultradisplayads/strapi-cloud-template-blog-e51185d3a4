'use strict';

/**
 * review-settings service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore - Strapi type system needs regeneration
module.exports = createCoreService('api::review-settings.review-settings', ({ strapi }) => ({
  // Get current settings or create default
  async getSettings() {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      let settings = await strapi.entityService.findMany('api::review-settings.review-settings');
      
      // @ts-ignore - Strapi type system needs regeneration
      if (!settings || (Array.isArray(settings) ? settings.length === 0 : !settings)) {
        // @ts-ignore - Strapi type system needs regeneration
        settings = await this.createDefaultSettings();
      }
      
      return settings[0];
    } catch (error) {
      strapi.log.error('Error getting review settings:', error);
      throw error;
    }
  },

  // Create default settings
  async createDefaultSettings() {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const defaultSettings = await strapi.entityService.create('api::review-settings.review-settings', {
        data: {
          google_places: {
            platform_name: 'Google Places',
            is_enabled: true,
            daily_limit: 20,
            rate_limit_per_minute: 10,
            fetch_count_today: 0,
            is_healthy: true
          },
          yelp: {
            platform_name: 'Yelp',
            is_enabled: true,
            daily_limit: 500,
            rate_limit_per_minute: 5,
            fetch_count_today: 0,
            is_healthy: true
          },
          foursquare: {
            platform_name: 'Foursquare',
            is_enabled: true,
            daily_limit: 1000,
            rate_limit_per_minute: 10,
            fetch_count_today: 0,
            is_healthy: true
          },
          facebook: {
            platform_name: 'Facebook',
            is_enabled: false,
            daily_limit: 200,
            rate_limit_per_minute: 5,
            fetch_count_today: 0,
            is_healthy: true
          },
          daily_fetch_limit: 20,
          cache_duration_days: 30,
          fetch_frequency_hours: 24,
          fetch_stats: {
            total_fetched: 0,
            last_24h_fetched: 0,
            platforms_active: 3,
            last_error: null
          }
        }
      });
      
      return [defaultSettings];
    } catch (error) {
      strapi.log.error('Error creating default review settings:', error);
      throw error;
    }
  },

  // Update platform fetch count
  async updatePlatformFetchCount(platform, count) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const settings = await this.getSettings();
      const updateData = {};
      updateData[platform] = {
        ...settings[platform],
        fetch_count_today: count,
        last_fetch: new Date()
      };

      // @ts-ignore - Strapi type system needs regeneration
      await strapi.entityService.update('api::review-settings.review-settings', settings.id, {
        data: updateData
      });
    } catch (error) {
      strapi.log.error(`Error updating ${platform} fetch count:`, error);
    }
  },

  // Update platform health status
  async updatePlatformHealth(platform, isHealthy, error = null) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const settings = await this.getSettings();
      const updateData = {};
      updateData[platform] = {
        ...settings[platform],
        is_healthy: isHealthy,
        last_error: error
      };

      // @ts-ignore - Strapi type system needs regeneration
      await strapi.entityService.update('api::review-settings.review-settings', settings.id, {
        data: updateData
      });
    } catch (error) {
      strapi.log.error(`Error updating ${platform} health:`, error);
    }
  },

  // Update fetch statistics
  async updateFetchStats(stats) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const settings = await this.getSettings();
      const updateData = {
        fetch_stats: {
          ...settings.fetch_stats,
          ...stats
        },
        last_fetch_run: new Date()
      };

      // @ts-ignore - Strapi type system needs regeneration
      await strapi.entityService.update('api::review-settings.review-settings', settings.id, {
        data: updateData
      });
    } catch (error) {
      strapi.log.error('Error updating fetch stats:', error);
    }
  },

  // Check if platform can fetch (rate limiting)
  async canPlatformFetch(platform) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const settings = await this.getSettings();
      // @ts-ignore - Strapi type system needs regeneration
      const platformConfig = settings[platform];
      
      if (!platformConfig || !platformConfig.is_enabled) {
        return false;
      }

      // Check daily limit
      if (platformConfig.fetch_count_today >= platformConfig.daily_limit) {
        return false;
      }

      // Check if platform is healthy
      if (!platformConfig.is_healthy) {
        return false;
      }

      return true;
    } catch (error) {
      strapi.log.error(`Error checking ${platform} fetch capability:`, error);
      return false;
    }
  }
}));
