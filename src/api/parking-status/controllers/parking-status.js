'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::parking-lot.parking-lot', ({ strapi }) => ({
  async list(ctx) {
    try {
      const entries = await strapi.entityService.findMany('api::parking-lot.parking-lot', {
        sort: { Order: 'asc' },
        filters: { publishedAt: { $notNull: true } },
      });
      ctx.body = { data: entries };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to load parking status' };
    }
  },
}));


