'use strict';

module.exports = {
  async list(ctx) {
    try {
      const entries = await strapi.db
        .query('api::transport-status.transport-status')
        .findMany({
          where: { publishedAt: { $notNull: true } },
          orderBy: { Order: 'asc' },
        });
      ctx.body = { data: entries };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to load transport status' };
    }
  },
};


