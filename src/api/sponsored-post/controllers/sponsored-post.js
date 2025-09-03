'use strict';

/**
 * sponsored-post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::sponsored-post.sponsored-post', ({ strapi }) => ({
  // Get active sponsored posts for frontend
  async active(ctx) {
    try {
      const now = new Date();
      
      const posts = await strapi.entityService.findMany('api::sponsored-post.sponsored-post', {
        filters: {
          IsActive: true,
          $or: [
            { CampaignStartDate: { $null: true } },
            { CampaignStartDate: { $lte: now } }
          ],
          $and: [
            {
              $or: [
                { CampaignEndDate: { $null: true } },
                { CampaignEndDate: { $gte: now } }
              ]
            }
          ]
        },
        sort: ['Priority:desc', 'createdAt:desc'],
        populate: ['SponsorLogo', 'Image']
      });
      
      ctx.body = { data: posts };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Track click for analytics
  async trackClick(ctx) {
    const { id } = ctx.params;
    
    try {
      const post = await strapi.entityService.findOne('api::sponsored-post.sponsored-post', id);
      
      if (!post) {
        return ctx.throw(404, 'Sponsored post not found');
      }
      
      await strapi.entityService.update('api::sponsored-post.sponsored-post', id, {
        data: {
          ClickCount: post.ClickCount + 1
        }
      });
      
      ctx.body = { 
        data: { success: true, redirectUrl: post.TargetURL },
        message: 'Click tracked successfully' 
      };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Track impression for analytics
  async trackImpression(ctx) {
    const { id } = ctx.params;
    
    try {
      const post = await strapi.entityService.findOne('api::sponsored-post.sponsored-post', id);
      
      if (!post) {
        return ctx.throw(404, 'Sponsored post not found');
      }
      
      await strapi.entityService.update('api::sponsored-post.sponsored-post', id, {
        data: {
          ImpressionCount: post.ImpressionCount + 1
        }
      });
      
      ctx.body = { data: { success: true }, message: 'Impression tracked' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
}));
