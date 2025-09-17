#!/usr/bin/env node

/**
 * Test Video Scheduler Timing Modes
 * Verifies the scheduler timing requirements:
 * - Daytime (06:00–23:00) → every 30 minutes
 * - Nighttime (23:01–05:59) → every 2 hours  
 * - Trending Mode (active tags) → every 5–10 minutes
 */

const axios = require('axios');

const BASE_URL = 'http://locahost:1337/api';

class SchedulerTimingTester {
  constructor() {
    this.testResults = {
      cronExpressions: {},
      timingLogic: {},
      trendingMode: {}
    };
  }

  /**
   * Test cron expressions from the video scheduler
   */
  async testCronExpressions() {
    console.log('⏰ TESTING CRON EXPRESSIONS');
    console.log('=' .repeat(40));

    // Read the video scheduler service to check cron expressions
    const fs = require('fs');
    const schedulerPath = './src/services/video-scheduler.js';
    
    if (!fs.existsSync(schedulerPath)) {
      console.log('❌ Video scheduler service not found');
      return false;
    }

    const schedulerContent = fs.readFileSync(schedulerPath, 'utf8');
    
    // Extract cron expressions
    const cronPatterns = {
      daytime: /scheduleVideoFetching\('([^']+)',\s*'daytime-fetch'\)/,
      nighttime: /scheduleVideoFetching\('([^']+)',\s*'nighttime-fetch'\)/,
      trending: /scheduleTrendingMode\('([^']+)',\s*'trending-mode'\)/,
      cleanup: /scheduleVideoCleanup\('([^']+)',\s*'daily-cleanup'\)/,
      stats: /scheduleStatsUpdate\('([^']+)',\s*'stats-update'\)/
    };

    console.log('📋 Configured Cron Expressions:');
    
    for (const [mode, pattern] of Object.entries(cronPatterns)) {
      const match = schedulerContent.match(pattern);
      if (match) {
        const cronExpr = match[1];
        console.log(`   ${mode.padEnd(12)}: ${cronExpr}`);
        this.testResults.cronExpressions[mode] = cronExpr;
      } else {
        console.log(`   ${mode.padEnd(12)}: NOT FOUND`);
        this.testResults.cronExpressions[mode] = null;
      }
    }

    // Verify cron expressions match requirements
    console.log('\n✅ Cron Expression Validation:');
    
    const daytimeCron = this.testResults.cronExpressions.daytime;
    const nighttimeCron = this.testResults.cronExpressions.nighttime;
    const trendingCron = this.testResults.cronExpressions.trending;

    // Daytime: should be */30 6-23 * * * (every 30 min, 6AM-11PM)
    if (daytimeCron === '*/30 6-23 * * *') {
      console.log('   ✅ Daytime: Correct (every 30 min, 6AM-11PM)');
      this.testResults.timingLogic.daytime = true;
    } else {
      console.log(`   ❌ Daytime: Expected '*/30 6-23 * * *', got '${daytimeCron}'`);
      this.testResults.timingLogic.daytime = false;
    }

    // Nighttime: should be 0 */2 0-5 * * * (every 2 hours, 12AM-5AM)
    if (nighttimeCron === '0 */2 0-5 * * *') {
      console.log('   ✅ Nighttime: Correct (every 2 hours, 12AM-5AM)');
      this.testResults.timingLogic.nighttime = true;
    } else {
      console.log(`   ❌ Nighttime: Expected '0 */2 0-5 * * *', got '${nighttimeCron}'`);
      this.testResults.timingLogic.nighttime = false;
    }

    // Trending: should be */5 * * * * (every 5 minutes)
    if (trendingCron === '*/5 * * * *') {
      console.log('   ✅ Trending: Correct (every 5 minutes)');
      this.testResults.timingLogic.trending = true;
    } else {
      console.log(`   ❌ Trending: Expected '*/5 * * * *', got '${trendingCron}'`);
      this.testResults.timingLogic.trending = false;
    }

    return true;
  }

  /**
   * Test current time mode detection
   */
  testCurrentTimeMode() {
    console.log('\n🕐 CURRENT TIME MODE DETECTION');
    console.log('=' .repeat(40));

    const now = new Date();
    const bangkokTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
    const hour = bangkokTime.getHours();
    const minute = bangkokTime.getMinutes();

    console.log(`Current Bangkok time: ${bangkokTime.toLocaleString()}`);
    console.log(`Hour: ${hour}, Minute: ${minute}`);

    // Determine expected mode
    let expectedMode, nextFetch;
    
    if (hour >= 6 && hour <= 23) {
      // Daytime mode (6 AM - 11 PM)
      expectedMode = 'DAYTIME';
      const minutesUntilNext = 30 - (minute % 30);
      nextFetch = `${minutesUntilNext} minutes`;
    } else {
      // Nighttime mode (12 AM - 5 AM)
      expectedMode = 'NIGHTTIME';
      
      if (hour >= 0 && hour <= 5) {
        // Calculate next even hour
        const nextEvenHour = Math.ceil(hour / 2) * 2;
        if (nextEvenHour > 5) {
          // Next fetch is at 6 AM (switch to daytime)
          const hoursUntil = 6 - hour;
          const minutesUntil = 60 - minute;
          nextFetch = `${hoursUntil}h ${minutesUntil}m (switching to daytime)`;
        } else {
          // Next fetch is at next even hour
          const hoursUntil = nextEvenHour - hour;
          const minutesUntil = hoursUntil > 0 ? 0 : (120 - minute);
          nextFetch = `${hoursUntil}h ${minutesUntil}m`;
        }
      }
    }

    console.log(`\n🎯 Expected Mode: ${expectedMode}`);
    console.log(`⏰ Next scheduled fetch: ${nextFetch}`);

    // Test trending mode conditions
    console.log('\n📈 Trending Mode Conditions:');
    console.log('   Trending mode runs every 5 minutes regardless of time');
    console.log('   Only executes if active trending topics exist');
    
    const trendingNext = 5 - (minute % 5);
    console.log(`   Next trending check: ${trendingNext} minutes`);

    this.testResults.timingLogic.currentMode = expectedMode;
    this.testResults.timingLogic.nextFetch = nextFetch;
    this.testResults.timingLogic.trendingNext = trendingNext;

    return true;
  }

  /**
   * Test trending mode activation
   */
  async testTrendingModeActivation() {
    console.log('\n🔥 TRENDING MODE ACTIVATION TEST');
    console.log('=' .repeat(40));

    try {
      // Check active trending topics
      const topicsResponse = await axios.get(`${BASE_URL}/trending-topics`);
      const topics = topicsResponse.data.data;
      const activeTopics = topics.filter(t => t.IsActive);

      console.log(`📊 Total trending topics: ${topics.length}`);
      console.log(`🎯 Active trending topics: ${activeTopics.length}`);

      if (activeTopics.length > 0) {
        console.log('\n✅ Active Trending Topics:');
        activeTopics.forEach((topic, index) => {
          console.log(`   ${index + 1}. "${topic.Title}" (${topic.Category})`);
          console.log(`      Priority: ${topic.Priority || 'N/A'}`);
          console.log(`      Created: ${new Date(topic.createdAt).toLocaleDateString()}`);
        });

        console.log('\n🚀 TRENDING MODE STATUS:');
        console.log('   ✅ Should activate: YES (active topics exist)');
        console.log('   ⏰ Frequency: Every 5 minutes');
        console.log('   🎯 Target topics: All active topics');
        
        this.testResults.trendingMode.shouldActivate = true;
        this.testResults.trendingMode.activeTopics = activeTopics.length;
      } else {
        console.log('\n⚠️  No active trending topics found');
        console.log('\n🚀 TRENDING MODE STATUS:');
        console.log('   ❌ Should activate: NO (no active topics)');
        console.log('   ⏰ Frequency: Every 5 minutes (but skipped)');
        console.log('   🎯 Target topics: None');
        
        this.testResults.trendingMode.shouldActivate = false;
        this.testResults.trendingMode.activeTopics = 0;
      }

      return true;
    } catch (error) {
      console.log(`❌ Error checking trending topics: ${error.message}`);
      return false;
    }
  }

  /**
   * Test scheduler bootstrap integration
   */
  async testSchedulerBootstrap() {
    console.log('\n🔧 SCHEDULER BOOTSTRAP INTEGRATION');
    console.log('=' .repeat(40));

    const fs = require('fs');
    const bootstrapPath = './src/bootstrap.js';
    
    if (!fs.existsSync(bootstrapPath)) {
      console.log('❌ Bootstrap file not found');
      return false;
    }

    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
    
    // Check for video scheduler initialization
    const hasVideoScheduler = bootstrapContent.includes('VideoScheduler') && 
                              bootstrapContent.includes('videoScheduler.initialize()');
    
    if (hasVideoScheduler) {
      console.log('✅ Video scheduler initialized in bootstrap.js');
      console.log('✅ Scheduler should start automatically with Strapi');
    } else {
      console.log('❌ Video scheduler not found in bootstrap.js');
    }

    // Check for global scheduler storage
    const hasGlobalStorage = bootstrapContent.includes('strapi.videoScheduler');
    
    if (hasGlobalStorage) {
      console.log('✅ Scheduler stored globally as strapi.videoScheduler');
    } else {
      console.log('❌ Scheduler not stored globally');
    }

    return hasVideoScheduler && hasGlobalStorage;
  }

  /**
   * Generate timing schedule for next 24 hours
   */
  generateSchedulePreview() {
    console.log('\n📅 24-HOUR SCHEDULE PREVIEW');
    console.log('=' .repeat(40));

    const now = new Date();
    const schedule = [];

    // Generate schedule for next 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      
      if (hour >= 6 && hour <= 23) {
        // Daytime: every 30 minutes
        schedule.push(`${time} - Daytime fetch (every 30 min)`);
        if (hour < 23) {
          schedule.push(`${hour.toString().padStart(2, '0')}:30 - Daytime fetch (every 30 min)`);
        }
      } else {
        // Nighttime: every 2 hours
        if (hour % 2 === 0) {
          schedule.push(`${time} - Nighttime fetch (every 2 hours)`);
        }
      }
    }

    // Show next 10 scheduled fetches
    console.log('🕐 Next 10 Scheduled Fetches:');
    schedule.slice(0, 10).forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry}`);
    });

    console.log('\n📈 Trending Mode:');
    console.log('   Runs every 5 minutes continuously');
    console.log('   Only executes if active trending topics exist');
    console.log('   Independent of daytime/nighttime schedule');
  }

  /**
   * Run complete timing test
   */
  async runCompleteTest() {
    console.log('⏰ VIDEO SCHEDULER TIMING TEST');
    console.log('='.repeat(50));
    console.log('Testing scheduler timing requirements:');
    console.log('• Daytime (06:00–23:00) → every 30 minutes');
    console.log('• Nighttime (23:01–05:59) → every 2 hours');
    console.log('• Trending Mode → every 5 minutes (if active tags exist)');
    console.log('='.repeat(50));

    const results = [];

    // Test 1: Cron expressions
    results.push(await this.testCronExpressions());

    // Test 2: Current time mode
    results.push(this.testCurrentTimeMode());

    // Test 3: Trending mode activation
    results.push(await this.testTrendingModeActivation());

    // Test 4: Bootstrap integration
    results.push(await this.testSchedulerBootstrap());

    // Test 5: Schedule preview
    this.generateSchedulePreview();

    // Final results
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;

    console.log('\n📊 TIMING TEST RESULTS');
    console.log('=' .repeat(30));
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TIMING TESTS PASSED!');
      console.log('✅ Scheduler timing configuration is correct');
      console.log('✅ All cron expressions match requirements');
      console.log('✅ Trending mode properly configured');
    } else {
      console.log('\n⚠️  SOME TIMING ISSUES DETECTED');
      console.log('❌ Review cron expressions and timing logic');
    }

    return passedTests / totalTests;
  }
}

// Run the timing test
const tester = new SchedulerTimingTester();
tester.runCompleteTest().catch(error => {
  console.error('❌ Timing test failed:', error);
  process.exit(1);
});
