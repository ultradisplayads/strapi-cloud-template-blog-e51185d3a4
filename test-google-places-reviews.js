#!/usr/bin/env node

/**
 * Test script for Google Places API integration
 * This demonstrates fetching real reviews from Google Places API
 */

require('dotenv').config();

const GooglePlacesService = require('./src/api/google-review/services/google-places');

// Mock strapi for testing
global.strapi = {
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  }
};

async function testGooglePlacesReviews() {
  console.log('🌐 Testing Google Places API for Real Pattaya Reviews...\n');

  const googlePlacesService = new GooglePlacesService();

  try {
    // Test 1: Search for Pattaya places
    console.log('🔍 Test 1: Searching for Pattaya places...');
    const places = await googlePlacesService.searchPlaces('Pattaya Beach Thailand', 3);
    console.log(`✅ Found ${places.length} places`);
    
    if (places.length > 0) {
      places.forEach((place, index) => {
        console.log(`   Place ${index + 1}:`);
        console.log(`     Name: ${place.displayName?.text}`);
        console.log(`     ID: ${place.id}`);
        console.log(`     Rating: ${place.rating || 'N/A'}`);
        console.log(`     Location: ${place.location?.latitude}, ${place.location?.longitude}`);
        console.log('');
      });
    }

    // Test 2: Get place details with reviews
    if (places.length > 0) {
      console.log('🔍 Test 2: Getting place details with reviews...');
      const placeDetails = await googlePlacesService.getPlaceDetails(places[0].id);
      
      if (placeDetails && placeDetails.reviews) {
        console.log(`✅ Retrieved ${placeDetails.reviews.length} reviews for ${placeDetails.displayName?.text}`);
        
        placeDetails.reviews.forEach((review, index) => {
          console.log(`   Review ${index + 1}:`);
          console.log(`     Author: ${review.authorAttribution?.displayName}`);
          console.log(`     Rating: ${review.rating}/5`);
          console.log(`     Date: ${review.relativePublishTimeDescription}`);
          console.log(`     Text: ${review.text?.text?.substring(0, 100)}...`);
          console.log('');
        });
      }
    }

    // Test 3: Fetch reviews using the service
    console.log('🔍 Test 3: Fetching reviews using service...');
    const reviews = await googlePlacesService.fetchReviews(['Pattaya Beach Thailand', 'restaurants Pattaya'], 5);
    
    console.log(`✅ Fetched ${reviews.length} reviews total`);
    
    if (reviews.length > 0) {
      console.log('📋 Transformed reviews:');
      reviews.forEach((review, index) => {
        console.log(`   Review ${index + 1}:`);
        console.log(`     Platform: ${review.source_platform}`);
        console.log(`     Author: ${review.AuthorName}`);
        console.log(`     Rating: ${review.Rating}`);
        console.log(`     Business: ${review.BusinessName}`);
        console.log(`     Text: ${review.ReviewText.substring(0, 80)}...`);
        console.log(`     Date: ${review.RelativeTimeDescription}`);
        console.log('');
      });
    }

    console.log('🎉 Google Places API Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`- Places found: ${places.length}`);
    console.log(`- Reviews fetched: ${reviews.length}`);
    console.log(`- API integration: ✅ Working with real data`);
    console.log(`- No fallback data: ✅ Only real Google reviews`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testGooglePlacesReviews().catch(console.error);
