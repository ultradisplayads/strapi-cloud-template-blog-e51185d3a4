#!/usr/bin/env node

/**
 * Test Video Monetization System
 * Tests the core functionality of the video scheduler and API endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://locahost:1337/api';

async function testVideoSystem() {
  console.log('🚀 Testing Video Monetization System...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  async function runTest(name, testFn) {
    try {
      console.log(`🔄 Testing: ${name}`);
      await testFn();
      console.log(`✅ PASSED: ${name}\n`);
      results.passed++;
      results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}\n`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }
  
  // Test 1: Video API endpoint
  await runTest('Video API Endpoint', async () => {
    const response = await axios.get(`${BASE_URL}/videos`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.data) throw new Error('Missing data array in response');
    console.log(`   Found ${response.data.meta.pagination.total} videos`);
  });
  
  // Test 2: Trending Topics (used by video scheduler)
  await runTest('Trending Topics API', async () => {
    const response = await axios.get(`${BASE_URL}/trending-topics`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.data) throw new Error('Missing data array in response');
    console.log(`   Found ${response.data.data.length} trending topics`);
  });
  
  // Test 3: YouTube Videos content type
  await runTest('YouTube Videos Content Type', async () => {
    const response = await axios.get(`${BASE_URL}/youtube-videos`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    console.log(`   Found ${response.data.meta.pagination.total} YouTube videos`);
  });
  
  // Test 4: Video Service Health Check
  await runTest('Video Service Availability', async () => {
    // Test if we can access the video service through a simple query
    const response = await axios.get(`${BASE_URL}/videos?pagination[limit]=1`);
    if (response.status !== 200) throw new Error('Video service not responding');
    console.log('   Video service responding correctly');
  });
  
  // Test 5: Check if video scheduler is running (indirect test)
  await runTest('Video Scheduler Status Check', async () => {
    // We can't directly test the scheduler, but we can verify the system is set up correctly
    const videoResponse = await axios.get(`${BASE_URL}/videos`);
    const topicsResponse = await axios.get(`${BASE_URL}/trending-topics`);
    
    if (videoResponse.status !== 200 || topicsResponse.status !== 200) {
      throw new Error('Core video system components not responding');
    }
    
    console.log('   Video scheduler dependencies are available');
    console.log('   Scheduler should be running in background via bootstrap');
  });
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);
  
  if (results.failed === 0) {
    console.log('🎉 All tests passed! Video monetization system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above for details.');
  }
  
  return results;
}

// Run the tests
testVideoSystem().catch(console.error);
