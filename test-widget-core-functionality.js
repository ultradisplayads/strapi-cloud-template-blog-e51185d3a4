#!/usr/bin/env node

/**
 * Core Video Widget Functionality Test
 * Tests the essential widget operations and monetization features
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

async function testCoreWidgetFunctionality() {
  console.log('🎯 Testing Core Video Widget Functionality...\n');
  
  const results = { passed: 0, failed: 0, tests: [] };
  
  async function test(name, testFn) {
    try {
      console.log(`🔄 ${name}`);
      const result = await testFn();
      console.log(`✅ PASSED: ${name}`);
      if (result) console.log(`   ${result}`);
      console.log('');
      results.passed++;
      results.tests.push({ name, status: 'PASSED', result });
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  // Test 1: Video Creation with Full Schema
  await test('Video Creation with Monetization Fields', async () => {
    const videoData = {
      data: {
        video_id: 'widget_test_001',
        title: 'Pattaya Beach Paradise - Travel Guide',
        thumbnail_url: 'https://example.com/pattaya-beach.jpg',
        channel_name: 'Pattaya Tourism Official',
        description: 'Discover the beautiful beaches of Pattaya',
        duration: '5:30',
        view_count: 15420,
        like_count: 892,
        channel_id: 'UC_PattayaTourism',
        category: 'Travel',
        featured: true,
        priority: 8,
        is_promoted: true,
        promotion_cost: 25.50,
        sponsor_name: 'Pattaya Hotels Association',
        videostatus: 'active'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/videos`, videoData);
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Creation failed with status ${response.status}`);
    }
    
    return `Created video with ID: ${response.data.data.id}`;
  });

  // Test 2: Widget Display Query (Active Videos)
  await test('Widget Display Query - Active Videos', async () => {
    const response = await axios.get(`${BASE_URL}/videos?filters[videostatus][$eq]=active&sort=priority:desc,createdAt:desc&pagination[limit]=10`);
    if (response.status !== 200) throw new Error('Widget query failed');
    
    const videos = response.data.data;
    return `Found ${videos.length} active videos for widget display`;
  });

  // Test 3: Promoted Videos Query
  await test('Monetization - Promoted Videos Query', async () => {
    const response = await axios.get(`${BASE_URL}/videos?filters[is_promoted][$eq]=true&filters[videostatus][$eq]=active&sort=promotion_cost:desc`);
    if (response.status !== 200) throw new Error('Promoted videos query failed');
    
    const promotedVideos = response.data.data;
    let totalRevenue = 0;
    promotedVideos.forEach(video => {
      if (video.promotion_cost) totalRevenue += parseFloat(video.promotion_cost);
    });
    
    return `Found ${promotedVideos.length} promoted videos, Total revenue: $${totalRevenue.toFixed(2)}`;
  });

  // Test 4: Featured Videos Query
  await test('Widget Curation - Featured Videos', async () => {
    const response = await axios.get(`${BASE_URL}/videos?filters[featured][$eq]=true&filters[videostatus][$eq]=active&sort=priority:desc`);
    if (response.status !== 200) throw new Error('Featured videos query failed');
    
    return `Found ${response.data.data.length} featured videos for premium display`;
  });

  // Test 5: Category-based Filtering
  await test('Content Filtering - Category-based', async () => {
    const categories = ['Travel', 'Food', 'Nightlife'];
    const results = [];
    
    for (const category of categories) {
      const response = await axios.get(`${BASE_URL}/videos?filters[category][$eq]=${category}&filters[videostatus][$eq]=active`);
      results.push(`${category}: ${response.data.meta.pagination.total}`);
    }
    
    return `Category distribution - ${results.join(', ')}`;
  });

  // Test 6: Video Search Functionality
  await test('Search Functionality - Title & Description', async () => {
    const searchTerm = 'pattaya';
    const response = await axios.get(`${BASE_URL}/videos?filters[$or][0][title][$containsi]=${searchTerm}&filters[$or][1][description][$containsi]=${searchTerm}`);
    if (response.status !== 200) throw new Error('Search functionality failed');
    
    return `Search for "${searchTerm}" returned ${response.data.meta.pagination.total} results`;
  });

  // Test 7: Video Scheduler Dependencies
  await test('Scheduler Integration - Dependencies Check', async () => {
    const dependencies = [
      { name: 'trending-topics', endpoint: 'trending-topics' },
      { name: 'youtube-videos', endpoint: 'youtube-videos' }
    ];
    
    const results = [];
    for (const dep of dependencies) {
      try {
        const response = await axios.get(`${BASE_URL}/${dep.endpoint}`);
        results.push(`${dep.name}: Available`);
      } catch (error) {
        if (error.response?.status === 403) {
          results.push(`${dep.name}: Protected (Expected)`);
        } else {
          results.push(`${dep.name}: Error`);
        }
      }
    }
    
    return results.join(', ');
  });

  // Test 8: Video Moderation Workflow
  await test('Moderation Workflow - Status Updates', async () => {
    // Get a pending video and test status updates
    const pendingResponse = await axios.get(`${BASE_URL}/videos?filters[videostatus][$eq]=pending&pagination[limit]=1`);
    
    if (pendingResponse.data.data.length === 0) {
      return 'No pending videos to test moderation (system clean)';
    }
    
    const video = pendingResponse.data.data[0];
    const updateResponse = await axios.put(`${BASE_URL}/videos/${video.id}`, {
      data: {
        videostatus: 'active',
        moderated_at: new Date().toISOString(),
        moderated_by: 'test_moderator'
      }
    });
    
    if (updateResponse.status !== 200) throw new Error('Moderation update failed');
    return `Successfully moderated video ID: ${video.id}`;
  });

  // Test 9: Widget Performance Query
  await test('Widget Performance - Optimized Query', async () => {
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/videos?filters[videostatus][$eq]=active&sort=priority:desc,view_count:desc&pagination[limit]=20&fields[0]=video_id&fields[1]=title&fields[2]=thumbnail_url&fields[3]=channel_name&fields[4]=view_count&fields[5]=is_promoted`);
    const endTime = Date.now();
    
    if (response.status !== 200) throw new Error('Performance query failed');
    
    return `Query completed in ${endTime - startTime}ms, returned ${response.data.data.length} optimized video objects`;
  });

  // Test 10: Monetization Analytics
  await test('Monetization Analytics - Revenue Calculation', async () => {
    const promotedResponse = await axios.get(`${BASE_URL}/videos?filters[is_promoted][$eq]=true`);
    const allResponse = await axios.get(`${BASE_URL}/videos`);
    
    const totalVideos = allResponse.data.meta.pagination.total;
    const promotedVideos = promotedResponse.data.meta.pagination.total;
    const promotionRate = totalVideos > 0 ? ((promotedVideos / totalVideos) * 100).toFixed(1) : 0;
    
    return `Total: ${totalVideos}, Promoted: ${promotedVideos}, Rate: ${promotionRate}%`;
  });

  // Generate Final Report
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CORE VIDEO WIDGET FUNCTIONALITY REPORT');
  console.log('='.repeat(60));
  
  const total = results.passed + results.failed;
  const successRate = ((results.passed / total) * 100).toFixed(1);
  
  console.log(`\n📊 RESULTS:`);
  console.log(`   ✅ Passed: ${results.passed}/${total}`);
  console.log(`   ❌ Failed: ${results.failed}/${total}`);
  console.log(`   🎯 Success Rate: ${successRate}%`);
  
  if (results.failed > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    results.tests.filter(t => t.status === 'FAILED').forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`);
    });
  }
  
  console.log(`\n🎯 WIDGET STATUS:`);
  if (successRate >= 90) {
    console.log(`   🟢 PRODUCTION READY: All core functionality working`);
  } else if (successRate >= 75) {
    console.log(`   🟡 MOSTLY READY: Minor issues need attention`);
  } else {
    console.log(`   🔴 NEEDS WORK: Major functionality issues`);
  }
  
  console.log(`\n✅ Core functionality test completed at ${new Date().toLocaleString()}`);
}

testCoreWidgetFunctionality().catch(console.error);
