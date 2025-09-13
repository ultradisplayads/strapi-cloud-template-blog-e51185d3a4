#!/usr/bin/env node

/**
 * Test script to demonstrate review API logging
 * This will show the console logs when the review API is hit
 */

require('dotenv').config();

async function testReviewApiLogging() {
  console.log('🔍 Testing Review API with Console Logging...\n');

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? "https://api.pattaya1.com/api" 
    : "https://api.pattaya1.com/api";

  try {
    // Test 1: Latest reviews endpoint
    console.log('📡 Test 1: Calling /api/reviews/latest...');
    console.log(`   URL: ${baseUrl}/reviews/latest?limit=5`);
    console.log('   Expected logs: [REVIEW API] Fetching latest reviews...\n');

    const response1 = await fetch(`${baseUrl}/reviews/latest?limit=5`);
    const data1 = await response1.json();
    
    console.log(`   Response status: ${response1.status}`);
    console.log(`   Reviews returned: ${data1.data?.length || 0}`);
    console.log('');

    // Test 2: Google reviews endpoint
    console.log('📡 Test 2: Calling /api/google-reviews/latest...');
    console.log(`   URL: ${baseUrl}/google-reviews/latest?limit=3`);
    console.log('   Expected logs: [REVIEW API] Fetching latest reviews...\n');

    const response2 = await fetch(`${baseUrl}/google-reviews/latest?limit=3`);
    const data2 = await response2.json();
    
    console.log(`   Response status: ${response2.status}`);
    console.log(`   Reviews returned: ${data2.data?.length || 0}`);
    console.log('');

    // Test 3: Review stats endpoint
    console.log('📡 Test 3: Calling /api/reviews/stats...');
    console.log(`   URL: ${baseUrl}/reviews/stats`);
    console.log('   Expected logs: [REVIEW API] Fetching review statistics...\n');

    const response3 = await fetch(`${baseUrl}/reviews/stats`);
    const data3 = await response3.json();
    
    console.log(`   Response status: ${response3.status}`);
    console.log(`   Stats returned: ${JSON.stringify(data3, null, 2)}`);
    console.log('');

    console.log('🎉 Review API Logging Test Complete!');
    console.log('\n📋 What you should see in the backend console:');
    console.log('   🔍 [REVIEW API] Fetching latest reviews...');
    console.log('   📋 [REVIEW API] Reviews fetched: (with detailed review info)');
    console.log('   📤 [REVIEW API] Returning X transformed reviews to frontend');
    console.log('   📊 [REVIEW API] Fetching review statistics...');
    console.log('   ✅ [REVIEW API] Found X reviews for statistics calculation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure Strapi backend is running on localhost:1337');
    console.log('   Run: npm run develop (in strapi_backend directory)');
  }
}

// Run the test
testReviewApiLogging().catch(console.error);
