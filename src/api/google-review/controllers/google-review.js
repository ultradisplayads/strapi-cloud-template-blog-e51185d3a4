'use strict';

/**
 * google-review controller
 * Note: TypeScript errors are expected until Strapi regenerates types after schema changes
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore - Strapi type system needs regeneration
module.exports = createCoreController('api::google-review.google-review', ({ strapi }) => ({
  // Get latest reviews with limit parameter
  async latest(ctx) {
    try {
      const { limit = 10, platform, business_id } = ctx.query;
      
      // Build filters - using any type to handle schema changes
      const filters = {
        IsActive: true,
        cache_expiry_date: {
          $gt: new Date() // Only get non-expired reviews
        }
      };

      // Add platform filter if specified
      if (platform) {
        filters.source_platform = platform;
      }

      // Add business filter if specified
      if (business_id) {
        filters.business = business_id;
      }

      const reviews = await strapi.entityService.findMany('api::google-review.google-review', {
        // @ts-ignore - Strapi type system needs regeneration
        filters,
        // @ts-ignore - ReviewTime field exists in updated schema
        sort: { ReviewTime: 'desc' },
        // @ts-ignore - Strapi type system needs regeneration
        limit: parseInt(String(limit || 10)),
        populate: {
          // @ts-ignore - Strapi type system needs regeneration
          business: {
            fields: ['name', 'slug', 'rating', 'reviewCount']
          }
        }
      });

      // Transform data for frontend - using any type to handle schema changes
      const transformedReviews = reviews.map((review) => {
        // Type assertion to handle schema changes
        const reviewData = review;
        return {
          id: reviewData.id,
          // @ts-ignore - Strapi type system needs regeneration
          source_platform: reviewData.source_platform || 'Unknown',
          // @ts-ignore - Strapi type system needs regeneration
          author_name: reviewData.AuthorName || 'Anonymous',
          rating: reviewData.Rating || 0,
          // @ts-ignore - Strapi type system needs regeneration
          review_text: reviewData.ReviewText || '',
          // @ts-ignore - Strapi type system needs regeneration
          review_timestamp: reviewData.ReviewTime || new Date(),
          // @ts-ignore - Strapi type system needs regeneration
          author_profile_url: reviewData.AuthorProfileUrl || null,
          // @ts-ignore - Strapi type system needs regeneration
          author_profile_photo_url: reviewData.AuthorProfilePhotoUrl || null,
          // @ts-ignore - Strapi type system needs regeneration
          business_name: reviewData.BusinessName || '',
          // @ts-ignore - Strapi type system needs regeneration
          business_address: reviewData.BusinessAddress || '',
          // @ts-ignore - Strapi type system needs regeneration
          verified: reviewData.Verified || false,
          // @ts-ignore - Strapi type system needs regeneration
          language: reviewData.Language || 'en',
          // @ts-ignore - Strapi type system needs regeneration
          business: reviewData.business || null
        };
      });

      return {
        data: transformedReviews,
        meta: {
          total: transformedReviews.length,
          // @ts-ignore - Strapi type system needs regeneration
          limit: parseInt(String(limit || 10)),
          platform: platform || 'all',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      strapi.log.error('Error fetching latest reviews:', error);
      return ctx.internalServerError('Failed to fetch latest reviews');
    }
  },

  // Get reviews by business
  async byBusiness(ctx) {
    try {
      const { businessId } = ctx.params;
      const { limit = 10, platform } = ctx.query;

      if (!businessId) {
        return ctx.badRequest('Business ID is required');
      }

      const filters = {
        business: businessId,
        IsActive: true,
        cache_expiry_date: {
          $gt: new Date()
        }
      };

      if (platform) {
        filters.source_platform = platform;
      }

      const reviews = await strapi.entityService.findMany('api::google-review.google-review', {
        // @ts-ignore - Strapi type system needs regeneration
        filters,
        // @ts-ignore - ReviewTime field exists in updated schema
        sort: { ReviewTime: 'desc' },
        // @ts-ignore - Strapi type system needs regeneration
        limit: parseInt(String(limit || 10)),
        populate: {
          // @ts-ignore - Strapi type system needs regeneration
          business: {
            fields: ['name', 'slug', 'rating', 'reviewCount']
          }
        }
      });

      return {
        data: reviews,
        meta: {
          business_id: businessId,
          total: reviews.length,
          // @ts-ignore - Strapi type system needs regeneration
          limit: parseInt(String(limit || 10)),
          platform: platform || 'all'
        }
      };
    } catch (error) {
      strapi.log.error('Error fetching reviews by business:', error);
      return ctx.internalServerError('Failed to fetch business reviews');
    }
  },

  // Get review statistics
  async stats(ctx) {
    try {
      const { businessId } = ctx.query;

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
        filters
      });

      // Calculate statistics
      const stats = {
        total_reviews: reviews.length,
        platforms: {},
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recent_reviews_24h: 0
      };

      let totalRating = 0;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      reviews.forEach((review) => {
        // Type assertion to handle schema changes
        const reviewData = review;
        
        // Platform stats
        // @ts-ignore - Strapi type system needs regeneration
        const sourcePlatform = reviewData.source_platform || 'Unknown';
        if (!stats.platforms[sourcePlatform]) {
          stats.platforms[sourcePlatform] = 0;
        }
        stats.platforms[sourcePlatform]++;

        // Rating stats
        const rating = reviewData.Rating || 0;
        totalRating += rating;
        if (rating >= 1 && rating <= 5) {
          stats.rating_distribution[rating]++;
        }

        // Recent reviews
        // @ts-ignore - Strapi type system needs regeneration
        const reviewTimestamp = reviewData.ReviewTime || new Date();
        if (new Date(reviewTimestamp) > oneDayAgo) {
          stats.recent_reviews_24h++;
        }
      });

      stats.average_rating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(2)) : 0;

      return {
        data: stats,
        meta: {
          business_id: businessId || 'all',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      strapi.log.error('Error fetching review statistics:', error);
      return ctx.internalServerError('Failed to fetch review statistics');
    }
  }
}));
