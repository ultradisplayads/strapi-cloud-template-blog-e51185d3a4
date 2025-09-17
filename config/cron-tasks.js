module.exports = {
  /**
   * News fetching cron job - runs every 5 minutes to fetch real news
   * Using object format (recommended by Strapi 5)
   */
  newsFetching: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🔄 Running news fetch...');
        
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
    options: {
      rule: '*/5 * * * *', // Every 5 minutes
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Dynamic cleanup based on admin settings
   * Runs every 15 minutes to check if cleanup is needed
   */
  newsCleanup: {
    task: async ({ strapi }) => {
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
    options: {
      rule: '*/15 * * * *', // Every 15 minutes
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Daily review fetch at 6 AM - Fetch new reviews from all platforms
   */
  reviewsFetching: {
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
    options: {
      rule: '0 6 * * *', // Daily at 6 AM
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Daily review cleanup at 3 AM - Remove expired reviews for ToS compliance
   */
  reviewsCleanup: {
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
    options: {
      rule: '0 3 * * *', // Daily at 3 AM
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Daily cleanup at 2 AM - Remove old rejected articles (legacy)
   */
  rejectedArticlesCleanup: {
    task: async ({ strapi }) => {
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
    },
    options: {
      rule: '0 2 * * *', // Daily at 2 AM
      tz: 'Asia/Bangkok'
    }
  },
  
  /**
   * Featured Videos Scheduler - Daytime fetch every 30 min (06:00-23:00)
   */
  videoDaytimeFetch: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🎬 Running daytime video fetch...');
        const VideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = new VideoScheduler(strapi);
        await videoScheduler.performVideoFetching();
        strapi.log.info('✅ Daytime video fetch completed');
      } catch (error) {
        strapi.log.error('❌ Daytime video fetch failed:', error.message);
      }
    },
    options: {
      rule: '*/30 6-23 * * *', // Every 30 minutes from 6 AM to 11 PM
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Featured Videos Scheduler - Nighttime fetch every 2 hours (00:00-05:59)
   */
  videoNighttimeFetch: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🌙 Running nighttime video fetch...');
        const VideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = new VideoScheduler(strapi);
        await videoScheduler.performVideoFetching();
        strapi.log.info('✅ Nighttime video fetch completed');
      } catch (error) {
        strapi.log.error('❌ Nighttime video fetch failed:', error.message);
      }
    },
    options: {
      rule: '0 */2 0-5 * * *', // Every 2 hours from midnight to 5 AM
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Featured Videos Scheduler - Trending mode check every 10 minutes
   */
  videoTrendingCheck: {
    task: async ({ strapi }) => {
      try {
        const VideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = new VideoScheduler(strapi);
        const activeTags = await videoScheduler.checkActiveTrendingTags();
        if (activeTags.length > 0) {
          strapi.log.info(`🔥 Found ${activeTags.length} active trending tags, performing trending fetch...`);
          await videoScheduler.performTrendingFetch(activeTags);
          strapi.log.info('✅ Trending video fetch completed');
        }
      } catch (error) {
        strapi.log.error('❌ Trending mode fetch failed:', error.message);
      }
    },
    options: {
      rule: '*/10 * * * *', // Every 10 minutes
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Featured Videos Scheduler - Daily cleanup at 2 AM
   */
  videoCleanup: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🧹 Running video cleanup...');
        const VideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = new VideoScheduler(strapi);
        await videoScheduler.performVideoCleanup();
        strapi.log.info('✅ Video cleanup completed');
      } catch (error) {
        strapi.log.error('❌ Video cleanup failed:', error.message);
      }
    },
    options: {
      rule: '0 2 * * *', // Daily at 2 AM
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Featured Videos Scheduler - Stats update every 6 hours
   */
  videoStatsUpdate: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('📊 Running video stats update...');
        const VideoScheduler = require('../src/services/video-scheduler');
        const videoScheduler = new VideoScheduler(strapi);
        await videoScheduler.performStatsUpdate();
        strapi.log.info('✅ Video stats update completed');
      } catch (error) {
        strapi.log.error('❌ Video stats update failed:', error.message);
      }
    },
    options: {
      rule: '0 */6 * * *', // Every 6 hours
      tz: 'Asia/Bangkok'
    }
  },
  
  /**
   * Currency Trending Scheduler - Update every 3 minutes
   */
  currencyUpdate: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('💱 Running currency update...');
        const CurrencyScheduler = require('../src/services/currency-scheduler');
        const currencyScheduler = new CurrencyScheduler();
        await currencyScheduler.updateCurrencyData();
        strapi.log.info('✅ Currency update completed');
      } catch (error) {
        strapi.log.error('❌ Currency update failed:', error.message);
      }
    },
    options: {
      rule: '*/3 * * * *', // Every 3 minutes
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Transport hub - Travel times summary every 20 minutes
   */
  travelTimesSummary: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🛣️ Updating travel times summary...');
        await strapi.api['traffic-summary'].services['traffic-summary'].updateSummary();
        strapi.log.info('✅ Travel times summary updated');
      } catch (error) {
        strapi.log.error('❌ Travel times summary failed:', error.message);
      }
    },
    options: {
      rule: '*/20 * * * *', // Every 20 minutes
      tz: 'Asia/Bangkok'
    }
  },

  /**
   * Transport hub - Static map refresh every 5 minutes
   */
  staticMapRefresh: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('🗺️ Refreshing cached static traffic map...');
        await strapi.service('api::traffic-map.traffic-map').refreshStaticMap();
        strapi.log.info('✅ Static map refreshed');
      } catch (error) {
        strapi.log.error('❌ Static map refresh failed:', error.message);
      }
    },
    options: {
      rule: '*/5 * * * *', // Every 5 minutes
      tz: 'Asia/Bangkok'
    }
  }
};
