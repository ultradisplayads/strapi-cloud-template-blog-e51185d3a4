'use strict';

/**
 * business controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::business.business', ({ strapi }) => ({
  // Override create to add owner
  async create(ctx) {
    const { user } = ctx.state;
    if (!user) {
      return ctx.unauthorized('Not authenticated');
    }
    
    const data = ctx.request.body;
    data.owner = user.id;
    
    const business = await strapi.entityService.create('api::business.business', {
      data,
      populate: ['categories', 'images', 'logo', 'coverImage']
    });
    
    return business;
  },

  // Override update to check ownership
  async update(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;
    
    if (!user) {
      return ctx.unauthorized('Not authenticated');
    }
    
    // Check if user owns this business
    const existingBusiness = await strapi.entityService.findOne('api::business.business', id);
    if (!existingBusiness || existingBusiness.owner !== user.id) {
      return ctx.forbidden('Not authorized to update this business');
    }
    
    const data = ctx.request.body;
    data.owner = user.id; // Ensure owner stays the same
    
    const business = await strapi.entityService.update('api::business.business', id, {
      data,
      populate: ['categories', 'images', 'logo', 'coverImage']
    });
    
    return business;
  },

  // Override find to handle owner filtering
  async find(ctx) {
    const { user } = ctx.state;
    const { filters } = ctx.query;
    
    // If user is authenticated and requesting their own businesses
    if (user && filters?.owner === 'me') {
      ctx.query.filters = {
        ...ctx.query.filters,
        owner: user.id
      };
      delete ctx.query.filters.owner; // Remove the 'me' filter
    }
    
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  }
}));
