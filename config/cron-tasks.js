module.exports = {
  newsFetchJob: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🔄 Running 1-minute news fetch...');
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
    options: { rule: '*/5 * * * *' },
  },

  dynamicCleanupJob: {
    task: async ({ strapi }) => {
      try {
        const settings = await strapi.entityService.findOne('api::news-settings.news-settings', 1);
        if (!settings || !settings.cleanupFrequencyMinutes) return;
        const now = new Date();
        const lastRun = settings.lastCleanupRun ? new Date(settings.lastCleanupRun) : null;
        const frequencyMs = settings.cleanupFrequencyMinutes * 60 * 1000;
        if (lastRun && (now.getTime() - lastRun.getTime()) < frequencyMs) return;
        strapi.log.info('🧹 Running dynamic cleanup based on admin settings...');
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
    options: { rule: '*/15 * * * *' },
  },

  dailyReviewFetchJob: {
    task: async ({ strapi }) => {
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
    options: { rule: '0 6 * * *' },
  },

  dailyReviewCleanupJob: {
    task: async ({ strapi }) => {
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
    options: { rule: '0 3 * * *' },
  },

  dailyRejectedCleanupJob: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🧹 Running daily rejected articles cleanup...');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const deletedArticles = await strapi.db.query('api::breaking-news.breaking-news').deleteMany({
          where: { moderationStatus: 'rejected', createdAt: { $lt: sevenDaysAgo } }
        });
        strapi.log.info(`✅ Daily rejected cleanup completed: ${deletedArticles.count} old rejected articles removed`);
      } catch (error) {
        strapi.log.error('❌ Daily rejected cleanup failed:', error.message);
      }
    },
    options: { rule: '0 2 * * *' },
  },

  videoDaytimeFetch: {
    task: async ({ strapi }) => {
      try {
        const createVideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = createVideoScheduler({ strapi });
        await videoScheduler.performVideoFetching();
      } catch (error) {
        strapi.log.error('❌ Daytime video fetch failed:', error.message);
      }
    },
    options: { rule: '*/30 6-23 * * *', tz: 'Asia/Bangkok' },
  },

  videoNighttimeFetch: {
    task: async ({ strapi }) => {
      try {
        const createVideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = createVideoScheduler({ strapi });
        await videoScheduler.performVideoFetching();
      } catch (error) {
        strapi.log.error('❌ Nighttime video fetch failed:', error.message);
      }
    },
    options: { rule: '0 */2 0-5 * * *', tz: 'Asia/Bangkok' },
  },

  videoTrendingMode: {
    task: async ({ strapi }) => {
      try {
        const createVideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = createVideoScheduler({ strapi });
        const activeTags = await videoScheduler.checkActiveTrendingTags();
        if (activeTags.length > 0) {
          await videoScheduler.performTrendingFetch(activeTags);
        }
      } catch (error) {
        strapi.log.error('❌ Trending mode fetch failed:', error.message);
      }
    },
    options: { rule: '*/5 * * * *', tz: 'Asia/Bangkok' },
  },

  videoCleanup: {
    task: async ({ strapi }) => {
      try {
        const createVideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = createVideoScheduler({ strapi });
        await videoScheduler.performVideoCleanup();
      } catch (error) {
        strapi.log.error('❌ Video cleanup failed:', error.message);
      }
    },
    options: { rule: '0 2 * * *', tz: 'Asia/Bangkok' },
  },

  videoStatsUpdate: {
    task: async ({ strapi }) => {
      try {
        const createVideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = createVideoScheduler({ strapi });
        await videoScheduler.performStatsUpdate();
      } catch (error) {
        strapi.log.error('❌ Video stats update failed:', error.message);
      }
    },
    options: { rule: '0 */6 * * *', tz: 'Asia/Bangkok' },
  },

  currencyUpdate: {
    task: async ({ strapi }) => {
      try {
        const CurrencyScheduler = require('../src/services/currency-scheduler');
        const currencyScheduler = new CurrencyScheduler();
        await currencyScheduler.updateCurrencyData();
      } catch (error) {
        strapi.log.error('❌ Currency update failed:', error.message);
      }
    },
    options: { rule: '*/5 * * * *' },
  },

  travelTimesSummaryJob: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🛣️ Updating travel times summary...');
        await strapi.service('api::traffic-summary.traffic-summary').updateSummary();
      } catch (error) {
        strapi.log.error('❌ Travel times summary failed:', error.message);
      }
    },
    options: { rule: '*/20 * * * *' },
  },

  staticMapRefreshJob: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🗺️ Refreshing cached static traffic map...');
        await strapi.service('api::traffic-map.traffic-map').refreshStaticMap();
      } catch (error) {
        strapi.log.error('❌ Static map refresh failed:', error.message);
      }
    },
    options: { rule: '*/5 * * * *' },
  },
};
