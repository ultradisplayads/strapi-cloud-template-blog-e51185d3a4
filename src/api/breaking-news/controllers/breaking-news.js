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
      // Try to find by documentId first, then by id
      let article = await strapi.db.query('api::breaking-news.breaking-news').findOne({
        where: { documentId: id }
      });
      
      if (!article) {
        article = await strapi.entityService.findOne('api::breaking-news.breaking-news', id);
      }
      
      if (!article) {
        return ctx.throw(404, 'Article not found');
      }
      
      const updatedArticle = await strapi.entityService.update('api::breaking-news.breaking-news', article.id, {
        data: {
          upvotes: (article.upvotes || 0) + 1,
          voteScore: ((article.upvotes || 0) + 1) - (article.downvotes || 0)
        }
      });
      
      ctx.body = { data: updatedArticle, message: 'Article upvoted' };
    } catch (error) {
      strapi.log.error('Upvote error:', error);
      ctx.throw(400, error.message);
    }
  },

  async downvote(ctx) {
    const { id } = ctx.params;
    
    try {
      // Try to find by documentId first, then by id
      let article = await strapi.db.query('api::breaking-news.breaking-news').findOne({
        where: { documentId: id }
      });
      
      if (!article) {
        article = await strapi.entityService.findOne('api::breaking-news.breaking-news', id);
      }
      
      if (!article) {
        return ctx.throw(404, 'Article not found');
      }
      
      const updatedArticle = await strapi.entityService.update('api::breaking-news.breaking-news', article.id, {
        data: {
          downvotes: (article.downvotes || 0) + 1,
          voteScore: (article.upvotes || 0) - ((article.downvotes || 0) + 1)
        }
      });
      
      ctx.body = { data: updatedArticle, message: 'Article downvoted' };
    } catch (error) {
      strapi.log.error('Downvote error:', error);
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
      // Get the dynamic article limit from settings
      let maxArticleLimit = 21; // Default fallback
      try {
        const settingsResponse = await strapi.entityService.findOne('api::news-settings.news-settings', 1);
        if (settingsResponse && settingsResponse.maxArticleLimit) {
          maxArticleLimit = settingsResponse.maxArticleLimit;
        }
      } catch (settingsError) {
        console.log('Could not fetch settings, using default limit:', maxArticleLimit);
      }

      // Get all breaking news articles (include both published and draft for now)
      const entries = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters: {
          // Only filter out explicitly hidden items
          $or: [
            { isHidden: { $null: true } },
            { isHidden: false }
          ]
        },
        populate: '*',
        sort: [
          { IsBreaking: 'desc' },  // Breaking news first
          { createdAt: 'desc' }    // Then by newest
        ],
        limit: maxArticleLimit
      });

      // Debug logging (can be removed in production)
      console.log(`Live feed: ${entries.length} total entries found`);

      // Get active sponsored posts
      const sponsoredPosts = await strapi.entityService.findMany('api::sponsored-post.sponsored-post', {
        filters: {
          IsActive: true,
          $or: [
            { CampaignEndDate: { $null: true } },
            { CampaignEndDate: { $gte: new Date() } }
          ]
        },
        populate: '*',
        sort: [{ Priority: 'asc' }]
      });

      console.log(`Found ${sponsoredPosts.length} active sponsored posts`);

      // Separate breaking news into regular news, pinned news, and sponsored posts
      const regularNews = [];
      const pinnedNews = [];
      const sponsoredFromBreaking = [];

      entries.forEach(entry => {
        // Check if this breaking news item should be treated as sponsored
        if (entry.SponsoredPost && entry.sponsorName) {
          sponsoredFromBreaking.push({
            id: entry.id,
            documentId: entry.documentId,
            title: entry.Title,
            summary: entry.Summary,
            content: entry.Summary,
            url: entry.URL,
            image: entry.FeaturedImage,
            imageAlt: entry.ImageAlt,
            imageCaption: entry.ImageCaption,
            author: null,
            category: 'Sponsored',
            isBreaking: false, // Sponsored posts are not breaking news in feed
            sponsorName: entry.sponsorName,
            sponsorLogo: null,
            logo: null,
            upvotes: entry.upvotes || 0,
            downvotes: entry.downvotes || 0,
            isPinned: entry.isPinned || false,
            displayPosition: 'position-3', // Default position for sponsored breaking news
            publishedAt: entry.publishedAt,
            createdAt: entry.createdAt,
            type: 'sponsored'
          });
        } else {
          const newsItem = {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.Title,
            summary: entry.Summary,
            content: entry.Summary,
            url: entry.URL,
            image: entry.FeaturedImage,
            imageAlt: entry.ImageAlt,
            imageCaption: entry.ImageCaption,
            author: null,
            category: entry.Category,
            isBreaking: entry.IsBreaking,
            publishedAt: entry.publishedAt,
            createdAt: entry.createdAt,
            upvotes: entry.upvotes || 0,
            downvotes: entry.downvotes || 0,
            isPinned: entry.isPinned || false,
            type: 'news'
          };
          
          // Separate pinned and regular news
          if (entry.isPinned) {
            pinnedNews.push(newsItem);
          } else {
            regularNews.push(newsItem);
          }
        }
      });

      const transformedEntries = regularNews;

      // Transform dedicated sponsored posts
      const transformedSponsored = sponsoredPosts.map(post => ({
        id: post.id,
        documentId: post.documentId,
        title: post.Title,
        summary: post.Summary,
        content: post.Summary,
        url: post.TargetURL,
        image: post['Image'] && post['Image'].url ? post['Image'].url : null,
        author: null,
        category: 'Sponsored',
        isBreaking: false,
        sponsorName: post.SponsorName,
        sponsorLogo: post['SponsorLogo'] && post['SponsorLogo'].url ? post['SponsorLogo'].url : null,
        logo: post['Logo'] && post['Logo'].url ? post['Logo'].url : null,
        upvotes: 0,
        downvotes: 0,
        isPinned: false,
        displayPosition: post.DisplayPosition,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        type: 'sponsored'
      }));

      // Combine all sponsored posts (dedicated + breaking news marked as sponsored)
      const allSponsoredPosts = [...transformedSponsored, ...sponsoredFromBreaking];

      // Insert sponsored posts at specified positions
      let finalEntries = [...transformedEntries];
      
      allSponsoredPosts.forEach(sponsored => {
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
        pinnedNews: pinnedNews,
        meta: {
          total: finalEntries.length,
          newsCount: transformedEntries.length,
          sponsoredCount: allSponsoredPosts.length,
          breakingCount: transformedEntries.filter(entry => entry.isBreaking).length,
          pinnedCount: pinnedNews.length
        }
      };
    } catch (error) {
      strapi.log.error('Error in live endpoint:', error);
      ctx.throw(500, 'Failed to fetch live breaking news');
    }
  },

}));
