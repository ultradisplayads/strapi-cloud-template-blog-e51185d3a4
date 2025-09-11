'use strict';

/**
 * Currency converter service
 */

module.exports = ({ strapi }) => ({
  /**
   * Get widget settings for currency converter
   */
  async getWidgetSettings() {
    try {
      // Get or create default settings
      let settings = await strapi.entityService.findMany('api::currency-converter.currency-converter', {
        filters: { type: 'widget-settings' },
        limit: 1
      });

      if (!settings || settings.length === 0) {
        // Create default settings
        settings = await strapi.entityService.create('api::currency-converter.currency-converter', {
          data: {
            type: 'widget-settings',
            enabled: true,
            defaultFromCurrency: 'THB',
            defaultToCurrency: 'USD',
            updateFrequencyMinutes: 5,
            supportedCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD', 'MYR', 'IDR', 'PHP', 'VND', 'CNY', 'HKD', 'TWD', 'AUD', 'CAD', 'CHF', 'NZD', 'INR', 'RUB'],
            sponsoredEnabled: false,
            sponsorName: null,
            sponsorLogo: null
          }
        });
      } else {
        settings = settings[0];
      }

      return settings;
    } catch (error) {
      console.error('Error getting currency converter settings:', error);
      return {
        type: 'widget-settings',
        enabled: true,
        defaultFromCurrency: 'THB',
        defaultToCurrency: 'USD',
        updateFrequencyMinutes: 5,
        supportedCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD', 'MYR', 'IDR', 'PHP', 'VND', 'CNY', 'HKD', 'TWD', 'AUD', 'CAD', 'CHF', 'NZD', 'INR', 'RUB'],
        sponsoredEnabled: false,
        sponsorName: null,
        sponsorLogo: null
      };
    }
  },

  /**
   * Update widget settings
   */
  async updateWidgetSettings(settings) {
    try {
      const existing = await strapi.entityService.findMany('api::currency-converter.currency-converter', {
        filters: { type: 'widget-settings' },
        limit: 1
      });

      if (existing && existing.length > 0) {
        return await strapi.entityService.update('api::currency-converter.currency-converter', existing[0].id, {
          data: settings
        });
      } else {
        return await strapi.entityService.create('api::currency-converter.currency-converter', {
          data: {
            ...settings,
            type: 'widget-settings'
          }
        });
      }
    } catch (error) {
      console.error('Error updating currency converter settings:', error);
      throw error;
    }
  },

  /**
   * Log conversion for analytics
   */
  async logConversion(from, to, amount, result) {
    try {
      await strapi.entityService.create('api::currency-converter.currency-converter', {
        data: {
          type: 'conversion-log',
          fromCurrency: from,
          toCurrency: to,
          amount: amount,
          result: result,
          timestamp: new Date().toISOString(),
          userAgent: 'widget',
          ipAddress: 'unknown'
        }
      });
    } catch (error) {
      console.error('Error logging conversion:', error);
      // Don't throw error for logging failures
    }
  }
});