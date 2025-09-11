'use strict';

/**
 * widget-management service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore - Strapi type system needs regeneration
module.exports = createCoreService('api::widget-management.widget-management', ({ strapi }) => ({
  // Initialize default widgets
  async initializeDefaultWidgets() {
    try {
      const defaultWidgets = [
        {
          widgetName: 'Weather Widget',
          widgetType: 'weather',
          displayName: 'Weather',
          description: 'Current weather conditions and forecast',
          category: 'utility',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: false,
            canBeDeleted: true,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 3,
            gridRow: 1,
            order: 1,
            section: 'main'
          },
          defaultSize: {
            width: 'medium',
            height: 'auto',
            minWidth: 250,
            maxWidth: 400
          },
          priority: 80
        },
        {
          widgetName: 'Breaking News',
          widgetType: 'breaking-news',
          displayName: 'Breaking News',
          description: 'Latest breaking news and updates',
          category: 'core',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: true,
            canBeDeleted: false,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 1,
            gridRow: 1,
            order: 0,
            section: 'main'
          },
          defaultSize: {
            width: 'large',
            height: 'medium',
            minWidth: 400,
            maxWidth: 800
          },
          priority: 100
        },
        {
          widgetName: 'Hot Deals',
          widgetType: 'hot-deals',
          displayName: 'Hot Deals',
          description: 'Featured deals and promotions',
          category: 'content',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: true,
            canBeDeleted: false,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 1,
            gridRow: 2,
            order: 2,
            section: 'main'
          },
          defaultSize: {
            width: 'full',
            height: 'medium',
            minWidth: 600,
            maxWidth: 1200
          },
          priority: 90
        },
        {
          widgetName: 'Radio Widget',
          widgetType: 'radio',
          displayName: 'Radio',
          description: 'Live radio streaming',
          category: 'entertainment',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: false,
            canBeDeleted: true,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 2,
            gridRow: 1,
            order: 3,
            section: 'sidebar'
          },
          defaultSize: {
            width: 'small',
            height: 'small',
            minWidth: 200,
            maxWidth: 300
          },
          priority: 60
        },
        {
          widgetName: 'Social Feed',
          widgetType: 'social-feed',
          displayName: 'Social Feed',
          description: 'Social media feed aggregation',
          category: 'social',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: false,
            canBeDeleted: true,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 2,
            gridRow: 2,
            order: 4,
            section: 'sidebar'
          },
          defaultSize: {
            width: 'medium',
            height: 'large',
            minWidth: 300,
            maxWidth: 500
          },
          priority: 70
        },
        {
          widgetName: 'Currency Converter',
          widgetType: 'currency-converter',
          displayName: 'Currency Converter',
          description: 'Real-time currency conversion tool',
          category: 'utility',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: false,
            canBeDeleted: true,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 3,
            gridRow: 2,
            order: 5,
            section: 'main'
          },
          defaultSize: {
            width: 'medium',
            height: 'auto',
            minWidth: 250,
            maxWidth: 400
          },
          priority: 50
        },
        {
          widgetName: 'Events Calendar',
          widgetType: 'events-calendar',
          displayName: 'Events',
          description: 'Upcoming events and activities',
          category: 'content',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: false,
            canBeDeleted: true,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 1,
            gridRow: 3,
            order: 6,
            section: 'main'
          },
          defaultSize: {
            width: 'large',
            height: 'medium',
            minWidth: 400,
            maxWidth: 800
          },
          priority: 75
        },
        {
          widgetName: 'Business Spotlight',
          widgetType: 'business-spotlight',
          displayName: 'Business Spotlight',
          description: 'Featured local businesses',
          category: 'business',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: false,
            canBeDeleted: true,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 2,
            gridRow: 3,
            order: 7,
            section: 'main'
          },
          defaultSize: {
            width: 'medium',
            height: 'medium',
            minWidth: 300,
            maxWidth: 500
          },
          priority: 65
        },
        {
          widgetName: 'Ad Banner',
          widgetType: 'sponsorship-banner',
          displayName: 'Advertisement',
          description: 'Sponsored content and advertisements',
          category: 'advertising',
          adminControls: {
            allowUserResizing: false,
            allowUserMoving: false,
            isMandatory: true,
            canBeDeleted: false,
            isLocked: true
          },
          defaultPosition: {
            gridColumn: 1,
            gridRow: 0,
            order: -1,
            section: 'header'
          },
          defaultSize: {
            width: 'full',
            height: 'small',
            minWidth: 800,
            maxWidth: 1200
          },
          priority: 95
        },
        {
          widgetName: 'Google Reviews',
          widgetType: 'google-reviews',
          displayName: 'Google Reviews',
          description: 'Multi-platform business reviews from Google, Yelp, and Foursquare',
          category: 'business',
          adminControls: {
            allowUserResizing: true,
            allowUserMoving: true,
            isMandatory: false,
            canBeDeleted: true,
            isLocked: false
          },
          defaultPosition: {
            gridColumn: 3,
            gridRow: 2,
            order: 8,
            section: 'main'
          },
          defaultSize: {
            width: 'medium',
            height: 'large',
            minWidth: 300,
            maxWidth: 500
          },
          priority: 70
        }
      ];

      // @ts-ignore - Strapi type system needs regeneration
      const existingWidgets = await strapi.entityService.findMany('api::widget-management.widget-management');
      
      // @ts-ignore - Strapi type system needs regeneration
      if ((Array.isArray(existingWidgets) ? existingWidgets.length === 0 : !existingWidgets)) {
        for (const widgetData of defaultWidgets) {
          // @ts-ignore - Strapi type system needs regeneration
          await strapi.entityService.create('api::widget-management.widget-management', {
            data: widgetData
          });
        }
        strapi.log.info('Default widgets initialized successfully');
      }

      return defaultWidgets;
    } catch (error) {
      strapi.log.error('Failed to initialize default widgets:', error.message);
      throw error;
    }
  },

  // Get widget by type with fallback
  async getWidgetByType(widgetType) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const widgets = await strapi.entityService.findMany('api::widget-management.widget-management', {
        filters: { widgetType },
        populate: ['adminControls', 'defaultPosition', 'defaultSize', 'sponsorshipSettings']
      });

      return widgets[0] || null;
    } catch (error) {
      strapi.log.error(`Failed to get widget by type ${widgetType}:`, error.message);
      return null;
    }
  },

  // Check widget permissions
  async checkWidgetPermissions(widgetType, action) {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      const widget = await this.getWidgetByType(widgetType);
      
      if (!widget || !widget.adminControls) {
        return false;
      }

      const controls = widget.adminControls;

      switch (action) {
        case 'resize':
          return controls.allowUserResizing && !controls.isLocked;
        case 'move':
          return controls.allowUserMoving && !controls.isLocked;
        case 'delete':
          return controls.canBeDeleted && !controls.isMandatory && !controls.isLocked;
        case 'mandatory':
          return controls.isMandatory;
        case 'locked':
          return controls.isLocked;
        default:
          return false;
      }
    } catch (error) {
      strapi.log.error(`Failed to check widget permissions for ${widgetType}:`, error.message);
      return false;
    }
  },

  // Get all mandatory widgets
  async getMandatoryWidgets() {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      return await strapi.entityService.findMany('api::widget-management.widget-management', {
        filters: {
          adminControls: {
            isMandatory: true
          }
        },
        populate: ['adminControls', 'defaultPosition', 'defaultSize']
      });
    } catch (error) {
      strapi.log.error('Failed to get mandatory widgets:', error.message);
      return [];
    }
  },

  // Get deletable widgets
  async getDeletableWidgets() {
    try {
      // @ts-ignore - Strapi type system needs regeneration
      return await strapi.entityService.findMany('api::widget-management.widget-management', {
        filters: {
          adminControls: {
            canBeDeleted: true
          }
        },
        populate: ['adminControls', 'defaultPosition', 'defaultSize']
      });
    } catch (error) {
      strapi.log.error('Failed to get deletable widgets:', error.message);
      return [];
    }
  }
}));
