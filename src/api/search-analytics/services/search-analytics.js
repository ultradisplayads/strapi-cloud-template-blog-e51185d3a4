'use strict';

/**
 * search-analytics service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService(/** @type {any} */ ('api::search-analytics.search-analytics'), ({ strapi }) => ({
  /**
   * Track search query with rate limiting
   */
  async trackSearchQuery(query, metadata = {}) {
    try {
      const { category = 'General', source = 'unknown', userAgent, sessionId } = metadata;
      
      // Rate limiting: max 100 requests per minute per IP
      const rateLimitKey = `search_track_${metadata.ip || 'unknown'}`;
      const rateLimitCount = await /** @type {any} */ (strapi).cache?.get(rateLimitKey) || 0;
      
      if (rateLimitCount > 100) {
        throw new Error('Rate limit exceeded');
      }
      
      await /** @type {any} */ (strapi).cache?.set(rateLimitKey, rateLimitCount + 1, 60); // 1 minute TTL

      const normalizedQuery = query.trim().toLowerCase();
      
      // Skip very short queries or common words
      if (normalizedQuery.length < 2) {
        return { success: false, reason: 'Query too short' };
      }

      const skipWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
      if (skipWords.includes(normalizedQuery)) {
        return { success: false, reason: 'Common word' };
      }

      const now = new Date();
      
      // Find or create analytics record
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
            userAgents.shift();
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

        return {
          success: true,
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

        return {
          success: true,
          data: {
            query: normalizedQuery,
            searchCount: 1,
            isNew: true,
            id: newRecord.id
          }
        };
      }
    } catch (error) {
      strapi.log.error('Error in trackSearchQuery service:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Calculate trending scores for all queries
   */
  async calculateTrendingScores() {
    try {
      // Get all active search analytics
      const allAnalytics = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: { isActive: true },
        limit: -1
      });

      if (!Array.isArray(allAnalytics)) {
        return { success: false, error: 'No analytics data found' };
      }

      const now = new Date();

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
        const categoryBoost = this.getCategoryBoost(analyticsData.category);
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
          isTrending: index < 20 && topic.trendingScore > 10,
          trendingRank: index < 20 && topic.trendingScore > 10 ? index + 1 : 0,
          lastCalculated: topic.lastCalculated
        }
      }));

      // Update all records
      const updatePromises = updatedTopics.map(topic => 
        strapi.entityService.update(/** @type {any} */ ('api::search-analytics.search-analytics'), topic.id, /** @type {any} */ (topic.data))
      );

      await Promise.all(updatePromises);

      // Update trending topics collection
      const trendingTopics = updatedTopics.filter(t => t.data.isTrending);
      await this.updateTrendingTopicsCollection(trendingTopics);

      return {
        success: true,
        data: {
          totalProcessed: updatedTopics.length,
          trendingCount: trendingTopics.length,
          timestamp: now
        }
      };
    } catch (error) {
      strapi.log.error('Error calculating trending scores:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get trending topics for frontend
   */
  async getTrendingTopics(options = {}) {
    try {
      const { limit = 10, category, timeWindow = '24h' } = options;

      const filters = {
        isActive: true,
        isTrending: true,
        trendingRank: { $gt: 0 }
      };

      if (category && category !== 'all') {
        filters.category = category;
      }

      const trendingTopics = await strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: /** @type {any} */ (filters),
        sort: { trendingRank: /** @type {any} */ ('asc') },
        limit: parseInt(limit),
        populate: '*'
      });

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

      return {
        success: true,
        data: transformedTopics,
        meta: {
          total: transformedTopics.length,
          timeWindow,
          category: category || 'all'
        }
      };
    } catch (error) {
      strapi.log.error('Error getting trending topics:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Helper method to get category boost multiplier
   */
  getCategoryBoost(category) {
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
  },

  /**
   * Helper method to update trending topics collection
   */
  async updateTrendingTopicsCollection(trendingTopics) {
    try {
      // Clear existing trending topics
      await /** @type {any} */ (strapi.entityService).deleteMany(/** @type {any} */ ('api::trending-topic.trending-topic'), {
        filters: { Type: 'topic' }
      });

      // Create new trending topics
      const createPromises = trendingTopics.map((topic, index) => 
        strapi.entityService.create(/** @type {any} */ ('api::trending-topic.trending-topic'), {
          data: /** @type {any} */ ({
            Title: topic.query,
            Type: 'topic',
            Posts: topic.searchCount,
            Growth: topic.growthRate,
            Category: topic.category,
            Icon: 'trending',
            Description: `Searched ${topic.searchCount} times`,
            URL: `/search?q=${encodeURIComponent(topic.query)}`,
            IsActive: true,
            Featured: index < 5,
            Rank: index + 1,
            LastUpdated: new Date(),
            hashtag: topic.query,
            duration_hours: 24,
            start_time: new Date()
          })
        })
      );

      await Promise.all(createPromises);
    } catch (error) {
      strapi.log.error('Error updating trending topics collection:', error);
    }
  },

  /**
   * Clean up old analytics data
   */
  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete analytics records older than 30 days that are not trending
      const deletedCount = await /** @type {any} */ (strapi.entityService).deleteMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: {
          lastSearched: { $lt: thirtyDaysAgo },
          isTrending: false
        }
      });

      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} old analytics records`
      };
    } catch (error) {
      strapi.log.error('Error cleaning up old analytics data:', error);
      return { success: false, error: error.message };
    }
  }
}));
