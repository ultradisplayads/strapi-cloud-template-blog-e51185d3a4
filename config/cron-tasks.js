module.exports = {
  /**
   * News fetching cron job - runs every 1 minute to fetch real news
   */
  '* * * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🔄 Running 1-minute news fetch...');
      
      // Use the breaking news service to fetch from News API
      const breakingNewsService = strapi.service('api::breaking-news.breaking-news');
      const result = await breakingNewsService.fetchAndProcessNews();
      
      if (result) {
        strapi.log.info(`🎯 News fetch completed: ${result.total} new articles (${result.approved} approved, ${result.needsReview} need review)`);
      } else {
        strapi.log.info('🎯 News fetch completed: No new articles');
      }
    } catch (error) {
      strapi.log.error('❌ Scheduled news fetch failed:', error.message);
    }
  },

  /**
   * Dynamic cleanup based on admin settings
   * Runs every 15 minutes to check if cleanup is needed
   */
  '*/15 * * * *': async ({ strapi }) => {
    try {
      // Get cleanup settings
      const settings = await strapi.entityService.findOne('api::news-settings.news-settings', 1);
      if (!settings || !settings.cleanupFrequencyMinutes) {
        return; // Skip if no settings
      }

      // Check if it's time to run cleanup
      const now = new Date();
      const lastRun = settings.lastCleanupRun ? new Date(settings.lastCleanupRun) : null;
      const frequencyMs = settings.cleanupFrequencyMinutes * 60 * 1000;
      
      if (lastRun && (now.getTime() - lastRun.getTime()) < frequencyMs) {
        return; // Not time yet
      }

      strapi.log.info('🧹 Running dynamic cleanup based on admin settings...');
      
      // Call the cleanup endpoint
      const cleanupResult = await strapi.controller('api::breaking-news.breaking-news').cleanup({
        state: {},
        throw: (code, message) => { throw new Error(`${code}: ${message}`); }
      });

      if (cleanupResult && cleanupResult.deletedCount > 0) {
        strapi.log.info(`✅ Dynamic cleanup completed: ${cleanupResult.deletedCount} articles deleted`);
      } else {
        strapi.log.info('✅ Dynamic cleanup completed: No articles needed deletion');
      }
    } catch (error) {
      strapi.log.error('❌ Dynamic cleanup failed:', error.message);
    }
  },

  /**
   * Daily review fetch at 6 AM - Fetch new reviews from all platforms
   */
  '0 6 * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🔄 Running daily review fetch...');
      
      const ReviewFetcherService = require('../src/api/google-review/services/review-fetcher');
      const reviewFetcher = new ReviewFetcherService();
      
      const result = await reviewFetcher.fetchAllReviews();
      
      if (result.error) {
        strapi.log.error(`❌ Daily review fetch failed: ${result.error}`);
      } else {
        strapi.log.info(`🎯 Daily review fetch completed: ${result.total_fetched} reviews fetched, ${result.total_saved} saved from ${result.platforms_processed} platforms`);
      }
    } catch (error) {
      strapi.log.error('❌ Daily review fetch failed:', error.message);
    }
  },

  /**
   * Daily review cleanup at 3 AM - Remove expired reviews for ToS compliance
   */
  '0 3 * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🧹 Running daily review cleanup...');
      
      const result = await strapi.service('api::google-review.google-review').cleanupExpiredReviews();
      
      if (result.deleted_count > 0) {
        strapi.log.info(`✅ Review cleanup completed: ${result.deleted_count} expired reviews deleted`);
      } else {
        strapi.log.info('✅ Review cleanup completed: No expired reviews found');
      }
    } catch (error) {
      strapi.log.error('❌ Review cleanup failed:', error.message);
    }
  },

  /**
   * Daily cleanup at 2 AM - Remove old rejected articles (legacy)
   */
  '0 2 * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🧹 Running daily rejected articles cleanup...');
      
      // Delete rejected articles older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const deletedArticles = await strapi.db.query('api::breaking-news.breaking-news').deleteMany({
        where: {
          moderationStatus: 'rejected',
          createdAt: {
            $lt: sevenDaysAgo
          }
        }
      });
      
      strapi.log.info(`✅ Daily rejected cleanup completed: ${deletedArticles.count} old rejected articles removed`);
    } catch (error) {
      strapi.log.error('❌ Daily rejected cleanup failed:', error.message);
    }
  }
  ,
  /**
   * Transport hub jobs
   * - Travel times summary every 20 minutes
   * - Static map refresh every 5 minutes
   */
  '*/20 * * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🛣️ Updating travel times summary...');
      await strapi.api['traffic-summary'].services['traffic-summary'].updateSummary();
    } catch (error) {
      strapi.log.error('❌ Travel times summary failed:', error.message);
    }
  },
  '*/5 * * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🗺️ Refreshing cached static traffic map...');
      await strapi.service('api::traffic-map.traffic-map').refreshStaticMap();
    } catch (error) {
      strapi.log.error('❌ Static map refresh failed:', error.message);
    }
  }
};
