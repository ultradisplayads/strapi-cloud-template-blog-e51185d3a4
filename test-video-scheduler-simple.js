#!/usr/bin/env node

/**
 * Simple Video Scheduler Test
 * Quick test to verify video creation and scheduler functionality
 */

const axios = require('axios');

const BASE_URL = 'https://api.pattaya1.com/api';

async function testVideoScheduler() {
  console.log('🎬 Testing Video Scheduler (Simple)...\n');
  
  try {
    // Get initial video count
    const initialResponse = await axios.get(`${BASE_URL}/videos`);
    const initialCount = initialResponse.data.meta.pagination.total;
    console.log(`📊 Initial videos: ${initialCount}`);
    
    // Test video creation with correct schema
    console.log('\n🔧 Testing video creation...');
    const testVideo = {
      data: {
        title: 'Test Video - Scheduler Fix',
        description: 'Testing video scheduler functionality',
        video_id: `test_${Date.now()}`,
        channel_id: 'test_channel_123',
        channel_name: 'Test Channel',
        videostatus: 'pending',
        view_count: 1000,
        like_count: 50,
        duration: 'PT3M30S',
        video_published_at: new Date().toISOString(),
        thumbnail_url: 'https://img.youtube.com/vi/test/maxresdefault.jpg',
        category: 'Travel',
        source_keyword: 'test'
      }
    };
    
    const createResponse = await axios.post(`${BASE_URL}/videos`, testVideo);
    console.log(`✅ Video created: ID ${createResponse.data.data.id}`);
    
    // Verify count increased
    const finalResponse = await axios.get(`${BASE_URL}/videos`);
    const finalCount = finalResponse.data.meta.pagination.total;
    console.log(`📈 Video count: ${initialCount} → ${finalCount}`);
    
    if (finalCount > initialCount) {
      console.log('\n🎉 SUCCESS: Video creation working!');
      console.log('✅ Alternative scheduler should now work');
      console.log('🚀 Ready to run: node scripts/alternative-video-scheduler.js');
    } else {
      console.log('\n❌ Video creation failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
  }
}

testVideoScheduler();
