'use strict';

/**
 * widget-control controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::widget-control.widget-control', ({ strapi }) => ({
  // Get widget configuration for frontend
  async getConfig(ctx) {
    try {
      const config = await strapi.entityService.findMany('api::widget-control.widget-control');
      
      // Return first config or default values
      const widgetConfig = config[0] || {
        WidgetTitle: 'Pattaya Breaking News',
        NumberOfArticles: 5,
        UpdateFrequencyMinutes: 5,
        IsSponsored: false,
        SponsorName: null,
        SponsorMessage: 'brought to you by',
        ShowVotingButtons: true,
        ShowSourceNames: true,
        ShowTimestamps: true,
        EnableAutoRefresh: true,
        WidgetTheme: 'light'
      };
      
      ctx.body = { data: widgetConfig };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Update widget configuration
  async updateConfig(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Check if config exists
      const existing = await strapi.entityService.findMany('api::widget-control.widget-control');
      
      let config;
      if (existing.length > 0) {
        // Update existing
        config = await strapi.entityService.update('api::widget-control.widget-control', existing[0].id, {
          data
        });
      } else {
        // Create new
        config = await strapi.entityService.create('api::widget-control.widget-control', {
          data
        });
      }
      
      ctx.body = { data: config, message: 'Widget configuration updated' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
}));
