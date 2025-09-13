'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::hashtag.hashtag', ({ strapi }) => ({
  async find(ctx) {
    const hashtags = await strapi.entityService.findMany('api::hashtag.hashtag', {
      sort: { usage_count: 'desc' }
    });

    return { data: hashtags };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    
    const hashtag = await strapi.entityService.findOne('api::hashtag.hashtag', id, {
      populate: ['photos']
    });

    if (!hashtag) {
      return ctx.notFound('Hashtag not found');
    }

    return { data: hashtag };
  },

  async getTrending(ctx) {
    const { limit = 20 } = ctx.query;
    
    const hashtags = await strapi.entityService.findMany('api::hashtag.hashtag', {
      filters: { is_trending: true },
      sort: { usage_count: 'desc' },
      limit: parseInt(limit)
    });

    return { data: hashtags };
  },

  async getPopular(ctx) {
    const { limit = 50 } = ctx.query;
    
    const hashtags = await strapi.entityService.findMany('api::hashtag.hashtag', {
      sort: { usage_count: 'desc' },
      limit: parseInt(limit)
    });

    return { data: hashtags };
  },

  async createOrFind(ctx) {
    const { name } = ctx.request.body;

    if (!name) {
      return ctx.badRequest('Hashtag name is required');
    }

    try {
      // Normalize hashtag name (remove # if present, lowercase)
      const normalizedName = name.replace(/^#/, '').toLowerCase();
      
      // Check if hashtag already exists
      let hashtag = await strapi.entityService.findMany('api::hashtag.hashtag', {
        filters: { name: normalizedName }
      });

      if (hashtag && hashtag.length > 0) {
        // Increment usage count
        hashtag = await strapi.entityService.update('api::hashtag.hashtag', hashtag[0].id, {
          data: { usage_count: (hashtag[0].usage_count || 0) + 1 }
        });
      } else {
        // Create new hashtag
        hashtag = await strapi.entityService.create('api::hashtag.hashtag', {
          data: {
            name: normalizedName,
            usage_count: 1
          }
        });
      }

      return { data: hashtag };
    } catch (error) {
      console.error('Error creating/finding hashtag:', error);
      return ctx.badRequest('Failed to create/find hashtag');
    }
  }
}));
