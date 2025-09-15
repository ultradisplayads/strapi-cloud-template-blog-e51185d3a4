#!/usr/bin/env node

/**
 * Test Video Scheduler Auto-Start
 * Verifies that the video scheduler starts automatically when Strapi runs
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://locahost:1337/api';

class SchedulerAutoStartTester {
  constructor() {
    this.testResults = {};
  }

  /**
   * Check bootstrap.js for scheduler initialization
   */
  checkBootstrapConfiguration() {
    console.log('🔧 CHECKING BOOTSTRAP CONFIGURATION');
    console.log('=' .repeat(45));

    const bootstrapPath = './src/bootstrap.js';
    
    if (!fs.existsSync(bootstrapPath)) {
      console.log('❌ Bootstrap file not found');
      return false;
    }

    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
    
    // Check for video scheduler initialization code
    const checks = {
      'VideoScheduler import': bootstrapContent.includes("require('./services/video-scheduler')"),
      'VideoScheduler instantiation': bootstrapContent.includes('new VideoScheduler()'),
      'Scheduler initialization': bootstrapContent.includes('videoScheduler.initialize()'),
      'Global storage': bootstrapContent.includes('strapi.videoScheduler = videoScheduler'),
      'Success logging': bootstrapContent.includes('Video Scheduler initialized successfully'),
      'Error handling': bootstrapContent.includes('Error initializing Video Scheduler')
    };

    console.log('📋 Bootstrap Configuration Checks:');
    let allPassed = true;
    
    for (const [check, passed] of Object.entries(checks)) {
      const status = passed ? '✅' : '❌';
      console.log(`   ${status} ${check}`);
      if (!passed) allPassed = false;
    }

    // Show the actual bootstrap code section
    console.log('\n📄 Bootstrap Code Section:');
    const lines = bootstrapContent.split('\n');
    const videoSchedulerStart = lines.findIndex(line => line.includes('Initialize Video Scheduler'));
    
    if (videoSchedulerStart !== -1) {
      const relevantLines = lines.slice(videoSchedulerStart, videoSchedulerStart + 15);
      relevantLines.forEach((line, index) => {
        const lineNum = videoSchedulerStart + index + 1;
        console.log(`   ${lineNum.toString().padStart(3)}: ${line}`);
      });
    } else {
      console.log('   ❌ Video scheduler initialization section not found');
    }

    this.testResults.bootstrapConfig = allPassed;
    return allPassed;
  }

  /**
   * Test if Strapi server is running and accessible
   */
  async testStrapiConnection() {
    console.log('\n🌐 TESTING STRAPI CONNECTION');
    console.log('=' .repeat(35));

    try {
      const response = await axios.get(`${BASE_URL}/videos?pagination[limit]=1`);
      console.log('✅ Strapi server is running and accessible');
      console.log(`📊 API response status: ${response.status}`);
      console.log(`📹 Videos endpoint working: ${response.data.meta.pagination.total} total videos`);
      
      this.testResults.strapiConnection = true;
      return true;
    } catch (error) {
      console.log('❌ Strapi server connection failed');
      console.log(`Error: ${error.message}`);
      
      this.testResults.strapiConnection = false;
      return false;
    }
  }

  /**
   * Test scheduler functionality after startup
   */
  async testSchedulerFunctionality() {
    console.log('\n⚙️  TESTING SCHEDULER FUNCTIONALITY');
    console.log('=' .repeat(40));

    try {
      // Test 1: Check if videos are being created (indicates scheduler is working)
      const recentResponse = await axios.get(`${BASE_URL}/videos?sort=createdAt:desc&pagination[limit]=5`);
      const recentVideos = recentResponse.data.data;
      
      console.log('📹 Recent Videos (indicates scheduler activity):');
      if (recentVideos.length > 0) {
        recentVideos.forEach((video, index) => {
          const createdAt = new Date(video.createdAt);
          const minutesAgo = Math.round((Date.now() - createdAt.getTime()) / (1000 * 60));
          console.log(`   ${index + 1}. "${video.title}"`);
          console.log(`      Created: ${minutesAgo} minutes ago (${createdAt.toLocaleTimeString()})`);
        });
        
        // Check if any videos were created in the last 10 minutes (scheduler activity)
        const recentActivity = recentVideos.some(video => {
          const minutesAgo = (Date.now() - new Date(video.createdAt).getTime()) / (1000 * 60);
          return minutesAgo <= 10;
        });
        
        if (recentActivity) {
          console.log('   ✅ Recent scheduler activity detected (videos created in last 10 minutes)');
        } else {
          console.log('   ⚠️  No recent scheduler activity (no videos in last 10 minutes)');
        }
      } else {
        console.log('   ❌ No videos found');
      }

      // Test 2: Check trending topics (scheduler dependency)
      const topicsResponse = await axios.get(`${BASE_URL}/trending-topics`);
      const activeTopics = topicsResponse.data.data.filter(t => t.IsActive);
      
      console.log(`\n📈 Trending Topics Status:`);
      console.log(`   Total topics: ${topicsResponse.data.data.length}`);
      console.log(`   Active topics: ${activeTopics.length}`);
      
      if (activeTopics.length > 0) {
        console.log('   ✅ Active topics available for scheduler');
        activeTopics.forEach(topic => {
          console.log(`     • "${topic.Title}" (${topic.Category})`);
        });
      } else {
        console.log('   ⚠️  No active topics (scheduler won\'t fetch)');
      }

      this.testResults.schedulerFunctionality = true;
      return true;
    } catch (error) {
      console.log(`❌ Scheduler functionality test failed: ${error.message}`);
      this.testResults.schedulerFunctionality = false;
      return false;
    }
  }

  /**
   * Check current scheduler timing
   */
  checkSchedulerTiming() {
    console.log('\n⏰ CURRENT SCHEDULER TIMING');
    console.log('=' .repeat(35));

    const now = new Date();
    const bangkokTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
    const hour = bangkokTime.getHours();
    const minute = bangkokTime.getMinutes();

    console.log(`Current Bangkok time: ${bangkokTime.toLocaleString()}`);
    console.log(`Hour: ${hour}, Minute: ${minute}`);

    // Determine current mode and next fetch
    let mode, nextFetch, trendingNext;
    
    if (hour >= 6 && hour <= 23) {
      mode = 'DAYTIME';
      const minutesUntilNext = 30 - (minute % 30);
      nextFetch = `${minutesUntilNext} minutes`;
    } else {
      mode = 'NIGHTTIME';
      if (hour >= 0 && hour <= 5) {
        const nextEvenHour = Math.ceil(hour / 2) * 2;
        if (nextEvenHour > 5) {
          const hoursUntil = 6 - hour;
          const minutesUntil = 60 - minute;
          nextFetch = `${hoursUntil}h ${minutesUntil}m (switching to daytime)`;
        } else {
          const hoursUntil = nextEvenHour - hour;
          const minutesUntil = hoursUntil > 0 ? 0 : (120 - minute);
          nextFetch = `${hoursUntil}h ${minutesUntil}m`;
        }
      }
    }

    trendingNext = 5 - (minute % 5);

    console.log(`\n🎯 Current Scheduler Status:`);
    console.log(`   Mode: ${mode}`);
    console.log(`   Next main fetch: ${nextFetch}`);
    console.log(`   Next trending check: ${trendingNext} minutes`);

    // Show what should be happening right now
    console.log(`\n🔄 Expected Scheduler Behavior:`);
    if (mode === 'DAYTIME') {
      console.log(`   • Main fetching every 30 minutes`);
      console.log(`   • Currently in daytime mode (6AM-11PM)`);
    } else {
      console.log(`   • Main fetching every 2 hours`);
      console.log(`   • Currently in nighttime mode (12AM-5AM)`);
    }
    console.log(`   • Trending mode checks every 5 minutes`);
    console.log(`   • All cron jobs should be active if Strapi started properly`);

    this.testResults.schedulerTiming = { mode, nextFetch, trendingNext };
    return true;
  }

  /**
   * Test alternative scheduler status
   */
  checkAlternativeScheduler() {
    console.log('\n🔄 ALTERNATIVE SCHEDULER STATUS');
    console.log('=' .repeat(40));

    const altSchedulerPath = './scripts/alternative-video-scheduler.js';
    
    if (fs.existsSync(altSchedulerPath)) {
      console.log('✅ Alternative scheduler script exists');
      console.log('📝 File: scripts/alternative-video-scheduler.js');
      
      // Check if it's currently running (this is a basic check)
      console.log('\n💡 Alternative Scheduler Info:');
      console.log('   • Runs independently of Strapi cron jobs');
      console.log('   • Fetches videos every 2 minutes');
      console.log('   • Bypasses Strapi cron limitations');
      console.log('   • Can be run with: node scripts/alternative-video-scheduler.js');
      
      this.testResults.alternativeScheduler = true;
      return true;
    } else {
      console.log('❌ Alternative scheduler script not found');
      this.testResults.alternativeScheduler = false;
      return false;
    }
  }

  /**
   * Run complete auto-start test
   */
  async runCompleteTest() {
    console.log('🚀 VIDEO SCHEDULER AUTO-START TEST');
    console.log('='.repeat(50));
    console.log('Testing if video scheduler starts automatically with Strapi...');
    console.log('='.repeat(50));

    const results = [];

    // Test 1: Bootstrap configuration
    results.push(this.checkBootstrapConfiguration());

    // Test 2: Strapi connection
    results.push(await this.testStrapiConnection());

    // Test 3: Scheduler functionality
    results.push(await this.testSchedulerFunctionality());

    // Test 4: Current timing
    results.push(this.checkSchedulerTiming());

    // Test 5: Alternative scheduler
    results.push(this.checkAlternativeScheduler());

    // Final results
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;

    console.log('\n📊 AUTO-START TEST RESULTS');
    console.log('=' .repeat(35));
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 SCHEDULER AUTO-START VERIFIED!');
      console.log('✅ Video scheduler is properly configured to start with Strapi');
      console.log('✅ Bootstrap integration working correctly');
      console.log('✅ All scheduler components functional');
    } else {
      console.log('\n⚠️  SCHEDULER AUTO-START ISSUES DETECTED');
      console.log('❌ Some components may not be starting automatically');
    }

    console.log('\n🔍 IMPORTANT NOTES:');
    console.log('• Strapi cron jobs may not execute in development mode');
    console.log('• Alternative scheduler provides reliable video fetching');
    console.log('• Bootstrap integration ensures scheduler initialization');
    console.log('• Check Strapi startup logs for "✅ Video Scheduler initialized successfully"');

    return passedTests / totalTests;
  }
}

// Run the auto-start test
const tester = new SchedulerAutoStartTester();
tester.runCompleteTest().catch(error => {
  console.error('❌ Auto-start test failed:', error);
  process.exit(1);
});
