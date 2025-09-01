'use strict';

/**
 * Enhanced weather controller with geolocation support
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::weather.weather', ({ strapi }) => ({
  /**
   * Get current weather for specific coordinates
   * GET /api/weather/current?lat=12.9236&lon=100.8825&units=metric
   */
  async getCurrent(ctx) {
    try {
      const { lat, lon, units = 'metric' } = ctx.query;

      // Validate coordinates
      if (!lat || !lon) {
        // Use default coordinates from settings if none provided
        const settings = await strapi.service('api::weather.weather').getWeatherSettings();
        const weatherData = await strapi.service('api::weather.weather').getWeather({
          lat: settings.defaultLatitude,
          lon: settings.defaultLongitude,
          units: settings.units
        });
        
        return {
          data: weatherData,
          message: `Using default location: ${settings.defaultCityName}`
        };
      }

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return ctx.badRequest('Invalid coordinates provided');
      }

      // Get weather data
      const weatherData = await strapi.service('api::weather.weather').getWeather({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        units: units === 'imperial' ? 'imperial' : 'metric'
      });

      return {
        data: weatherData,
        message: `Weather data for coordinates ${lat}, ${lon}`
      };
    } catch (error) {
      console.error('Error in getCurrent:', error);
      return ctx.internalServerError('Failed to fetch weather data');
    }
  },

  /**
   * Get weather settings
   * GET /api/weather/settings
   */
  async getSettings(ctx) {
    try {
      const settings = await strapi.service('api::weather.weather').getWeatherSettings();
      
      // Return only public-safe settings (no API keys)
      return {
        data: {
          defaultCityName: settings.defaultCityName,
          defaultLatitude: settings.defaultLatitude,
          defaultLongitude: settings.defaultLongitude,
          units: settings.units,
          updateFrequencyMinutes: settings.updateFrequencyMinutes,
          widgetEnabled: settings.widgetEnabled,
          sponsoredEnabled: settings.sponsoredEnabled,
          sponsorName: settings.sponsorName,
          sponsorLogo: settings.sponsorLogo
        }
      };
    } catch (error) {
      console.error('Error in getSettings:', error);
      return ctx.internalServerError('Failed to fetch weather settings');
    }
  },

  /**
   * Get weather suggestions for a specific condition
   * GET /api/weather/suggestions?condition=sunny
   */
  async getSuggestions(ctx) {
    try {
      const { condition } = ctx.query;
      
      if (!condition) {
        return ctx.badRequest('Weather condition is required');
      }

      const suggestions = await strapi.entityService.findMany('api::weather-activity-suggestion.weather-activity-suggestion', {
        filters: {
          isActive: true,
          weatherCondition: condition.toLowerCase()
        },
        sort: { priority: 'asc' },
        limit: 5
      });

      return {
        data: suggestions.map(suggestion => ({
          id: suggestion.id,
          title: suggestion.title,
          description: suggestion.description,
          link: suggestion.link,
          icon: suggestion.icon,
          priority: suggestion.priority
        }))
      };
    } catch (error) {
      console.error('Error in getSuggestions:', error);
      return ctx.internalServerError('Failed to fetch weather suggestions');
    }
  }
}));
