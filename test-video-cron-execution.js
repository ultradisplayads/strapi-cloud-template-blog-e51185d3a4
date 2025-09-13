#!/usr/bin/env node

/**
 * Test Video Scheduler Cron Execution
 * Verifies if video scheduler cron jobs are actually running
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

async function testCronExecution() {
  console.log('🔍 Testing Video Scheduler Cron Execution...\n');
  
  try {
    // Get initial video count
    console.log('📊 Initial State:');
    const initialResponse = await axios.get(`${BASE_URL}/videos`);
    const initialCount = initialResponse.data.meta.pagination.total;
    console.log(`   Videos in database: ${initialCount}`);
    
    // Show current cron schedule
    console.log('\n⏰ Video Scheduler Cron Configuration:');
    console.log('   • Daytime fetching: */30 6-23 * * * (every 30 min, 6AM-11PM)');
    console.log('   • Nighttime fetching: 0 */2 0-5 * * * (every 2 hours, 12AM-5AM)');
    console.log('   • Trending mode: */5 * * * * (every 5 minutes)');
    console.log('   • Daily cleanup: 0 2 * * * (2 AM daily)');
    console.log('   • Stats update: 0 */6 * * * (every 6 hours)');
    
    // Current time analysis
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    console.log(`\n🕐 Current Time Analysis:`);
    console.log(`   Bangkok time: ${now.toLocaleString('en-US', {timeZone: 'Asia/Bangkok'})}`);
    console.log(`   Hour: ${hour}, Minute: ${minute}`);
    
    // Determine which cron jobs should be active
    let activeJobs = [];
    let nextFetch = null;
    
    if (hour >= 6 && hour <= 23) {
      // Daytime mode
      const minutesUntilNext = 30 - (minute % 30);
      nextFetch = `${minutesUntilNext} minutes (daytime mode)`;
      activeJobs.push('Daytime fetching');
    } else {
      // Nighttime mode (0-5 AM)
      const nextHour = Math.ceil(hour / 2) * 2;
      if (nextHour > 5) {
        // Next fetch is at 6 AM
        const hoursUntil = 6 - hour;
        const minutesUntil = 60 - minute;
        nextFetch = `${hoursUntil}h ${minutesUntil}m (switching to daytime)`;
      } else {
        const hoursUntil = nextHour - hour;
        const minutesUntil = hoursUntil > 0 ? 0 : 60 - minute;
        nextFetch = `${hoursUntil}h ${minutesUntil}m (nighttime mode)`;
      }
      activeJobs.push('Nighttime fetching');
    }
    
    // Trending mode is always active
    const trendingNext = 5 - (minute % 5);
    activeJobs.push(`Trending mode (next: ${trendingNext} min)`);
    
    console.log(`\n🎯 Active Cron Jobs:`);
    activeJobs.forEach(job => console.log(`   • ${job}`));
    console.log(`\n⏳ Next video fetch: ${nextFetch}`);
    
    // Check if trending topics exist for trending mode
    console.log(`\n📈 Trending Topics Check:`);
    const topicsResponse = await axios.get(`${BASE_URL}/trending-topics`);
    const topics = topicsResponse.data.data;
    const activeTopics = topics.filter(t => t.IsActive);
    
    console.log(`   Total topics: ${topics.length}`);
    console.log(`   Active topics: ${activeTopics.length}`);
    activeTopics.forEach(topic => {
      console.log(`     • ${topic.Title} (${topic.Category})`);
    });
    
    if (activeTopics.length === 0) {
      console.log('   ⚠️  No active trending topics - trending mode won\'t fetch');
    }
    
    // Monitor for cron execution (wait 5 minutes to catch trending mode)
    console.log(`\n⏳ Monitoring Cron Execution (5 minute test)...`);
    console.log('   Watching for new videos from cron jobs...');
    
    const startTime = Date.now();
    let lastCount = initialCount;
    let checksPerformed = 0;
    
    // Check every 30 seconds for 5 minutes
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      
      const checkResponse = await axios.get(`${BASE_URL}/videos`);
      const currentCount = checkResponse.data.meta.pagination.total;
      checksPerformed++;
      
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`   Check ${checksPerformed}/10 (${elapsed}s): ${currentCount} videos`);
      
      if (currentCount > lastCount) {
        const newVideos = currentCount - lastCount;
        console.log(`   🎉 NEW VIDEOS DETECTED! Added ${newVideos} videos`);
        
        // Show the new videos
        const newVideoResponse = await axios.get(`${BASE_URL}/videos?sort=createdAt:desc&pagination[limit]=${newVideos}`);
        newVideoResponse.data.data.forEach((video, index) => {
          const createdAt = new Date(video.createdAt);
          console.log(`     ${index + 1}. "${video.title}" (${video.videostatus}) - ${createdAt.toLocaleTimeString()}`);
        });
        
        lastCount = currentCount;
      }
    }
    
    const totalElapsed = Math.round((Date.now() - startTime) / 1000);
    const totalNewVideos = lastCount - initialCount;
    
    console.log(`\n📊 CRON EXECUTION RESULTS:`);
    console.log(`   Test duration: ${totalElapsed} seconds`);
    console.log(`   Initial videos: ${initialCount}`);
    console.log(`   Final videos: ${lastCount}`);
    console.log(`   New videos from cron: ${totalNewVideos}`);
    
    if (totalNewVideos > 0) {
      console.log(`\n✅ CRON JOBS ARE WORKING!`);
      console.log(`   Video scheduler successfully fetched ${totalNewVideos} videos`);
      console.log(`   Cron execution confirmed during test period`);
    } else {
      console.log(`\n❌ CRON JOBS NOT EXECUTING`);
      console.log(`   No new videos detected during 5-minute test`);
      console.log(`   Possible issues:`);
      console.log(`     • Strapi bootstrap cron jobs not running`);
      console.log(`     • YouTube API key not configured`);
      console.log(`     • Network/API access issues`);
      console.log(`     • Cron timing doesn't align with test window`);
    }
    
  } catch (error) {
    console.error('❌ Cron execution test failed:', error.message);
  }
}

testCronExecution();
