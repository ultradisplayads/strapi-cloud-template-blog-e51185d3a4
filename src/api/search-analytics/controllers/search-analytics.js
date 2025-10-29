'use strict';

/**
 * search-analytics controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Helper function to get category boost multiplier
 */
function getCategoryBoost(category) {
  const boostMap = {
    'News': 2.0,
    'Events': 1.8,
    'Business': 1.6,
    'Tourism': 1.5,
    'Food': 1.4,
    'Nightlife': 1.3,
    'Entertainment': 1.2,
    'Shopping': 1.1,
    'General': 1.0
  };
  return boostMap[category] || 1.0;
}

/**
 * Helper function to update trending topics collection
 */
async function updateTrendingTopicsCollection(strapi, trendingTopics) {
  try {
    // Clear existing trending topics
    await strapi.entityService.deleteMany(/** @type {any} */ ('api::trending-topic.trending-topic'), {
      filters: { Type: 'topic' }
    });

    // Create new trending topics
    const createPromises = trendingTopics.map((topic, index) => 
      strapi.entityService.create(/** @type {any} */ ('api::trending-topic.trending-topic'), {
        data: {
          Title: topic.query,
          Type: 'topic',
          Posts: topic.searchCount,
          Growth: topic.growthRate,
          Category: topic.category,
          Icon: 'trending',
          Description: `Searched ${topic.searchCount} times`,
          URL: `/search?q=${encodeURIComponent(topic.query)}`,
          IsActive: true,
          Featured: index < 5, // Top 5 are featured
          Rank: index + 1,
          LastUpdated: new Date(),
          hashtag: topic.query,
          duration_hours: 24,
          start_time: new Date()
        }
      })
    );

    await Promise.all(createPromises);
  } catch (error) {
    strapi.log.error('Error updating trending topics collection:', error);
  }
}

module.exports = createCoreController(/** @type {any} */ ('api::search-analytics.search-analytics'), ({ strapi }) => ({
  /**
   * Track a search query
   */
  async track(ctx) {
    try {
      const { query, category = 'General', source = 'unknown', userAgent, sessionId } = ctx.request.body;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return ctx.badRequest('Search query is required and must be a non-empty string');
      }

      const normalizedQuery = query.trim().toLowerCase();
      
      // Skip very short queries or common words
      if (normalizedQuery.length < 2) {
        return ctx.ok({ message: 'Query too short, not tracked' });
      }

      // Common words to skip
      const skipWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
      if (skipWords.includes(normalizedQuery)) {
        return ctx.ok({ message: 'Common word, not tracked' });
      }

      const now = new Date();
      
      // Try to find existing analytics record
      let analyticsRecord = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: { query: normalizedQuery },
        limit: 1
      });

      if (Array.isArray(analyticsRecord) && analyticsRecord.length > 0) {
        // Update existing record
        const existing = /** @type {any} */ (analyticsRecord[0]);
        const updatedTimeWindow = existing.timeWindow || { '24h': 0, '7d': 0, '30d': 0 };
        
        // Increment counts
        updatedTimeWindow['24h'] = (updatedTimeWindow['24h'] || 0) + 1;
        updatedTimeWindow['7d'] = (updatedTimeWindow['7d'] || 0) + 1;
        updatedTimeWindow['30d'] = (updatedTimeWindow['30d'] || 0) + 1;

        // Update search sources
        const searchSources = existing.searchSources || {};
        searchSources[source] = (searchSources[source] || 0) + 1;

        // Update user agents (keep only last 10 for privacy)
        const userAgents = existing.userAgents || [];
        if (userAgent && !userAgents.includes(userAgent)) {
          userAgents.push(userAgent);
          if (userAgents.length > 10) {
            userAgents.shift(); // Remove oldest
          }
        }

        await strapi.entityService.update(/** @type {any} */ ('api::search-analytics.search-analytics'), existing.id, {
          data: /** @type {any} */ ({
            searchCount: existing.searchCount + 1,
            lastSearched: now,
            timeWindow: updatedTimeWindow,
            searchSources,
            userAgents,
            uniqueUsers: existing.uniqueUsers + (sessionId && !existing.sessionData?.includes(sessionId) ? 1 : 0),
            sessionData: sessionId ? [...(existing.sessionData || []), sessionId].slice(-100) : existing.sessionData
          })
        });

        ctx.body = {
          success: true,
          message: 'Search query tracked successfully',
          data: {
            query: normalizedQuery,
            searchCount: existing.searchCount + 1,
            isNew: false
          }
        };
      } else {
        // Create new record
        const newRecord = await strapi.entityService.create(/** @type {any} */ ('api::search-analytics.search-analytics'), {
          data: /** @type {any} */ ({
            query: normalizedQuery,
            searchCount: 1,
            lastSearched: now,
            firstSearched: now,
            category,
            trendingScore: 0,
            uniqueUsers: 1,
            timeWindow: { '24h': 1, '7d': 1, '30d': 1 },
            growthRate: 0,
            isActive: true,
            isTrending: false,
            trendingRank: 0,
            searchSources: { [source]: 1 },
            userAgents: userAgent ? [userAgent] : [],
            sessionData: sessionId ? [sessionId] : []
          })
        });

        ctx.body = {
          success: true,
          message: 'New search query tracked successfully',
          data: {
            query: normalizedQuery,
            searchCount: 1,
            isNew: true,
            id: newRecord.id
          }
        };
      }
    } catch (error) {
      strapi.log.error('Error tracking search query:', error);
      ctx.internalServerError('Failed to track search query');
    }
  },

  /**
   * Get current trending topics
   */
  async getTrending(ctx) {
    try {
      const { limit = 10, category, timeWindow = '24h' } = ctx.query;

      const filters = {
        isActive: true,
        trendingRank: { $gt: 0 }
      };

      if (category && category !== 'all') {
        filters.category = category;
      }

      let trendingTopics = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: /** @type {any} */ (filters),
        sort: { trendingRank: /** @type {any} */ ('asc') },
        limit: parseInt(/** @type {any} */ (limit)),
        populate: '*'
      });

      // If no trending topics found, get any active topics with search count > 0
      if (!Array.isArray(trendingTopics) || trendingTopics.length === 0) {
        trendingTopics = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
          filters: { 
            isActive: true,
            searchCount: { $gt: 0 }
          },
          sort: { searchCount: /** @type {any} */ ('desc') },
          limit: parseInt(/** @type {any} */ (limit))
        });
      }

      // Transform data for frontend
      const transformedTopics = (Array.isArray(trendingTopics) ? trendingTopics : []).map(topic => {
        const topicData = /** @type {any} */ (topic);
        return {
          id: topicData.id,
          title: topicData.query,
          type: 'topic',
          posts: topicData.searchCount,
          growth: topicData.growthRate,
          category: topicData.category,
          icon: 'trending',
          description: `Searched ${topicData.searchCount} times`,
          url: `/search?q=${encodeURIComponent(topicData.query)}`,
          trendingScore: topicData.trendingScore,
          trendingRank: topicData.trendingRank,
          lastSearched: topicData.lastSearched,
          timeWindow: topicData.timeWindow
        };
      });

      ctx.body = {
        success: true,
        data: transformedTopics,
        meta: {
          total: transformedTopics.length,
          timeWindow,
          category: category || 'all'
        }
      };
    } catch (error) {
      strapi.log.error('Error fetching trending topics:', error);
      ctx.internalServerError('Failed to fetch trending topics');
    }
  },

  /**
   * Calculate trending scores for all queries
   */
  async calculateTrending(ctx) {
    try {
      // This endpoint should be called by cron job or admin
      const { force = false } = ctx.query;

      // Get all active search analytics
      const allAnalytics = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: { isActive: true },
        limit: -1
      });

      if (!Array.isArray(allAnalytics)) {
        return ctx.badRequest('No analytics data found');
      }

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate trending scores
      const scoredTopics = allAnalytics.map(analytics => {
        const analyticsData = /** @type {any} */ (analytics);
        const timeWindow = analyticsData.timeWindow || {};
        const recent24h = timeWindow['24h'] || 0;
        const recent7d = timeWindow['7d'] || 0;
        const recent30d = timeWindow['30d'] || 0;

        // Calculate growth rate (comparing 24h to 7d average)
        const avg7d = recent7d / 7;
        const growthRate = avg7d > 0 ? ((recent24h - avg7d) / avg7d) * 100 : 0;

        // Calculate trending score
        // Formula: (Recent Searches × 3) + (Growth Rate × 2) + (Unique Users × 1.5) + (Category Boost × 1.2)
        const categoryBoost = getCategoryBoost(analyticsData.category);
        const trendingScore = (recent24h * 3) + (Math.max(0, growthRate) * 2) + (analyticsData.uniqueUsers * 1.5) + (categoryBoost * 1.2);

        return {
          ...analyticsData,
          growthRate,
          trendingScore,
          lastCalculated: now
        };
      });

      // Sort by trending score and assign ranks
      scoredTopics.sort((a, b) => b.trendingScore - a.trendingScore);
      
      const updatedTopics = scoredTopics.map((topic, index) => ({
        id: topic.id,
        data: {
          trendingScore: topic.trendingScore,
          growthRate: topic.growthRate,
          isTrending: index < 20 && topic.trendingScore > 0, // Top 20 with any score > 0
          trendingRank: index < 20 && topic.trendingScore > 0 ? index + 1 : 0,
          lastCalculated: topic.lastCalculated
        }
      }));

      // Update all records
      const updatePromises = updatedTopics.map(topic => 
        strapi.entityService.update(/** @type {any} */ ('api::search-analytics.search-analytics'), topic.id, /** @type {any} */ (topic.data))
      );

      await Promise.all(updatePromises);

      // Also update the trending-topics collection
      try {
        await updateTrendingTopicsCollection(strapi, updatedTopics.filter(t => t.data.isTrending));
      } catch (error) {
        strapi.log.warn('Failed to update trending topics collection:', error.message);
        // Continue execution even if trending topics collection update fails
      }

      ctx.body = {
        success: true,
        message: 'Trending scores calculated successfully',
        data: {
          totalProcessed: updatedTopics.length,
          trendingCount: updatedTopics.filter(t => t.data.isTrending).length,
          timestamp: now
        }
      };
    } catch (error) {
      strapi.log.error('Error calculating trending scores:', error);
      ctx.internalServerError('Failed to calculate trending scores');
    }
  },

  /**
   * Get analytics dashboard data
   */
  async getStats(ctx) {
    try {
      const { timeWindow = '24h' } = ctx.query;

      // Get basic stats
      const totalSearches = await strapi.entityService.count(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: /** @type {any} */ ({ isActive: true })
      });

      const trendingCount = await strapi.entityService.count(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: /** @type {any} */ ({ isActive: true, isTrending: true })
      });

      // Get top categories - using entityService instead of direct db query
      const allAnalytics = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: /** @type {any} */ ({ isActive: true }),
        limit: -1
      });

      // Group by category manually
      const categoryStats = {};
      if (Array.isArray(allAnalytics)) {
        allAnalytics.forEach(item => {
          const itemData = /** @type {any} */ (item);
          const category = itemData.category || 'General';
          if (!categoryStats[category]) {
            categoryStats[category] = 0;
          }
          categoryStats[category] += itemData.searchCount || 0;
        });
      }

      // Convert to array and sort
      const categoryStatsArray = Object.entries(categoryStats)
        .map(([category, searchCount]) => ({ category, searchCount }))
        .sort((a, b) => b.searchCount - a.searchCount)
        .slice(0, 10);

      // Get recent trending topics
      const recentTrending = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: /** @type {any} */ ({ isActive: true, isTrending: true }),
        sort: { lastCalculated: /** @type {any} */ ('desc') },
        limit: 10
      });

      ctx.body = {
        success: true,
        data: {
          totalSearches,
          trendingCount,
          categoryStats: categoryStatsArray,
          recentTrending: Array.isArray(recentTrending) ? recentTrending : [],
          timeWindow
        }
      };
    } catch (error) {
      strapi.log.error('Error fetching analytics stats:', error);
      ctx.internalServerError('Failed to fetch analytics stats');
    }
  }
}));
