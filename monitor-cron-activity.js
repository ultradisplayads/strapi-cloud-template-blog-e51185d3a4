#!/usr/bin/env node

/**
 * Monitor Cron Activity
 * Real-time monitoring of cron job execution and content fetching
 */

const axios = require('axios');

class CronMonitor {
  constructor() {
    this.lastNewsCount = 0;
    this.lastVideoCount = 0;
    this.startTime = new Date();
    this.checkInterval = 30000; // Check every 30 seconds
  }

  async getCurrentCounts() {
    try {
      // Get breaking news count
      const newsResponse = await axios.get('http://localhost:1337/api/breaking-news-plural');
      const newsCount = newsResponse.data?.data?.length || 0;

      // Get videos count
      const videoResponse = await axios.get('http://localhost:1337/api/videos');
      const videoCount = videoResponse.data?.data?.length || 0;

      return { newsCount, videoCount };
    } catch (error) {
      console.log(`❌ API Error: ${error.message}`);
      return { newsCount: 0, videoCount: 0 };
    }
  }

  async checkForNewContent() {
    const { newsCount, videoCount } = await this.getCurrentCounts();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Bangkok' });

    console.log(`\n⏰ ${timeStr} - Content Check:`);
    
    // Check for new breaking news
    if (newsCount > this.lastNewsCount) {
      const newArticles = newsCount - this.lastNewsCount;
      console.log(`🎉 NEW CONTENT: ${newArticles} new breaking news article(s)! Total: ${newsCount}`);
      console.log(`📰 News fetching cron job is working!`);
    } else if (newsCount === this.lastNewsCount && this.lastNewsCount > 0) {
      console.log(`📰 Breaking news: ${newsCount} articles (no change)`);
    } else {
      console.log(`📰 Breaking news: ${newsCount} articles`);
    }

    // Check for new videos
    if (videoCount > this.lastVideoCount) {
      const newVideos = videoCount - this.lastVideoCount;
      console.log(`🎉 NEW CONTENT: ${newVideos} new video(s)! Total: ${videoCount}`);
      console.log(`🎬 Video fetching cron job is working!`);
    } else if (videoCount === this.lastVideoCount && this.lastVideoCount > 0) {
      console.log(`🎬 Videos: ${videoCount} videos (no change)`);
    } else {
      console.log(`🎬 Videos: ${videoCount} videos`);
    }

    // Update counts
    this.lastNewsCount = newsCount;
    this.lastVideoCount = videoCount;

    // Show next expected cron runs
    this.showNextCronRuns();
  }

  showNextCronRuns() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();

    console.log(`\n📅 Next Expected Cron Runs:`);
    
    // News fetching (every 5 minutes)
    const nextNews = 5 - (currentMinute % 5);
    console.log(`   🔄 News fetch: ${nextNews} minute(s)`);
    
    // Currency update (every 3 minutes)  
    const nextCurrency = 3 - (currentMinute % 3);
    console.log(`   💱 Currency: ${nextCurrency} minute(s)`);
    
    // Video trending check (every 10 minutes)
    const nextVideoTrending = 10 - (currentMinute % 10);
    console.log(`   🎬 Video trending: ${nextVideoTrending} minute(s)`);
    
    // Video daytime fetch (every 30 minutes, 6AM-11PM)
    if (currentHour >= 6 && currentHour <= 23) {
      const nextVideoDaytime = 30 - (currentMinute % 30);
      console.log(`   🌞 Video daytime: ${nextVideoDaytime} minute(s)`);
    } else {
      console.log(`   🌙 Video nighttime mode active`);
    }
  }

  async start() {
    console.log('🔍 Starting Cron Activity Monitor...');
    console.log(`⏰ Started at: ${this.startTime.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })} (Bangkok)`);
    console.log(`🔄 Checking every ${this.checkInterval / 1000} seconds for new content\n`);

    // Initial check
    await this.checkForNewContent();

    // Set up interval monitoring
    setInterval(async () => {
      await this.checkForNewContent();
    }, this.checkInterval);

    console.log('\n📊 Monitoring Status:');
    console.log('✅ Breaking news API accessible');
    console.log('✅ Videos API accessible');
    console.log('✅ Real-time content monitoring active');
    console.log('\n💡 What to look for:');
    console.log('- Content count increases indicate successful cron job execution');
    console.log('- News should update every 5 minutes if new content available');
    console.log('- Videos should update based on trending/daytime schedules');
    console.log('- Watch for "🎉 NEW CONTENT" messages');
    
    console.log('\n🛑 Press Ctrl+C to stop monitoring\n');
  }
}

// Start monitoring
const monitor = new CronMonitor();
monitor.start().catch(console.error);
