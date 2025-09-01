'use strict';

/**
 * breaking-news controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::breaking-news.breaking-news', ({ strapi }) => ({
  // Pin/Unpin article
  async pin(ctx) {
    const { id } = ctx.params;
    
    try {
      const article = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          isPinned: true,
          pinnedAt: new Date()
        }
      });
      
      ctx.body = { data: article, message: 'Article pinned successfully' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  async unpin(ctx) {
    const { id } = ctx.params;
    
    try {
      const article = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          isPinned: false,
          pinnedAt: null
        }
      });
      
      ctx.body = { data: article, message: 'Article unpinned successfully' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Voting system
  async upvote(ctx) {
    const { id } = ctx.params;
    
    try {
      const article = await strapi.entityService.findOne('api::breaking-news.breaking-news', id);
      
      const updatedArticle = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          upvotes: article.upvotes + 1,
          voteScore: (article.upvotes + 1) - article.downvotes
        }
      });
      
      ctx.body = { data: updatedArticle, message: 'Article upvoted' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  async downvote(ctx) {
    const { id } = ctx.params;
    
    try {
      const article = await strapi.entityService.findOne('api::breaking-news.breaking-news', id);
      
      const updatedArticle = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          downvotes: article.downvotes + 1,
          voteScore: article.upvotes - (article.downvotes + 1)
        }
      });
      
      ctx.body = { data: updatedArticle, message: 'Article downvoted' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Moderation actions
  async approve(ctx) {
    const { id } = ctx.params;
    
    try {
      const article = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          moderationStatus: 'approved',
          publishedAt: new Date()
        }
      });
      
      ctx.body = { data: article, message: 'Article approved' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  async reject(ctx) {
    const { id } = ctx.params;
    
    try {
      const article = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          moderationStatus: 'rejected',
          publishedAt: null
        }
      });
      
      ctx.body = { data: article, message: 'Article rejected' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  async hide(ctx) {
    const { id } = ctx.params;
    
    try {
      const article = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          isHidden: true
        }
      });
      
      ctx.body = { data: article, message: 'Article hidden' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get dashboard data with sorting and filtering
  async dashboard(ctx) {
    const { sort = '-createdAt', status, pinned, hidden } = ctx.query;
    
    try {
      const filters = {};
      
      if (status) filters.moderationStatus = status;
      if (pinned !== undefined) filters.isPinned = pinned === 'true';
      if (hidden !== undefined) filters.isHidden = hidden === 'true';

      const articles = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters,
        sort: [sort],
        populate: '*'
      });
      
      ctx.body = { data: articles };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get live articles for frontend (approved, not hidden, sorted by pinned first)
  async live(ctx) {
    try {
      const articles = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters: {
          moderationStatus: 'approved',
          isHidden: false
        },
        sort: ['-isPinned', '-pinnedAt', '-createdAt'],
        populate: '*'
      });
      
      ctx.body = { data: articles };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
}));
