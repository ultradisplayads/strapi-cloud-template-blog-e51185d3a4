#!/usr/bin/env node

/**
 * Test script for Foursquare API integration
 * Run with: node test-foursquare-integration.js
 */

require('dotenv').config();

const FoursquareService = require('./src/api/google-review/services/foursquare');

// Mock strapi for testing
global.strapi = {
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  }
};

async function testFoursquareIntegration() {
  console.log('🧪 Testing Foursquare API Integration...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`FOURSQUARE_CLIENT_ID: ${process.env.FOURSQUARE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`FOURSQUARE_CLIENT_SECRET: ${process.env.FOURSQUARE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`FOURSQUARE_SERVICE_KEY: ${process.env.FOURSQUARE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`FOURSQUARE_BEARER_TOKEN: ${process.env.FOURSQUARE_BEARER_TOKEN ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.FOURSQUARE_BEARER_TOKEN && !process.env.FOURSQUARE_SERVICE_KEY && (!process.env.FOURSQUARE_CLIENT_ID || !process.env.FOURSQUARE_CLIENT_SECRET)) {
    console.log('❌ Foursquare API credentials not configured. Please add to .env file:');
    console.log('FOURSQUARE_BEARER_TOKEN=your_bearer_token_here (recommended)');
    console.log('OR');
    console.log('FOURSQUARE_SERVICE_KEY=your_service_key_here');
    console.log('OR');
    console.log('FOURSQUARE_CLIENT_ID=your_client_id_here');
    console.log('FOURSQUARE_CLIENT_SECRET=your_client_secret_here');
    return;
  }

  const foursquareService = new FoursquareService();

  try {
    // Test 0: Direct API test first
    console.log('🔍 Test 0: Testing direct API call...');
    const testUrl = 'https://places-api.foursquare.com/places/search?query=Pattaya&near=Pattaya%2C%20TH&limit=1';
    const testHeaders = foursquareService.getAuthHeaders();
    console.log('Using headers:', testHeaders);
    
    try {
      const testResponse = await fetch(testUrl, { headers: testHeaders });
      console.log(`API Response Status: ${testResponse.status}`);
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.log(`API Error Response: ${errorText}`);
      } else {
        const testData = await testResponse.json();
        console.log('API Success Response:', JSON.stringify(testData, null, 2));
      }
    } catch (apiError) {
      console.log('Direct API test error:', apiError.message);
    }

    // Test 1: Search for places
    console.log('\n🔍 Test 1: Searching for places in Pattaya...');
    const places = await foursquareService.searchPlaces('restaurants', 'Pattaya, Thailand', 5);
    console.log(`✅ Found ${places.length} places`);
    
    if (places.length > 0) {
      console.log('Sample place:', {
        name: places[0].name,
        fsq_id: places[0].fsq_id,
        location: places[0].location?.formatted_address
      });
    }

    // Test 2: Get place details
    if (places.length > 0) {
      console.log('\n🔍 Test 2: Getting place details...');
      const placeDetails = await foursquareService.getPlaceDetails(places[0].fsq_id);
      if (placeDetails) {
        console.log(`✅ Retrieved details for: ${placeDetails.name}`);
        console.log('Rating:', placeDetails.rating);
        console.log('Categories:', placeDetails.categories?.map(c => c.name).join(', '));
      }
    }

    // Test 3: Get place tips (reviews)
    if (places.length > 0) {
      console.log('\n🔍 Test 3: Getting place tips...');
      const tips = await foursquareService.getPlaceTips(places[0].fsq_id, 3);
      console.log(`✅ Retrieved ${tips.length} tips`);
      
      if (tips.length > 0) {
        console.log('Sample tip:', {
          text: tips[0].text?.substring(0, 100) + '...',
          user: tips[0].user?.first_name,
          created_at: tips[0].created_at
        });
      }
    }

    // Test 4: Transform tip to review format
    if (places.length > 0) {
      console.log('\n🔍 Test 4: Transforming tip to review format...');
      const tips = await foursquareService.getPlaceTips(places[0].fsq_id, 1);
      if (tips.length > 0) {
        const review = foursquareService.transformTipToReview(tips[0], places[0]);
        if (review) {
          console.log('✅ Transformed tip to review:', {
            source_platform: review.source_platform,
            author_name: review.AuthorName,
            rating: review.Rating,
            review_text: review.ReviewText?.substring(0, 100) + '...',
            business_name: review.BusinessName
          });
        }
      }
    }

    // Test 5: Full review fetch
    console.log('\n🔍 Test 5: Full review fetch...');
    const reviews = await foursquareService.fetchReviews(['restaurants'], 'Pattaya, Thailand');
    console.log(`✅ Fetched ${reviews.length} reviews total`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Places found: ${places.length}`);
    console.log(`- Reviews fetched: ${reviews.length}`);
    console.log(`- API integration: ✅ Working`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testFoursquareIntegration().catch(console.error);
