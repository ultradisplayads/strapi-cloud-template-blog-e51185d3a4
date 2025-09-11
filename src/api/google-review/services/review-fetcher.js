'use strict';

/**
 * Review Fetcher Service
 * Orchestrates fetching reviews from all platforms (Google, Yelp, Foursquare, Facebook)
 */

const FoursquareService = require('./foursquare');

class ReviewFetcherService {
  constructor() {
    this.foursquareService = new FoursquareService();
    this.rateLimits = {
      google: { daily: 20, used: 0 },
      yelp: { daily: 500, used: 0 },
      foursquare: { daily: 1000, used: 0 },
      facebook: { daily: 200, used: 0 }
    };
  }

  /**
   * Get review settings from Strapi
   */
  async getReviewSettings() {
    try {
      const settings = await strapi.entityService.findMany('api::review-settings.review-settings');
      return settings[0] || null;
    } catch (error) {
      strapi.log.error('Error getting review settings:', error);
      return null;
    }
  }

  /**
   * Check if platform is enabled and within rate limits
   */
  isPlatformEnabled(platform, settings) {
    if (!settings) return false;
    
    const platformConfig = settings[platform];
    if (!platformConfig || !platformConfig.is_enabled) {
      return false;
    }
    
    // Check rate limits (simplified - in production you'd track actual usage)
    return true;
  }

  /**
   * Fetch reviews from Foursquare
   */
  async fetchFoursquareReviews(settings) {
    try {
      if (!this.isPlatformEnabled('foursquare', settings)) {
        strapi.log.info('Foursquare platform disabled, skipping...');
        return { platform: 'Foursquare', reviews: [], error: null };
      }

      strapi.log.info('🔄 Fetching Foursquare reviews...');
      
      const searchTerms = ['restaurants', 'hotels', 'bars', 'spas', 'shopping'];
      const reviews = await this.foursquareService.fetchReviews(searchTerms, 'Pattaya, Thailand');
      
      strapi.log.info(`✅ Foursquare: ${reviews.length} reviews fetched`);
      return { platform: 'Foursquare', reviews, error: null };
    } catch (error) {
      strapi.log.error('Error fetching Foursquare reviews:', error);
      return { platform: 'Foursquare', reviews: [], error: error.message };
    }
  }

  /**
   * Fetch reviews from Google Places (placeholder - implement if needed)
   */
  async fetchGoogleReviews(settings) {
    try {
      if (!this.isPlatformEnabled('google_places', settings)) {
        strapi.log.info('Google Places platform disabled, skipping...');
        return { platform: 'Google', reviews: [], error: null };
      }

      strapi.log.info('🔄 Fetching Google reviews...');
      
      // TODO: Implement Google Places API integration
      // For now, return empty array
      const reviews = [];
      
      strapi.log.info(`✅ Google: ${reviews.length} reviews fetched`);
      return { platform: 'Google', reviews, error: null };
    } catch (error) {
      strapi.log.error('Error fetching Google reviews:', error);
      return { platform: 'Google', reviews: [], error: error.message };
    }
  }

  /**
   * Fetch reviews from Yelp (placeholder - implement if needed)
   */
  async fetchYelpReviews(settings) {
    try {
      if (!this.isPlatformEnabled('yelp', settings)) {
        strapi.log.info('Yelp platform disabled, skipping...');
        return { platform: 'Yelp', reviews: [], error: null };
      }

      strapi.log.info('🔄 Fetching Yelp reviews...');
      
      // TODO: Implement Yelp API integration
      // For now, return empty array
      const reviews = [];
      
      strapi.log.info(`✅ Yelp: ${reviews.length} reviews fetched`);
      return { platform: 'Yelp', reviews, error: null };
    } catch (error) {
      strapi.log.error('Error fetching Yelp reviews:', error);
      return { platform: 'Yelp', reviews: [], error: error.message };
    }
  }

  /**
   * Fetch reviews from Facebook (placeholder - implement if needed)
   */
  async fetchFacebookReviews(settings) {
    try {
      if (!this.isPlatformEnabled('facebook', settings)) {
        strapi.log.info('Facebook platform disabled, skipping...');
        return { platform: 'Facebook', reviews: [], error: null };
      }

      strapi.log.info('🔄 Fetching Facebook reviews...');
      
      // TODO: Implement Facebook API integration
      // For now, return empty array
      const reviews = [];
      
      strapi.log.info(`✅ Facebook: ${reviews.length} reviews fetched`);
      return { platform: 'Facebook', reviews, error: null };
    } catch (error) {
      strapi.log.error('Error fetching Facebook reviews:', error);
      return { platform: 'Facebook', reviews: [], error: error.message };
    }
  }

  /**
   * Save reviews to database
   */
  async saveReviews(reviews, platform) {
    try {
      if (!reviews || reviews.length === 0) {
        return { saved: 0, skipped: 0 };
      }

      strapi.log.info(`💾 Saving ${reviews.length} ${platform} reviews...`);
      
      const reviewService = strapi.service('api::google-review.google-review');
      const result = await reviewService.saveReviews(reviews, 30); // 30 days cache
      
      strapi.log.info(`✅ ${platform}: ${result.success_count} saved, ${result.skip_count} skipped`);
      return result;
    } catch (error) {
      strapi.log.error(`Error saving ${platform} reviews:`, error);
      return { saved: 0, skipped: 0, error: error.message };
    }
  }

  /**
   * Update review settings with fetch statistics
   */
  async updateFetchStats(results) {
    try {
      const settings = await this.getReviewSettings();
      if (!settings) return;

      const totalFetched = results.reduce((sum, result) => sum + result.reviews.length, 0);
      const platformsProcessed = results.filter(result => result.reviews.length > 0).length;
      
      const fetchStats = {
        total_fetched: (settings.fetch_stats?.total_fetched || 0) + totalFetched,
        last_24h_fetched: totalFetched,
        platforms_active: platformsProcessed,
        last_error: results.find(result => result.error)?.error || null,
        last_fetch_run: new Date().toISOString()
      };

      await strapi.entityService.update('api::review-settings.review-settings', settings.id, {
        data: {
          fetch_stats: fetchStats,
          last_fetch_run: new Date()
        }
      });

      strapi.log.info(`📊 Updated fetch stats: ${totalFetched} total, ${platformsProcessed} platforms active`);
    } catch (error) {
      strapi.log.error('Error updating fetch stats:', error);
    }
  }

  /**
   * Main method to fetch reviews from all platforms
   */
  async fetchAllReviews() {
    try {
      strapi.log.info('🚀 Starting comprehensive review fetch from all platforms...');
      
      // Get review settings
      const settings = await this.getReviewSettings();
      if (!settings) {
        strapi.log.error('No review settings found, cannot proceed');
        return { error: 'No review settings found' };
      }

      // Fetch from all platforms
      const fetchPromises = [
        this.fetchFoursquareReviews(settings),
        this.fetchGoogleReviews(settings),
        this.fetchYelpReviews(settings),
        this.fetchFacebookReviews(settings)
      ];

      const results = await Promise.all(fetchPromises);
      
      // Save reviews to database
      const savePromises = results.map(result => 
        this.saveReviews(result.reviews, result.platform)
      );
      
      const saveResults = await Promise.all(savePromises);
      
      // Update fetch statistics
      await this.updateFetchStats(results);
      
      // Calculate summary
      const totalFetched = results.reduce((sum, result) => sum + result.reviews.length, 0);
      const totalSaved = saveResults.reduce((sum, result) => sum + (result.success_count || 0), 0);
      const platformsProcessed = results.filter(result => result.reviews.length > 0).length;
      
      const summary = {
        total_fetched: totalFetched,
        total_saved: totalSaved,
        platforms_processed: platformsProcessed,
        results: results.map((result, index) => ({
          platform: result.platform,
          fetched: result.reviews.length,
          saved: saveResults[index]?.success_count || 0,
          skipped: saveResults[index]?.skip_count || 0,
          error: result.error
        }))
      };
      
      strapi.log.info(`🎯 Review fetch completed: ${totalFetched} fetched, ${totalSaved} saved from ${platformsProcessed} platforms`);
      
      return summary;
    } catch (error) {
      strapi.log.error('Error in comprehensive review fetch:', error);
      return { error: error.message };
    }
  }

  /**
   * Test method to fetch reviews from a specific platform
   */
  async testPlatform(platform) {
    try {
      strapi.log.info(`🧪 Testing ${platform} platform...`);
      
      const settings = await this.getReviewSettings();
      if (!settings) {
        throw new Error('No review settings found');
      }

      let result;
      switch (platform.toLowerCase()) {
        case 'foursquare':
          result = await this.fetchFoursquareReviews(settings);
          break;
        case 'google':
          result = await this.fetchGoogleReviews(settings);
          break;
        case 'yelp':
          result = await this.fetchYelpReviews(settings);
          break;
        case 'facebook':
          result = await this.fetchFacebookReviews(settings);
          break;
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }

      if (result.reviews.length > 0) {
        const saveResult = await this.saveReviews(result.reviews, result.platform);
        result.saved = saveResult.success_count;
        result.skipped = saveResult.skip_count;
      }

      strapi.log.info(`✅ ${platform} test completed: ${result.reviews.length} fetched, ${result.saved || 0} saved`);
      return result;
    } catch (error) {
      strapi.log.error(`Error testing ${platform} platform:`, error);
      return { platform, reviews: [], error: error.message };
    }
  }
}

module.exports = ReviewFetcherService;
