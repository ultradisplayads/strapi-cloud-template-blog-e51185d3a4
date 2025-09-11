'use strict';

/**
 * admin-widget-configs controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController('api::admin-widget-configs.admin-widget-configs', ({ strapi }) => ({
  // Get admin widget configurations
  async getConfigs(ctx) {
    try {
      // Check if user is admin
      const user = ctx.state.user;
      if (!user || user.role?.type !== 'administrator') {
        return ctx.forbidden('Admin access required');
      }

      const config = await strapi.service('api::admin-widget-configs.admin-widget-configs').findMany();
      
      // Return first config or default values
      const widgetConfigs = config[0]?.widgetConfigs || {
        "weather": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
        "breaking-news": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
        "radio": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "hot-deals": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
        "news-hero": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
        "business-spotlight": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "social-feed": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "trending": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "youtube": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "events-calendar": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "quick-links": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "photo-gallery": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "forum-activity": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "google-reviews": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "curator-social": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "currency-converter": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
        "traffic": { "allowResize": false, "allowDrag": false, "allowDelete": false, "isLocked": true }
      };
      
      ctx.body = widgetConfigs;
    } catch (error) {
      console.error('Error getting admin widget configs:', error);
      ctx.throw(500, 'Failed to retrieve admin widget configurations');
    }
  },

  // Update admin widget configurations
  async updateConfigs(ctx) {
    try {
      // Check if user is admin
      const user = ctx.state.user;
      if (!user || user.role?.type !== 'administrator') {
        return ctx.forbidden('Admin access required');
      }

      const { widgetConfigs } = ctx.request.body;

      if (!widgetConfigs || typeof widgetConfigs !== 'object') {
        return ctx.badRequest('Widget configurations are required and must be an object');
      }

      // Check if config exists
      const existing = await strapi.service('api::admin-widget-configs.admin-widget-configs').findMany();
      
      let result;
      if (existing.length > 0) {
        // Update existing
        result = await strapi.service('api::admin-widget-configs.admin-widget-configs').update(existing[0].id, {
          data: {
            widgetConfigs: widgetConfigs,
            lastUpdated: new Date()
          }
        });
      } else {
        // Create new
        result = await strapi.service('api::admin-widget-configs.admin-widget-configs').create({
          data: {
            widgetConfigs: widgetConfigs,
            lastUpdated: new Date()
          }
        });
      }
      
      ctx.body = { 
        success: true, 
        data: result,
        message: 'Admin widget configurations updated successfully' 
      };
    } catch (error) {
      console.error('Error updating admin widget configs:', error);
      ctx.throw(500, 'Failed to update admin widget configurations');
    }
  },

  // Get specific widget configuration
  async getWidgetConfig(ctx) {
    try {
      const { widgetId } = ctx.params;
      
      const config = await strapi.service('api::admin-widget-configs.admin-widget-configs').findMany();
      const widgetConfigs = config[0]?.widgetConfigs || {};
      
      const widgetConfig = widgetConfigs[widgetId] || {
        allowResize: true,
        allowDrag: true,
        allowDelete: true,
        isLocked: false
      };
      
      ctx.body = { [widgetId]: widgetConfig };
    } catch (error) {
      console.error('Error getting widget config:', error);
      ctx.throw(500, 'Failed to retrieve widget configuration');
    }
  },

  // Update specific widget configuration
  async updateWidgetConfig(ctx) {
    try {
      // Check if user is admin
      const user = ctx.state.user;
      if (!user || user.role?.type !== 'administrator') {
        return ctx.forbidden('Admin access required');
      }

      const { widgetId } = ctx.params;
      const { allowResize, allowDrag, allowDelete, isLocked } = ctx.request.body;

      if (typeof allowResize !== 'boolean' || 
          typeof allowDrag !== 'boolean' || 
          typeof allowDelete !== 'boolean' || 
          typeof isLocked !== 'boolean') {
        return ctx.badRequest('All configuration values must be boolean');
      }

      // Get existing configs
      const existing = await strapi.service('api::admin-widget-configs.admin-widget-configs').findMany();
      let widgetConfigs = existing[0]?.widgetConfigs || {};
      
      // Update specific widget config
      widgetConfigs[widgetId] = {
        allowResize,
        allowDrag,
        allowDelete,
        isLocked
      };

      let result;
      if (existing.length > 0) {
        // Update existing
        result = await strapi.service('api::admin-widget-configs.admin-widget-configs').update(existing[0].id, {
          data: {
            widgetConfigs: widgetConfigs,
            lastUpdated: new Date()
          }
        });
      } else {
        // Create new
        result = await strapi.service('api::admin-widget-configs.admin-widget-configs').create({
          data: {
            widgetConfigs: widgetConfigs,
            lastUpdated: new Date()
          }
        });
      }
      
      ctx.body = { 
        success: true, 
        data: result,
        message: `Widget configuration for ${widgetId} updated successfully` 
      };
    } catch (error) {
      console.error('Error updating widget config:', error);
      ctx.throw(500, 'Failed to update widget configuration');
    }
  }
}));
