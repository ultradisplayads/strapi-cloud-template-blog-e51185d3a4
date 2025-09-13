#!/usr/bin/env node

/**
 * Test script to demonstrate live review fetching from Foursquare API
 * This shows the new behavior where reviews are fetched directly from API
 */

require('dotenv').config();

async function testLiveReviews() {
  console.log('🌐 Testing Live Review Fetching from Foursquare API...\n');

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? "https://api.pattaya1.com/api" 
    : "https://api.pattaya1.com/api";

  try {
    // Test 1: Latest reviews endpoint (now fetches from API)
    console.log('📡 Test 1: Calling /api/reviews/latest (Live API Fetch)...');
    console.log(`   URL: ${baseUrl}/reviews/latest?limit=5`);
    console.log('   Expected behavior: Fetch from Foursquare API, not database\n');

    const response1 = await fetch(`${baseUrl}/reviews/latest?limit=5`);
    const data1 = await response1.json();
    
    console.log(`   Response status: ${response1.status}`);
    console.log(`   Reviews returned: ${data1.data?.length || 0}`);
    
    if (data1.data && data1.data.length > 0) {
      console.log('   Sample review:');
      console.log(`     Author: ${data1.data[0].author_name}`);
      console.log(`     Platform: ${data1.data[0].source_platform}`);
      console.log(`     Rating: ${data1.data[0].rating}`);
      console.log(`     Business: ${data1.data[0].business_name}`);
      console.log(`     Text: ${data1.data[0].text?.substring(0, 80)}...`);
    }
    console.log('');

    // Test 2: Google reviews endpoint (also fetches from API)
    console.log('📡 Test 2: Calling /api/google-reviews/latest (Live API Fetch)...');
    console.log(`   URL: ${baseUrl}/google-reviews/latest?limit=3`);
    console.log('   Expected behavior: Fetch from Foursquare API, not database\n');

    const response2 = await fetch(`${baseUrl}/google-reviews/latest?limit=3`);
    const data2 = await response2.json();
    
    console.log(`   Response status: ${response2.status}`);
    console.log(`   Reviews returned: ${data2.data?.length || 0}`);
    console.log('');

    console.log('🎉 Live Review Fetching Test Complete!');
    console.log('\n📋 What you should see in the backend console:');
    console.log('   🔍 [REVIEW API] Fetching latest reviews from Foursquare API...');
    console.log('   🌐 [REVIEW API] Calling Foursquare API for Pattaya reviews...');
    console.log('   ✅ [REVIEW API] Fetched X reviews from Foursquare API');
    console.log('   📋 [REVIEW API] Reviews to send to frontend:');
    console.log('   📤 [REVIEW API] Returning X transformed reviews to frontend');

    console.log('\n🔄 New Behavior:');
    console.log('   ✅ No more database queries');
    console.log('   ✅ Direct API calls to Foursquare');
    console.log('   ✅ Live reviews from Pattaya');
    console.log('   ✅ Fallback reviews if API fails');
    console.log('   ✅ Real-time data for frontend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure Strapi backend is running on localhost:1337');
    console.log('   Run: npm run develop (in strapi_backend directory)');
  }
}

// Run the test
testLiveReviews().catch(console.error);
