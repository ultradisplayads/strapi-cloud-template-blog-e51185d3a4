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
    const { status, pinned, hidden, sort = 'createdAt:desc' } = ctx.query;
    
    try {
      const filters = {};
      
      if (status) filters.moderationStatus = status;
      if (pinned !== undefined) filters.isPinned = pinned === 'true';
      if (hidden !== undefined) filters.isHidden = hidden === 'true';

      const articles = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters,
        sort: sort ? [sort] : ['createdAt:desc'],
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
      // Get all published breaking news articles
      const entries = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters: {
          publishedAt: { $notNull: true },
          isHidden: { $ne: true }
        },
        populate: '*',
        sort: [
          { IsBreaking: 'desc' },  // Breaking news first
          { createdAt: 'desc' }    // Then by newest
        ],
        limit: 50
      });

      // Get active sponsored posts
      const sponsoredPosts = await strapi.entityService.findMany('api::sponsored-post.sponsored-post', {
        filters: {
          publishedAt: { $notNull: true },
          IsActive: true,
          $or: [
            { CampaignEndDate: { $null: true } },
            { CampaignEndDate: { $gte: new Date() } }
          ]
        },
        populate: '*',
        sort: [{ Priority: 'asc' }]
      });

      // Transform breaking news data
      const transformedEntries = entries.map(entry => ({
        id: entry.id,
        documentId: entry.documentId,
        title: entry.Title,
        summary: entry.Summary,
        content: entry.Summary, // Use Summary as content for breaking news
        url: entry.URL,
        image: null, // Breaking news schema doesn't have Image field
        author: null, // Breaking news schema doesn't have Author field
        category: entry.Category,
        isBreaking: entry.IsBreaking,
        publishedAt: entry.publishedAt,
        createdAt: entry.createdAt,
        upvotes: entry.upvotes || 0,
        downvotes: entry.downvotes || 0,
        isPinned: entry.isPinned || false,
        type: 'news'
      }));

      // Transform sponsored posts
      const transformedSponsored = sponsoredPosts.map(post => ({
        id: post.id,
        documentId: post.documentId,
        title: post.Title,
        summary: post.Summary,
        content: post.Summary, // Use Summary as content for sponsored posts
        url: post.TargetURL,
        image: post.Image && post.Image.url ? post.Image.url : null,
        author: null, // No author for sponsored posts
        category: 'Sponsored', // Mark as sponsored category
        isBreaking: false, // Sponsored posts are not breaking news
        sponsorName: post.SponsorName,
        sponsorLogo: post.SponsorLogo && post.SponsorLogo.url ? post.SponsorLogo.url : null,
        logo: post.Logo && post.Logo.url ? post.Logo.url : null,
        upvotes: 0,
        downvotes: 0,
        isPinned: false,
        displayPosition: post.DisplayPosition,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        type: 'sponsored'
      }));

      // Insert sponsored posts at specified positions
      let finalEntries = [...transformedEntries];
      
      transformedSponsored.forEach(sponsored => {
        let insertPosition;
        switch (sponsored.displayPosition) {
          case 'top':
            insertPosition = 0;
            break;
          case 'position-3':
            insertPosition = Math.min(2, finalEntries.length);
            break;
          case 'position-5':
            insertPosition = Math.min(4, finalEntries.length);
            break;
          case 'bottom':
            insertPosition = finalEntries.length;
            break;
          default:
            insertPosition = Math.min(2, finalEntries.length);
        }
        
        finalEntries.splice(insertPosition, 0, sponsored);
      });

      ctx.body = {
        data: finalEntries,
        meta: {
          total: finalEntries.length,
          newsCount: transformedEntries.length,
          sponsoredCount: transformedSponsored.length,
          breakingCount: transformedEntries.filter(entry => entry.isBreaking).length
        }
      };
    } catch (error) {
      strapi.log.error('Error in live endpoint:', error);
      ctx.throw(500, 'Failed to fetch live breaking news');
    }
  },

  // Get widget configuration for sponsored display
  async getWidgetConfig(ctx) {
    try {
      const { id } = ctx.params;
      
      const entry = await strapi.entityService.findOne('api::breaking-news.breaking-news', id, {
        populate: '*'
      });

      if (!entry) {
        return ctx.throw(404, 'Breaking news entry not found');
      }

      ctx.body = {
        data: {
          id: entry.id,
          isSponsoredWidget: entry.isSponsoredWidget || false,
          sponsorName: entry.sponsorName || null,
          sponsorBanner: entry.sponsorBanner || null
        }
      };
    } catch (error) {
      strapi.log.error('Error in getWidgetConfig:', error);
      ctx.throw(500, 'Failed to fetch widget configuration');
    }
  },

  // Update widget configuration for sponsored display
  async updateWidgetConfig(ctx) {
    try {
      const { id } = ctx.params;
      const { isSponsoredWidget, sponsorName, sponsorBanner } = ctx.request.body;

      const updatedEntry = await strapi.entityService.update('api::breaking-news.breaking-news', id, {
        data: {
          isSponsoredWidget: isSponsoredWidget || false,
          sponsorName: isSponsoredWidget ? sponsorName : null,
          sponsorBanner: isSponsoredWidget && sponsorName ? `Latest Updates, brought to you by ${sponsorName}` : null
        }
      });

      ctx.body = {
        data: {
          id: updatedEntry.id,
          isSponsoredWidget: updatedEntry.isSponsoredWidget,
          sponsorName: updatedEntry.sponsorName,
          sponsorBanner: updatedEntry.sponsorBanner
        }
      };
    } catch (error) {
      strapi.log.error('Error in updateWidgetConfig:', error);
      ctx.throw(500, 'Failed to update widget configuration');
    }
  },
}));
