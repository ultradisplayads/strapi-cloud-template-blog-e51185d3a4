#!/usr/bin/env node

/**
 * Test script for fetching Pattaya place details and reviews
 * Run with: node test-pattaya-reviews.js
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

async function testPattayaReviews() {
  console.log('🏖️ Testing Pattaya Place Details and Reviews...\n');

  const foursquareService = new FoursquareService();

  try {
    // Step 1: Search for Pattaya places and get fsq_place_id
    console.log('🔍 Step 1: Searching for Pattaya places...');
    const places = await foursquareService.searchPlaces('Pattaya', 'Pattaya, Thailand', 5);
    
    if (!places || places.length === 0) {
      console.log('❌ Could not find any Pattaya places');
      return;
    }
    
    // Use the first place found (Pattaya Beach)
    const pattayaPlace = places[0];
    const pattayaId = pattayaPlace.fsq_place_id;
    
    console.log(`✅ Found Pattaya place: ${pattayaPlace.name}`);
    console.log(`✅ fsq_place_id: ${pattayaId}\n`);

    // Step 2: Get place details using the fsq_place_id
    console.log('🔍 Step 2: Getting Pattaya place details...');
    const placeDetails = await foursquareService.getPlaceDetails(pattayaId);
    
    if (!placeDetails) {
      console.log('❌ Could not get place details');
      return;
    }
    
    console.log('✅ Place Details Retrieved:');
    console.log(`   Name: ${placeDetails.name}`);
    console.log(`   Address: ${placeDetails.location?.formatted_address}`);
    console.log(`   Rating: ${placeDetails.rating || 'N/A'}`);
    console.log(`   Categories: ${placeDetails.categories?.map(c => c.name).join(', ')}`);
    console.log(`   Total Tips: ${placeDetails.stats?.total_tips || 0}`);
    console.log(`   Total Ratings: ${placeDetails.stats?.total_ratings || 0}\n`);

    // Step 3: Get place tips (reviews) using the fsq_place_id
    console.log('🔍 Step 3: Getting Pattaya place tips (reviews)...');
    const tips = await foursquareService.getPlaceTips(pattayaId, 10);
    
    console.log(`✅ Retrieved ${tips.length} tips/reviews:`);
    
    if (tips.length > 0) {
      tips.forEach((tip, index) => {
        console.log(`\n   Review ${index + 1}:`);
        console.log(`   User: ${tip.user?.first_name || 'Anonymous'}`);
        console.log(`   Date: ${new Date(tip.created_at).toLocaleDateString()}`);
        console.log(`   Text: ${tip.text?.substring(0, 150)}${tip.text?.length > 150 ? '...' : ''}`);
        console.log(`   Agrees: ${tip.agree_count || 0}`);
      });
    } else {
      console.log('   No tips/reviews found for this place');
    }

    // Step 4: Transform tips to review format
    console.log('\n🔍 Step 4: Transforming tips to review format...');
    if (tips.length > 0) {
      const transformedReviews = tips.map(tip => 
        foursquareService.transformTipToReview(tip, placeDetails)
      ).filter(review => review !== null);
      
      console.log(`✅ Transformed ${transformedReviews.length} tips to reviews:`);
      
      transformedReviews.forEach((review, index) => {
        console.log(`\n   Transformed Review ${index + 1}:`);
        console.log(`   Platform: ${review.source_platform}`);
        console.log(`   Author: ${review.AuthorName}`);
        console.log(`   Rating: ${review.Rating}`);
        console.log(`   Business: ${review.BusinessName}`);
        console.log(`   Text: ${review.ReviewText?.substring(0, 100)}${review.ReviewText?.length > 100 ? '...' : ''}`);
      });
    }

    console.log('\n🎉 All steps completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Pattaya fsq_place_id: ${pattayaId}`);
    console.log(`- Place name: ${placeDetails.name}`);
    console.log(`- Total tips/reviews: ${tips.length}`);
    console.log(`- API integration: ✅ Working`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testPattayaReviews().catch(console.error);
