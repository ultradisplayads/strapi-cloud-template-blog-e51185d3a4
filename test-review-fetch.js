#!/usr/bin/env node

/**
 * Test script for manual review fetching
 * Run with: node test-review-fetch.js
 */

require('dotenv').config();

// Mock Strapi for testing
const mockStrapi = {
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  },
  entityService: {
    findMany: async (type) => {
      // Mock review settings
      if (type === 'api::review-settings.review-settings') {
        return [{
          id: 1,
          foursquare: {
            platform_name: 'Foursquare',
            is_enabled: true,
            daily_limit: 1000,
            rate_limit_per_minute: 10
          },
          google_places: {
            platform_name: 'Google Places',
            is_enabled: false,
            daily_limit: 20,
            rate_limit_per_minute: 10
          },
          yelp: {
            platform_name: 'Yelp',
            is_enabled: false,
            daily_limit: 500,
            rate_limit_per_minute: 5
          },
          facebook: {
            platform_name: 'Facebook',
            is_enabled: false,
            daily_limit: 200,
            rate_limit_per_minute: 5
          }
        }];
      }
      return [];
    },
    create: async (type, data) => {
      console.log(`Mock create: ${type}`, data.data);
      return { id: Math.random(), ...data.data };
    },
    update: async (type, id, data) => {
      console.log(`Mock update: ${type} ${id}`, data.data);
      return { id, ...data.data };
    }
  },
  service: (serviceName) => {
    if (serviceName === 'api::google-review.google-review') {
      return {
        saveReviews: async (reviews, cacheDays) => {
          console.log(`Mock saving ${reviews.length} reviews with ${cacheDays} days cache`);
          return {
            saved: reviews,
            skipped: [],
            total_processed: reviews.length,
            success_count: reviews.length,
            skip_count: 0
          };
        }
      };
    }
    return {};
  }
};

// Set global strapi for the services
global.strapi = mockStrapi;

const ReviewFetcherService = require('./src/api/google-review/services/review-fetcher');

async function testReviewFetch() {
  console.log('🧪 Testing Review Fetch Service...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`FOURSQUARE_CLIENT_ID: ${process.env.FOURSQUARE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`FOURSQUARE_CLIENT_SECRET: ${process.env.FOURSQUARE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.FOURSQUARE_CLIENT_ID || !process.env.FOURSQUARE_CLIENT_SECRET) {
    console.log('❌ Foursquare API credentials not configured. Please add to .env file:');
    console.log('FOURSQUARE_CLIENT_ID=your_client_id_here');
    console.log('FOURSQUARE_CLIENT_SECRET=your_client_secret_here');
    return;
  }

  const reviewFetcher = new ReviewFetcherService();

  try {
    // Test Foursquare platform specifically
    console.log('🔍 Testing Foursquare platform...');
    const result = await reviewFetcher.testPlatform('foursquare');
    
    console.log('\n📊 Test Results:');
    console.log(`Platform: ${result.platform}`);
    console.log(`Reviews fetched: ${result.reviews.length}`);
    console.log(`Reviews saved: ${result.saved || 0}`);
    console.log(`Reviews skipped: ${result.skipped || 0}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }

    if (result.reviews.length > 0) {
      console.log('\n📝 Sample Review:');
      const sampleReview = result.reviews[0];
      console.log({
        source_platform: sampleReview.source_platform,
        author_name: sampleReview.AuthorName,
        rating: sampleReview.Rating,
        review_text: sampleReview.ReviewText?.substring(0, 100) + '...',
        business_name: sampleReview.BusinessName,
        review_time: sampleReview.ReviewTime
      });
    }

    // Test full fetch
    console.log('\n🔍 Testing full review fetch...');
    const fullResult = await reviewFetcher.fetchAllReviews();
    
    console.log('\n📊 Full Fetch Results:');
    console.log(`Total fetched: ${fullResult.total_fetched || 0}`);
    console.log(`Total saved: ${fullResult.total_saved || 0}`);
    console.log(`Platforms processed: ${fullResult.platforms_processed || 0}`);
    
    if (fullResult.results) {
      console.log('\n📋 Platform Results:');
      fullResult.results.forEach(result => {
        console.log(`- ${result.platform}: ${result.fetched} fetched, ${result.saved} saved, ${result.skipped} skipped`);
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
      });
    }

    console.log('\n🎉 Review fetch test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testReviewFetch().catch(console.error);
