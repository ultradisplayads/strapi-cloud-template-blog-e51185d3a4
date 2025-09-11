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
      
      console.log('🔍 [REVIEW API] Fetching latest reviews from Google Places API...');
      console.log(`   Query params: limit=${limit}, platform=${platform}, business_id=${business_id}`);
      
      // Import Google Places service
      const GooglePlacesService = require('../services/google-places');
      const googlePlacesService = new GooglePlacesService();
      
      // Fetch reviews directly from Google Places API - REAL DATA ONLY
      console.log('🌐 [REVIEW API] Calling Google Places API for Pattaya reviews...');
      
      let reviews = [];
      try {
        reviews = await googlePlacesService.fetchReviews(['Pattaya Beach Thailand', 'restaurants Pattaya', 'hotels Pattaya'], limit);
        console.log(`✅ [REVIEW API] Fetched ${reviews.length} reviews from Google Places API`);
      } catch (error) {
        console.log('❌ [REVIEW API] Google Places API failed - returning empty result');
        console.log(`   Error: ${error.message}`);
        return {
          data: [],
          meta: {
            total: 0,
            limit: parseInt(String(limit || 10)),
            platform: platform || 'all',
            timestamp: new Date().toISOString(),
            message: `Google Places API error: ${error.message}`
          }
        };
      }
      
      if (reviews.length === 0) {
        console.log('⚠️  [REVIEW API] No reviews found from Google Places API - returning empty result');
        return {
          data: [],
          meta: {
            total: 0,
            limit: parseInt(String(limit || 10)),
            platform: platform || 'all',
            timestamp: new Date().toISOString(),
            message: 'No reviews available from Foursquare API'
          }
        };
      }
      
      if (reviews.length > 0) {
        console.log('📋 [REVIEW API] Reviews to send to frontend:');
        reviews.forEach((review, index) => {
          console.log(`   Review ${index + 1}:`);
          console.log(`     Platform: ${review.source_platform || 'Foursquare'}`);
          console.log(`     Author: ${review.AuthorName || 'Anonymous'}`);
          console.log(`     Rating: ${review.Rating || 'N/A'}`);
          console.log(`     Business: ${review.BusinessName || 'N/A'}`);
          console.log(`     Text: ${(review.ReviewText || '').substring(0, 100)}${(review.ReviewText || '').length > 100 ? '...' : ''}`);
          console.log(`     Created: ${review.ReviewTime || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('⚠️  [REVIEW API] No reviews available');
      }

      // Transform data for frontend - using API data format
      const transformedReviews = reviews.map((review, index) => {
        return {
          id: `foursquare_${index + 1}_${Date.now()}`,
          source_platform: review.source_platform || 'Foursquare',
          author_name: review.AuthorName || 'Anonymous',
          author_url: review.AuthorProfileUrl || null,
          profile_photo_url: review.AuthorProfilePhotoUrl || null,
          rating: review.Rating || 4,
          relative_time_description: review.RelativeTimeDescription || 'Recently',
          text: review.ReviewText || '',
          time: review.ReviewTime || new Date(),
          language: review.Language || 'en',
          review_text: review.ReviewText || '',
          review_timestamp: review.ReviewTime || new Date(),
          author_profile_url: review.AuthorProfileUrl || null,
          author_profile_photo_url: review.AuthorProfilePhotoUrl || null,
          business_name: review.BusinessName || 'Pattaya Business',
          business_address: review.BusinessAddress || 'Pattaya, Thailand',
          verified: review.Verified || false,
          business: {
            name: review.BusinessName || 'Pattaya Business',
            address: review.BusinessAddress || 'Pattaya, Thailand'
          }
        };
      });

      console.log(`📤 [REVIEW API] Returning ${transformedReviews.length} transformed reviews to frontend`);
      console.log(`   Response meta: total=${transformedReviews.length}, limit=${limit}, platform=${platform || 'all'}`);

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

      console.log('📊 [REVIEW API] Fetching review statistics...');
      console.log(`   Query params: businessId=${businessId}`);

      const filters = {
        IsActive: true,
        cache_expiry_date: {
          $gt: new Date()
        }
      };

      if (businessId) {
        filters.business = businessId;
      }

      console.log('   Filters applied:', JSON.stringify(filters, null, 2));

      const reviews = await strapi.entityService.findMany('api::google-review.google-review', {
        // @ts-ignore - Strapi type system needs regeneration
        filters
      });

      console.log(`✅ [REVIEW API] Found ${reviews.length} reviews for statistics calculation`);

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
