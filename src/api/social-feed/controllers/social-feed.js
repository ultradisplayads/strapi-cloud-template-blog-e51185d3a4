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
  },

  // Simple endpoint to fetch 1 post from Twitter directly (no caching)
  async fetchOne(ctx) {
    try {
      strapi.log.info('Fetching 1 post from Twitter API directly...');
      
      const socialFeedService = strapi.service('api::social-feed.social-feed');
      
      // Fetch directly from Twitter API without any caching
      const twitterPosts = await socialFeedService.fetchFromTwitter(['Pattaya']);
      
      if (twitterPosts && twitterPosts.length > 0) {
        // Take only the first post
        const post = twitterPosts[0];
        
        // Transform to match frontend expectations
        const transformedPost = {
          id: post.id,
          Platform: post.Platform,
          Author: post.Author,
          Handle: post.Handle,
          Content: post.Content,
          Timestamp: post.Timestamp,
          Likes: post.Likes,
          Comments: post.Comments,
          Shares: post.Shares,
          Location: post.Location,
          Verified: post.Verified,
          Hashtags: post.Hashtags,
          URL: post.URL,
          Category: post.Category,
          Avatar: null, // No avatar for now
          Image: null   // No image for now
        };
        
        strapi.log.info(`Successfully fetched 1 Twitter post: ${post.Author} - ${post.Content.substring(0, 50)}...`);
        
        ctx.body = {
          data: {
            posts: [transformedPost],
            stats: {
              totalPosts: 1,
              totalLikes: post.Likes,
              totalComments: post.Comments,
              totalShares: post.Shares
            },
            source: 'Twitter API',
            timestamp: new Date().toISOString()
          }
        };
      } else {
        strapi.log.warn('No Twitter posts found, returning fallback data');
        
        // Return fallback data
        const fallbackPost = {
          id: 'fallback_' + Date.now(),
          Platform: 'twitter',
          Author: 'Pattaya Explorer',
          Handle: '@pattaya_explorer',
          Content: 'Just discovered an amazing hidden beach in Pattaya! The water is crystal clear and perfect for snorkeling 🏖️ #Pattaya #Thailand #Beach',
          Timestamp: new Date(),
          Likes: 45,
          Comments: 8,
          Shares: 12,
          Location: 'Pattaya, Thailand',
          Verified: true,
          Hashtags: ['Pattaya', 'Thailand', 'Beach', 'Snorkeling'],
          URL: 'https://twitter.com/pattaya_explorer/status/1234567890',
          Category: 'Tourism',
          Avatar: null,
          Image: null
        };
        
        ctx.body = {
          data: {
            posts: [fallbackPost],
            stats: {
              totalPosts: 1,
              totalLikes: fallbackPost.Likes,
              totalComments: fallbackPost.Comments,
              totalShares: fallbackPost.Shares
            },
            source: 'Fallback Data',
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      strapi.log.error('Failed to fetch Twitter post:', error.message);
      ctx.throw(500, `Failed to fetch Twitter post: ${error.message}`);
    }
  },

  // Enhanced social feed with new data model
  async enhanced(ctx) {
    try {
      const { 
        keywords = 'Pattaya,Thailand,Beach,Nightlife,Food,Tourism',
        limit = 20,
        platform = 'all',
        category = 'all',
        status = 'Approved'
      } = ctx.query;

      // Parse keywords
      const keywordArray = String(keywords).split(',').map(k => k.trim().toLowerCase());
      
      // Build filters for new social-posts collection
      const filters = {
        status: status,
        $or: [
          { post_text: { $containsi: keywordArray[0] } },
          { hashtags: { $containsi: keywordArray[0] } },
          { location: { $containsi: keywordArray[0] } }
        ]
      };

      // Add additional keyword filters
      if (keywordArray.length > 1) {
        const additionalKeywords = keywordArray.slice(1);
        additionalKeywords.forEach(keyword => {
          filters.$or.push(
            { post_text: { $containsi: keyword } },
            { hashtags: { $containsi: keyword } },
            { location: { $containsi: keyword } }
          );
        });
      }

      // Platform filter
      if (platform !== 'all') {
        filters.source_platform = platform;
      }

      // Category filter
      if (category !== 'all') {
        filters.category = category;
      }

      // Get posts from new collection
      const posts = await strapi.entityService.findMany('api::social-posts.social-post', {
        filters,
        populate: ['mentioned_business', 'engagement_metrics', 'ai_analysis'],
        sort: [
          { featured: 'desc' },
          { timestamp: 'desc' }
        ],
        limit: parseInt(String(limit))
      });

      // Get enhanced stats
      const stats = await this.getEnhancedStats.call(this, keywordArray);

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

  // Get available categories
  async categories(ctx) {
    try {
      const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'Nightlife', label: 'Nightlife' },
        { value: 'Food & Drink', label: 'Food & Drink' },
        { value: 'News & Events', label: 'News & Events' },
        { value: 'Activities & Tours', label: 'Activities & Tours' },
        { value: 'General', label: 'General' }
      ];

      ctx.body = { data: categories };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get trending hashtags from new collection
  async trendingHashtags(ctx) {
    try {
      const { limit = 10 } = ctx.query;
      
      const posts = await strapi.entityService.findMany('api::social-posts.social-post', {
        filters: {
          status: 'Approved',
          hashtags: { $notNull: true }
        },
        sort: { timestamp: 'desc' },
        limit: 100
      });

      // Extract and count hashtags
      const hashtagCounts = {};
      posts.forEach(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach(hashtag => {
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

  // Get posts by business
  async byBusiness(ctx) {
    try {
      const { businessId } = ctx.params;
      const { limit = 10 } = ctx.query;

      const posts = await strapi.entityService.findMany('api::social-posts.social-post', {
        filters: {
          mentioned_business: businessId,
          status: 'Approved'
        },
        populate: ['mentioned_business', 'engagement_metrics'],
        sort: { timestamp: 'desc' },
        limit: parseInt(String(limit))
      });

      ctx.body = { data: posts };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Trigger enhanced aggregation
  async aggregate(ctx) {
    try {
      const { keywords = ['Pattaya'], forceRefresh = false } = ctx.request.body || {};
      
      const enhancedService = strapi.service('api::social-feed.social-feed-enhanced');
      const newPosts = await enhancedService.aggregatePosts(keywords, forceRefresh);
      
      ctx.body = {
        data: {
          message: `Successfully processed ${newPosts.length} posts through enhanced pipeline`,
          posts: newPosts,
          timestamp: new Date().toISOString(),
          source: 'Enhanced Aggregation'
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // Get moderation queue
  async moderationQueue(ctx) {
    try {
      const { status = 'Pending Review', limit = 50 } = ctx.query;

      const posts = await strapi.entityService.findMany('api::social-posts.social-post', {
        filters: { status },
        populate: ['mentioned_business', 'ai_analysis'],
        sort: { processed_at: 'desc' },
        limit: parseInt(String(limit))
      });

      ctx.body = { data: posts };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Moderate a post
  async moderate(ctx) {
    try {
      const { postId } = ctx.params;
      const { action, notes } = ctx.request.body;

      if (!['Approved', 'Rejected', 'Quarantined'].includes(action)) {
        return ctx.throw(400, 'Invalid moderation action');
      }

      const updatedPost = await strapi.entityService.update('api::social-posts.social-post', postId, {
        data: {
          status: action,
          moderation_notes: notes,
          last_updated: new Date()
        }
      });

      ctx.body = { data: updatedPost };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get enhanced statistics
  async getEnhancedStats(keywords) {
    try {
      const keywordFilters = keywords.map(keyword => ({
        $or: [
          { post_text: { $containsi: keyword } },
          { hashtags: { $containsi: keyword } },
          { location: { $containsi: keyword } }
        ]
      }));

      const allPosts = await strapi.entityService.findMany('api::social-posts.social-post', {
        filters: {
          status: 'Approved',
          $or: keywordFilters
        },
        populate: ['engagement_metrics']
      });

      const stats = {
        totalPosts: allPosts.length,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        platforms: {},
        categories: {},
        recentActivity: 0,
        aiAnalysis: {
          totalAnalyzed: 0,
          safeContent: 0,
          englishContent: 0,
          relevantContent: 0
        }
      };

      // Calculate engagement metrics
      allPosts.forEach(post => {
        if (post.engagement_metrics) {
          stats.totalLikes += post.engagement_metrics.likes || 0;
          stats.totalComments += post.engagement_metrics.comments || 0;
          stats.totalShares += post.engagement_metrics.shares || 0;
        }

        // Platform distribution
        const platform = post.source_platform;
        stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;

        // Category distribution
        if (post.category) {
          stats.categories[post.category] = (stats.categories[post.category] || 0) + 1;
        }

        // AI analysis stats
        if (post.ai_analysis) {
          stats.aiAnalysis.totalAnalyzed++;
          if (post.ai_analysis.is_safe) stats.aiAnalysis.safeContent++;
          if (post.ai_analysis.is_english) stats.aiAnalysis.englishContent++;
          if (post.ai_analysis.is_relevant) stats.aiAnalysis.relevantContent++;
        }
      });

      // Calculate recent activity (posts from last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      stats.recentActivity = allPosts.filter(post => 
        post.timestamp && new Date(post.timestamp) > oneDayAgo
      ).length;

      return stats;
    } catch (error) {
      strapi.log.error('Failed to get enhanced stats:', error.message);
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        platforms: {},
        categories: {},
        recentActivity: 0,
        aiAnalysis: {
          totalAnalyzed: 0,
          safeContent: 0,
          englishContent: 0,
          relevantContent: 0
        }
      };
    }
  }
}));
