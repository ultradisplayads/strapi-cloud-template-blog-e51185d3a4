'use strict';

/**
 * google-review service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore - Strapi type system needs regeneration
module.exports = createCoreService('api::google-review.google-review', ({ strapi }) => ({
  // Save reviews with duplicate prevention
  async saveReviews(reviews, cacheDurationDays = 30) {
    try {
      const savedReviews = [];
      const skippedReviews = [];

      for (const reviewData of reviews) {
        try {
          // Check if review already exists
          const existingReview = await strapi.entityService.findMany('api::google-review.google-review', {
            // @ts-ignore - Strapi type system needs regeneration
            filters: {
              // @ts-ignore - Strapi type system needs regeneration
              source_review_id: reviewData.source_review_id
            }
          });

          if (existingReview && existingReview.length > 0) {
            strapi.log.info(`Skipping duplicate review: ${reviewData.source_review_id}`);
            skippedReviews.push({
              source_review_id: reviewData.source_review_id,
              reason: 'duplicate'
            });
            continue;
          }

          // Set cache expiry date
          const cacheExpiryDate = new Date();
          cacheExpiryDate.setDate(cacheExpiryDate.getDate() + cacheDurationDays);

          // Create review with cache expiry
          const reviewToSave = {
            ...reviewData,
            cache_expiry_date: cacheExpiryDate,
            LastUpdated: new Date()
          };

          const savedReview = await strapi.entityService.create('api::google-review.google-review', {
            data: reviewToSave
          });

          savedReviews.push(savedReview);
          strapi.log.info(`Saved new review: ${reviewData.source_review_id}`);

        } catch (error) {
          strapi.log.error(`Error saving review ${reviewData.source_review_id}:`, error);
          skippedReviews.push({
            source_review_id: reviewData.source_review_id,
            reason: 'error',
            error: error.message
          });
        }
      }

      return {
        saved: savedReviews,
        skipped: skippedReviews,
        total_processed: reviews.length,
        success_count: savedReviews.length,
        skip_count: skippedReviews.length
      };

    } catch (error) {
      strapi.log.error('Error in saveReviews service:', error);
      throw error;
    }
  },

  // Clean up expired reviews (for ToS compliance)
  async cleanupExpiredReviews() {
    try {
      const now = new Date();
      
      const expiredReviews = await strapi.entityService.findMany('api::google-review.google-review', {
        // @ts-ignore - Strapi type system needs regeneration
        filters: {
          // @ts-ignore - Strapi type system needs regeneration
          cache_expiry_date: {
            $lt: now
          }
        },
        // @ts-ignore - Strapi type system needs regeneration
        fields: ['id', 'source_review_id', 'cache_expiry_date']
      });

      if (expiredReviews.length === 0) {
        strapi.log.info('No expired reviews found for cleanup');
        return {
          deleted_count: 0,
          message: 'No expired reviews found'
        };
      }

      // Delete expired reviews
      let deletedCount = 0;
      for (const review of expiredReviews) {
        try {
          await strapi.entityService.delete('api::google-review.google-review', review.id);
          deletedCount++;
          // @ts-ignore - Strapi type system needs regeneration
          strapi.log.info(`Deleted expired review: ${review.source_review_id || review.id}`);
        } catch (error) {
          strapi.log.error(`Error deleting expired review ${review.id}:`, error);
        }
      }

      strapi.log.info(`Cleanup completed: ${deletedCount} expired reviews deleted`);
      return {
        deleted_count: deletedCount,
        total_expired: expiredReviews.length,
        message: `Successfully deleted ${deletedCount} expired reviews`
      };

    } catch (error) {
      strapi.log.error('Error in cleanupExpiredReviews service:', error);
      throw error;
    }
  },

  // Get review statistics
  async getReviewStats(businessId = null) {
    try {
      const filters = {
        IsActive: true,
        cache_expiry_date: {
          $gt: new Date()
        }
      };

      if (businessId) {
        filters.business = businessId;
      }

      const reviews = await strapi.entityService.findMany('api::google-review.google-review', {
        // @ts-ignore - Strapi type system needs regeneration
        filters,
        // @ts-ignore - Strapi type system needs regeneration
        fields: ['source_platform', 'Rating', 'ReviewTime', 'cache_expiry_date']
      });

      const stats = {
        total_reviews: reviews.length,
        platforms: {},
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recent_reviews_24h: 0,
        recent_reviews_7d: 0,
        expiring_soon: 0
      };

      let totalRating = 0;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      reviews.forEach(review => {
        const reviewData = review;
        // Platform stats
        // @ts-ignore - Strapi type system needs regeneration
        if (!stats.platforms[reviewData.source_platform]) {
          // @ts-ignore - Strapi type system needs regeneration
          stats.platforms[reviewData.source_platform] = 0;
        }
        // @ts-ignore - Strapi type system needs regeneration
        stats.platforms[reviewData.source_platform]++;

        // Rating stats
        totalRating += reviewData.Rating;
        stats.rating_distribution[reviewData.Rating]++;

        // Recent reviews
        // @ts-ignore - Strapi type system needs regeneration
        const reviewDate = new Date(reviewData.ReviewTime);
        if (reviewDate > oneDayAgo) {
          stats.recent_reviews_24h++;
        }
        if (reviewDate > sevenDaysAgo) {
          stats.recent_reviews_7d++;
        }

        // Expiring soon
        // @ts-ignore - Strapi type system needs regeneration
        if (new Date(reviewData.cache_expiry_date) < threeDaysFromNow) {
          stats.expiring_soon++;
        }
      });

      stats.average_rating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(2)) : 0;

      return stats;
    } catch (error) {
      strapi.log.error('Error getting review statistics:', error);
      throw error;
    }
  },

  // Find business by name and address (for matching)
  async findBusinessByNameAndAddress(businessName, businessAddress) {
    try {
      const businesses = await strapi.entityService.findMany('api::business.business', {
        filters: {
          name: {
            $containsi: businessName
          }
        },
        // @ts-ignore - Strapi type system needs regeneration
        populate: {
          address: true
        }
      });

      // Try to find exact match first
      for (const business of businesses) {
        const businessData = business;
        // @ts-ignore - Strapi type system needs regeneration
        if (businessData.address && businessData.address.length > 0) {
          // @ts-ignore - Strapi type system needs regeneration
          const businessAddr = businessData.address[0];
          const fullAddress = `${businessAddr.street || ''} ${businessAddr.city || ''} ${businessAddr.state || ''}`.toLowerCase();
          const searchAddress = businessAddress.toLowerCase();
          
          if (fullAddress.includes(searchAddress) || searchAddress.includes(fullAddress)) {
            return business;
          }
        }
      }

      // Return first match if no exact address match
      return businesses.length > 0 ? businesses[0] : null;
    } catch (error) {
      strapi.log.error('Error finding business by name and address:', error);
      return null;
    }
  }
}));
