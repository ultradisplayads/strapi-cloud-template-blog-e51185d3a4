'use strict';

/**
 * global-sponsorship controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::global-sponsorship.global-sponsorship', ({ strapi }) => ({
  // Get active global sponsorship for a specific widget
  async getWidgetSponsorship(ctx) {
    try {
      const { widgetType } = ctx.params;
      
      const sponsorship = await strapi.entityService.findMany('api::global-sponsorship.global-sponsorship', {
        filters: { 
          isActive: true,
          'sponsoredWidgets': widgetType
        },
        sort: { createdAt: 'desc' },
        limit: 1
      });

      if (sponsorship.length === 0) {
        return ctx.send({
          data: null,
          message: `No active sponsorship found for ${widgetType} widget`
        });
      }

      return ctx.send({
        data: sponsorship[0]
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}));
