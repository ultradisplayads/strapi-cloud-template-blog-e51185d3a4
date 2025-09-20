const cron = require('node-cron');

class TrendingCalculator {
  constructor(strapi) {
    this.strapi = strapi;
    this.isRunning = false;
    this.lastRunTime = null;
  }

  /**
   * Start the trending calculation cron job
   */
  start() {
    try {
      // Calculate trending scores every 15 minutes
      this.trendingJob = cron.schedule('*/15 * * * *', async () => {
        try {
          await this.calculateTrendingScores();
        } catch (error) {
          this.strapi.log.error('Error in trending calculation cron job:', error);
        }
      }, /** @type {any} */ ({
        scheduled: false
      }));

      // Clean up old data daily at 2 AM
      this.cleanupJob = cron.schedule('0 2 * * *', async () => {
        try {
          await this.cleanupOldData();
        } catch (error) {
          this.strapi.log.error('Error in cleanup cron job:', error);
        }
      }, /** @type {any} */ ({
        scheduled: false
      }));

      // Start the jobs
      this.trendingJob.start();
      this.cleanupJob.start();

      this.strapi.log.info('Trending calculator cron jobs started');
    } catch (error) {
      this.strapi.log.error('Failed to start trending calculator cron jobs:', error);
      throw error;
    }
  }

  /**
   * Stop the trending calculation cron job
   */
  stop() {
    if (this.trendingJob) {
      this.trendingJob.stop();
    }
    if (this.cleanupJob) {
      this.cleanupJob.stop();
    }
    this.strapi.log.info('Trending calculator cron jobs stopped');
  }

  /**
   * Calculate trending scores for all search queries
   */
  async calculateTrendingScores() {
    if (this.isRunning) {
      this.strapi.log.info('Trending calculation already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.strapi.log.info('Starting trending scores calculation...');

      // Check if search-analytics collection exists
      try {
        await this.strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
          limit: 1
        });
      } catch (error) {
        this.strapi.log.warn('Search analytics collection not found, skipping trending calculation');
        return;
      }

      // Get all active search analytics
      const allAnalytics = await this.strapi.entityService.findMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: { isActive: true },
        limit: -1
      });

      if (!Array.isArray(allAnalytics) || allAnalytics.length === 0) {
        this.strapi.log.info('No analytics data found for trending calculation');
        return;
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

        // Calculate trending score with enhanced formula
        const categoryBoost = this.getCategoryBoost(analyticsData.category);
        const recencyBoost = this.getRecencyBoost(analyticsData.lastSearched);
        const trendingScore = (recent24h * 3) + (Math.max(0, growthRate) * 2) + (analyticsData.uniqueUsers * 1.5) + (categoryBoost * 1.2) + recencyBoost;

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

      // Update all records in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < updatedTopics.length; i += batchSize) {
        const batch = updatedTopics.slice(i, i + batchSize);
        const updatePromises = batch.map(topic => 
          this.strapi.entityService.update(/** @type {any} */ ('api::search-analytics.search-analytics'), topic.id, /** @type {any} */ (topic.data))
        );
        await Promise.all(updatePromises);
      }

      // Update trending topics collection
      const trendingTopics = updatedTopics.filter(t => t.data.isTrending);
      await this.updateTrendingTopicsCollection(trendingTopics);

      const processingTime = Date.now() - startTime;
      this.lastRunTime = new Date();
      this.strapi.log.info(`Trending calculation completed in ${processingTime}ms. Processed ${updatedTopics.length} topics, ${trendingTopics.length} trending.`);

    } catch (error) {
      this.strapi.log.error('Error in trending calculation:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldData() {
    try {
      this.strapi.log.info('Starting cleanup of old analytics data...');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete analytics records older than 30 days that are not trending
      const deletedCount = await /** @type {any} */ (this.strapi.entityService).deleteMany(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: {
          lastSearched: { $lt: thirtyDaysAgo },
          isTrending: false
        }
      });

      this.strapi.log.info(`Cleanup completed. Deleted ${deletedCount} old analytics records.`);

    } catch (error) {
      this.strapi.log.error('Error in cleanup:', error);
    }
  }

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
  }

  /**
   * Helper method to get recency boost based on last search time
   */
  getRecencyBoost(lastSearched) {
    if (!lastSearched) return 0;
    
    const now = new Date();
    const hoursSinceLastSearch = (now.getTime() - new Date(lastSearched).getTime()) / (1000 * 60 * 60);
    
    // Boost decreases over time
    if (hoursSinceLastSearch < 1) return 2.0;
    if (hoursSinceLastSearch < 6) return 1.5;
    if (hoursSinceLastSearch < 24) return 1.0;
    if (hoursSinceLastSearch < 72) return 0.5;
    return 0;
  }

  /**
   * Helper method to update trending topics collection
   */
  async updateTrendingTopicsCollection(trendingTopics) {
    try {
      // Clear existing trending topics of type 'topic'
      await /** @type {any} */ (this.strapi.entityService).deleteMany(/** @type {any} */ ('api::trending-topic.trending-topic'), {
        filters: { Type: 'topic' }
      });

      // Create new trending topics
      const createPromises = trendingTopics.map((topic, index) => 
        this.strapi.entityService.create(/** @type {any} */ ('api::trending-topic.trending-topic'), {
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
            Featured: index < 5, // Top 5 are featured
            Rank: index + 1,
            LastUpdated: new Date(),
            hashtag: topic.query,
            duration_hours: 24,
            start_time: new Date()
          })
        })
      );

      await Promise.all(createPromises);
      this.strapi.log.info(`Updated trending topics collection with ${trendingTopics.length} topics`);
    } catch (error) {
      this.strapi.log.error('Error updating trending topics collection:', error);
    }
  }

  /**
   * Get current trending status
   */
  async getStatus() {
    try {
      const totalAnalytics = await this.strapi.entityService.count(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: { isActive: true }
      });

      const trendingCount = await this.strapi.entityService.count(/** @type {any} */ ('api::search-analytics.search-analytics'), {
        filters: { isActive: true, isTrending: true }
      });

      return {
        isRunning: this.isRunning,
        totalAnalytics,
        trendingCount,
        lastRun: this.lastRunTime,
        nextRun: this.trendingJob ? /** @type {any} */ (this.trendingJob).nextDate?.() : null
      };
    } catch (error) {
      this.strapi.log.error('Error getting trending status:', error);
      return { error: error.message };
    }
  }
}

module.exports = TrendingCalculator;
