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
          isPinned: true
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
          isPinned: false
        }
      });
      
      ctx.body = { data: article, message: 'Article unpinned successfully' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Simple voting system with user tracking
  async upvote(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user?.id || 'anonymous';
    
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
      
      // Get current user votes
      const userVotes = article.userVotes || {};
      const currentUserVote = userVotes[userId];
      
      let newUpvotes = article.upvotes || 0;
      let newDownvotes = article.downvotes || 0;
      let newUserVotes = { ...userVotes };
      
      if (currentUserVote === 'upvote') {
        // Already upvoted, remove vote
        newUpvotes = Math.max(0, newUpvotes - 1);
        delete newUserVotes[userId];
      } else if (currentUserVote === 'downvote') {
        // Switch from downvote to upvote
        newDownvotes = Math.max(0, newDownvotes - 1);
        newUpvotes = newUpvotes + 1;
        newUserVotes[userId] = 'upvote';
      } else {
        // First time voting up
        newUpvotes = newUpvotes + 1;
        newUserVotes[userId] = 'upvote';
      }
      
      const updatedArticle = await strapi.entityService.update('api::breaking-news.breaking-news', article.id, {
        data: {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          voteScore: newUpvotes - newDownvotes,
          userVotes: newUserVotes
        }
      });
      
      ctx.body = { 
        data: updatedArticle, 
        message: currentUserVote === 'upvote' ? 'Vote removed' : 'Article upvoted',
        userVote: newUserVotes[userId] || null
      };
    } catch (error) {
      strapi.log.error('Upvote error:', error);
      ctx.throw(400, error.message);
    }
  },

  async downvote(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user?.id || 'anonymous';
    
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
      
      // Get current user votes
      const userVotes = article.userVotes || {};
      const currentUserVote = userVotes[userId];
      
      let newUpvotes = article.upvotes || 0;
      let newDownvotes = article.downvotes || 0;
      let newUserVotes = { ...userVotes };
      
      if (currentUserVote === 'downvote') {
        // Already downvoted, remove vote
        newDownvotes = Math.max(0, newDownvotes - 1);
        delete newUserVotes[userId];
      } else if (currentUserVote === 'upvote') {
        // Switch from upvote to downvote
        newUpvotes = Math.max(0, newUpvotes - 1);
        newDownvotes = newDownvotes + 1;
        newUserVotes[userId] = 'downvote';
      } else {
        // First time voting down
        newDownvotes = newDownvotes + 1;
        newUserVotes[userId] = 'downvote';
      }
      
      const updatedArticle = await strapi.entityService.update('api::breaking-news.breaking-news', article.id, {
        data: {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          voteScore: newUpvotes - newDownvotes,
          userVotes: newUserVotes
        }
      });
      
      ctx.body = { 
        data: updatedArticle, 
        message: currentUserVote === 'downvote' ? 'Vote removed' : 'Article downvoted',
        userVote: newUserVotes[userId] || null
      };
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
      // Get the dynamic article settings from news-settings
      let maxArticleLimit = 21; // Default fallback
      let maxArticleAgeHours = 24; // Default fallback
      let preservePinned = true;
      let preserveBreaking = true;
      
      try {
        const settingsResponse = await strapi.entityService.findOne('api::news-settings.news-settings', 1);
        if (settingsResponse) {
          maxArticleLimit = settingsResponse.maxArticleLimit || 21;
          maxArticleAgeHours = settingsResponse.maxArticleAgeHours || 24;
          preservePinned = settingsResponse.preservePinnedArticles !== false;
          preserveBreaking = settingsResponse.preserveBreakingNews !== false;
        }
      } catch (settingsError) {
        console.log('Could not fetch settings, using defaults:', { maxArticleLimit, maxArticleAgeHours });
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
            userVote: entry.userVotes?.[ctx.state.user?.id || 'anonymous'] || null,
            type: 'news'
          };
          
          // Separate pinned and regular news - CRITICAL: Don't duplicate items
          if (entry.isPinned) {
            pinnedNews.push(newsItem);
          } else {
            regularNews.push(newsItem);
          }
        }
      });

      // Return ONLY regular news in the main data array
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
          pinnedCount: pinnedNews.length,
          settings: {
            maxArticleLimit,
            maxArticleAgeHours,
            preservePinned,
            preserveBreaking
          }
        }
      };
    } catch (error) {
      strapi.log.error('Error in live endpoint:', error);
      ctx.throw(500, 'Failed to fetch live breaking news');
    }
  },

  // Admin endpoint to manually trigger cleanup based on settings
  async cleanup(ctx) {
    try {
      // Get cleanup settings
      const settings = await strapi.entityService.findOne('api::news-settings.news-settings', 1);
      if (!settings) {
        return ctx.throw(404, 'News settings not found');
      }

      const {
        maxArticleLimit = 21,
        maxArticleAgeHours = 24,
        cleanupMode = 'both_count_and_age',
        preservePinnedArticles = true,
        preserveBreakingNews = true
      } = settings;

      let deletedCount = 0;
      const deletedArticles = [];

      // Calculate cutoff date for age-based cleanup
      const cutoffDate = new Date(Date.now() - (maxArticleAgeHours * 60 * 60 * 1000));

      // Build filters based on cleanup mode and preservation settings
      let filters = {
        $or: [
          { isHidden: { $null: true } },
          { isHidden: false }
        ]
      };

      // Add preservation filters
      if (preservePinnedArticles) {
        filters.isPinned = { $ne: true };
      }
      if (preserveBreakingNews) {
        filters.IsBreaking = { $ne: true };
      }

      // Get articles to potentially delete
      const allArticles = await strapi.entityService.findMany('api::breaking-news.breaking-news', {
        filters,
        sort: [{ createdAt: 'asc' }], // Oldest first
        populate: '*'
      });

      let articlesToDelete = [];

      if (cleanupMode === 'count_only') {
        // Delete oldest articles if we exceed the limit
        if (allArticles.length > maxArticleLimit) {
          articlesToDelete = allArticles.slice(0, allArticles.length - maxArticleLimit);
        }
      } else if (cleanupMode === 'age_only') {
        // Delete articles older than the specified hours
        articlesToDelete = allArticles.filter(article => 
          new Date(article.createdAt) < cutoffDate
        );
      } else if (cleanupMode === 'both_count_and_age') {
        // Delete articles that are either too old OR if we exceed the count limit
        const tooOld = allArticles.filter(article => 
          new Date(article.createdAt) < cutoffDate
        );
        
        if (allArticles.length > maxArticleLimit) {
          const excessCount = allArticles.length - maxArticleLimit;
          const oldestArticles = allArticles.slice(0, excessCount);
          articlesToDelete = [...new Set([...tooOld, ...oldestArticles])];
        } else {
          articlesToDelete = tooOld;
        }
      }

      // Delete the articles
      for (const article of articlesToDelete) {
        try {
          await strapi.entityService.delete('api::breaking-news.breaking-news', article.id);
          deletedCount++;
          deletedArticles.push({
            id: article.id,
            title: article.Title,
            createdAt: article.createdAt,
            isPinned: article.isPinned,
            IsBreaking: article.IsBreaking
          });
        } catch (deleteError) {
          strapi.log.error(`Failed to delete article ${article.id}:`, deleteError);
        }
      }

      // Update cleanup stats
      const currentStats = settings.cleanupStats || { totalDeleted: 0, lastDeletedCount: 0, lastCleanupDate: null };
      const updatedStats = {
        totalDeleted: currentStats.totalDeleted + deletedCount,
        lastDeletedCount: deletedCount,
        lastCleanupDate: new Date().toISOString()
      };

      await strapi.entityService.update('api::news-settings.news-settings', 1, {
        data: {
          lastCleanupRun: new Date(),
          cleanupStats: updatedStats
        }
      });

      ctx.body = {
        success: true,
        message: `Cleanup completed: ${deletedCount} articles deleted`,
        deletedCount,
        deletedArticles,
        settings: {
          maxArticleLimit,
          maxArticleAgeHours,
          cleanupMode,
          preservePinnedArticles,
          preserveBreakingNews
        },
        stats: updatedStats
      };

    } catch (error) {
      strapi.log.error('Cleanup error:', error);
      ctx.throw(500, error.message);
    }
  }

}));
