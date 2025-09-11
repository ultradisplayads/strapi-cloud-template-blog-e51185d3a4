'use strict';

/**
 * social-feed controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::social-media-post.social-media-post', ({ strapi }) => ({
  // Get live social feed with keyword filtering
  async live(ctx) {
    try {
      const { 
        keywords = 'Pattaya,Thailand,Beach,Nightlife,Food,Tourism',
        limit = 20,
        platform = 'all',
        category = 'all',
        featured = false
      } = ctx.query;

      // Parse keywords
      const keywordArray = String(keywords).split(',').map(k => k.trim().toLowerCase());
      
      // Build filters
      const filters = {
        IsActive: true,
        $or: [
          { Content: { $containsi: keywordArray[0] } }, // Primary keyword
          { Hashtags: { $containsi: keywordArray[0] } },
          { Location: { $containsi: keywordArray[0] } }
        ]
      };

      // Add additional keyword filters
      if (keywordArray.length > 1) {
        const additionalKeywords = keywordArray.slice(1);
        additionalKeywords.forEach(keyword => {
          filters.$or.push(
            { Content: { $containsi: keyword } },
            { Hashtags: { $containsi: keyword } },
            { Location: { $containsi: keyword } }
          );
        });
      }

      // Platform filter
      if (platform !== 'all') {
        filters.Platform = platform;
      }

      // Category filter
      if (category !== 'all') {
        filters.Category = category;
      }

      // Featured filter
      if (featured === 'true') {
        filters.Featured = true;
      }

      // Get posts
      const posts = await strapi.entityService.findMany('api::social-media-post.social-media-post', {
        filters,
        populate: ['Avatar', 'Image'],
        sort: [
          { Featured: 'desc' },
          { Timestamp: 'desc' }
        ],
        limit: parseInt(String(limit))
      });

      // Get stats
      const stats = await this.getSocialStats.call(this, keywordArray);

      ctx.body = {
        data: {
          posts,
          stats,
          keywords: keywordArray,
          lastUpdated: new Date().toISOString(),
          totalPosts: posts.length
        }
      };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get social media statistics
  async getSocialStats(keywords) {
    try {
      const keywordFilters = keywords.map(keyword => ({
        $or: [
          { Content: { $containsi: keyword } },
          { Hashtags: { $containsi: keyword } },
          { Location: { $containsi: keyword } }
        ]
      }));

      const allPosts = await strapi.entityService.findMany('api::social-media-post.social-media-post', {
        filters: {
          IsActive: true,
          $or: keywordFilters
        }
      });

      const stats = {
        totalPosts: allPosts.length,
        totalLikes: allPosts.reduce((sum, post) => sum + (post.Likes || 0), 0),
        totalComments: allPosts.reduce((sum, post) => sum + (post.Comments || 0), 0),
        totalShares: allPosts.reduce((sum, post) => sum + (post.Shares || 0), 0),
        platforms: {},
        categories: {},
        recentActivity: 0
      };

      // Calculate platform distribution
      allPosts.forEach(post => {
        const platform = post.Platform;
        stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
      });

      // Calculate category distribution
      allPosts.forEach(post => {
        if (post.Category) {
          const category = post.Category;
          stats.categories[category] = (stats.categories[category] || 0) + 1;
        }
      });

      // Calculate recent activity (posts from last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      stats.recentActivity = allPosts.filter(post => 
        post.Timestamp && new Date(post.Timestamp) > oneDayAgo
      ).length;

      return stats;
    } catch (error) {
      strapi.log.error('Failed to get social stats:', error.message);
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        platforms: {},
        categories: {},
        recentActivity: 0
      };
    }
  },

  // Get trending hashtags
  async trending(ctx) {
    try {
      const { limit = 10 } = ctx.query;
      
      const posts = await strapi.entityService.findMany('api::social-media-post.social-media-post', {
        filters: {
          IsActive: true,
          Hashtags: { $notNull: true }
        },
        sort: { Timestamp: 'desc' },
        limit: 100 // Get more posts to analyze hashtags
      });

      // Extract and count hashtags
      const hashtagCounts = {};
      posts.forEach(post => {
        if (post.Hashtags && Array.isArray(post.Hashtags)) {
          post.Hashtags.forEach(hashtag => {
            const cleanHashtag = String(hashtag).toLowerCase().replace('#', '');
            hashtagCounts[cleanHashtag] = (hashtagCounts[cleanHashtag] || 0) + 1;
          });
        }
      });

      // Sort and return top hashtags
      const trending = Object.entries(hashtagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, parseInt(String(limit)))
        .map(([hashtag, count]) => ({ hashtag, count }));

      ctx.body = { data: trending };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get posts by platform
  async byPlatform(ctx) {
    try {
      const { platform } = ctx.params;
      const { limit = 10 } = ctx.query;

      const posts = await strapi.entityService.findMany('api::social-media-post.social-media-post', {
        filters: {
          Platform: platform,
          IsActive: true
        },
        populate: ['Avatar', 'Image'],
        sort: { Timestamp: 'desc' },
        limit: parseInt(String(limit))
      });

      ctx.body = { data: posts };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Search posts
  async search(ctx) {
    try {
      const { q, platform, category, limit = 20 } = ctx.query;

      if (!q) {
        return ctx.throw(400, 'Search query is required');
      }

      const filters = {
        IsActive: true,
        $or: [
          { Content: { $containsi: String(q) } },
          { Hashtags: { $containsi: String(q) } },
          { Location: { $containsi: String(q) } },
          { Author: { $containsi: String(q) } }
        ]
      };

      if (platform && platform !== 'all') {
        filters.Platform = platform;
      }

      if (category && category !== 'all') {
        filters.Category = category;
      }

      const posts = await strapi.entityService.findMany('api::social-media-post.social-media-post', {
        // @ts-ignore
        filters: filters,
        populate: ['Avatar', 'Image'],
        sort: { Timestamp: 'desc' },
        limit: parseInt(String(limit))
      });

      ctx.body = { data: posts };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Manually trigger fetching new posts (with force refresh)
  async fetchNew(ctx) {
    try {
      const socialFeedService = strapi.service('api::social-feed.social-feed');
      const { keywords = ['Pattaya'], forceRefresh = true } = ctx.request.body || {};
      
      const newPosts = await socialFeedService.aggregatePosts(keywords, forceRefresh);
      
      ctx.body = {
        data: {
          message: `Successfully fetched ${newPosts.length} new posts from Twitter`,
          posts: newPosts,
          timestamp: new Date().toISOString(),
          cached: !forceRefresh,
          source: 'Twitter'
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // Get scheduler status
  async status(ctx) {
    try {
      const schedulerService = strapi.service('api::social-feed.social-feed-scheduler');
      const status = schedulerService.getStatus();
      
      ctx.body = { data: status };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
}));
