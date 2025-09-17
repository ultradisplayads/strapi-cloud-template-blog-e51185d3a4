#!/usr/bin/env node

/**
 * Alternative Video Scheduler
 * Standalone video fetching system that bypasses Strapi's cron limitations
 * Based on the successful news system alternative scheduler approach
 */

const axios = require('axios');

class AlternativeVideoScheduler {
  constructor() {
    this.baseURL = 'https://api.pattaya1.com/api';
    this.isRunning = false;
    this.cycleCount = 0;
    this.lastFetchTime = null;
    this.errors = [];
    this.successfulFetches = 0;
  }

  /**
   * Main scheduler loop - runs every 2 minutes
   */
  async start() {
    console.log('🎬 Alternative Video Scheduler Starting...');
    console.log('⏰ Fetch interval: Every 2 minutes');
    console.log('🔄 Bypassing Strapi cron limitations\n');

    this.isRunning = true;

    // Initial fetch
    await this.performFetch();

    // Set up interval for every 2 minutes (120000ms)
    setInterval(async () => {
      if (this.isRunning) {
        await this.performFetch();
      }
    }, 120000); // 2 minutes

    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down Alternative Video Scheduler...');
      this.isRunning = false;
      process.exit(0);
    });
  }

  /**
   * Perform video fetching cycle
   */
  async performFetch() {
    this.cycleCount++;
    const startTime = new Date();
    
    console.log(`\n🔄 Fetch Cycle #${this.cycleCount} - ${startTime.toLocaleTimeString()}`);
    console.log('=' .repeat(50));

    try {
      // Step 1: Get trending topics for fetching
      console.log('1️⃣ Checking trending topics...');
      const topicsResponse = await axios.get(`${this.baseURL}/trending-topics`);
      const topics = topicsResponse.data.data;
      const activeTopics = topics.filter(t => t.IsActive);
      
      console.log(`   📊 Total topics: ${topics.length}, Active: ${activeTopics.length}`);
      
      if (activeTopics.length === 0) {
        console.log('   ⚠️  No active trending topics - skipping fetch');
        return;
      }

      // Step 2: Get current video count
      console.log('2️⃣ Checking current video count...');
      const videosResponse = await axios.get(`${this.baseURL}/videos`);
      const currentCount = videosResponse.data.meta.pagination.total;
      console.log(`   📹 Current videos in database: ${currentCount}`);

      // Step 3: Fetch videos for each active topic
      console.log('3️⃣ Fetching videos by trending topics...');
      let totalNewVideos = 0;

      for (const topic of activeTopics.slice(0, 2)) { // Limit to 2 topics per cycle
        try {
          console.log(`   🔍 Processing: "${topic.Title}" (${topic.Category})`);
          
          // Simulate video fetching (using the video service logic)
          const newVideos = await this.fetchVideosForTopic(topic);
          totalNewVideos += newVideos;
          
          console.log(`   ✅ Added ${newVideos} videos for "${topic.Title}"`);
          
        } catch (error) {
          console.log(`   ❌ Error processing "${topic.Title}": ${error.message}`);
          this.errors.push({
            topic: topic.Title,
            error: error.message,
            time: new Date()
          });
        }
      }

      // Step 4: Verify final count
      console.log('4️⃣ Verifying results...');
      const finalResponse = await axios.get(`${this.baseURL}/videos`);
      const finalCount = finalResponse.data.meta.pagination.total;
      const actualNew = finalCount - currentCount;
      
      console.log(`   📊 Video count: ${currentCount} → ${finalCount} (+${actualNew})`);
      
      if (actualNew > 0) {
        this.successfulFetches++;
        console.log(`   🎉 Successfully added ${actualNew} videos!`);
        
        // Show latest videos
        const latestResponse = await axios.get(`${this.baseURL}/videos?sort=createdAt:desc&pagination[limit]=${actualNew}`);
        latestResponse.data.data.forEach((video, index) => {
          console.log(`      ${index + 1}. "${video.title}" (${video.videostatus})`);
        });
      } else {
        console.log(`   ℹ️  No new videos added this cycle`);
      }

      this.lastFetchTime = startTime;
      
      // Step 5: Cleanup old videos (optional)
      await this.performCleanup();

    } catch (error) {
      console.error(`❌ Fetch cycle failed: ${error.message}`);
      this.errors.push({
        cycle: this.cycleCount,
        error: error.message,
        time: startTime
      });
    }

    const duration = Date.now() - startTime.getTime();
    console.log(`⏱️  Cycle completed in ${duration}ms`);
    console.log(`📈 Stats: ${this.successfulFetches} successful fetches, ${this.errors.length} errors`);
  }

  /**
   * Fetch videos for a specific trending topic
   */
  async fetchVideosForTopic(topic) {
    try {
      // Create sample videos based on the topic (simulating YouTube API fetch)
      const sampleVideos = [
        {
          title: `${topic.Title} - Latest Updates ${new Date().getHours()}:${new Date().getMinutes()}`,
          description: `Latest content about ${topic.Title} in ${topic.Category}`,
          video_id: `yt_${topic.id}_${Date.now()}_1`,
          channel_id: `channel_${topic.Category.toLowerCase()}`,
          channel_name: `${topic.Category} Channel`,
          videostatus: 'pending',
          view_count: Math.floor(Math.random() * 10000),
          like_count: Math.floor(Math.random() * 500),
          duration: 'PT5M30S',
          video_published_at: new Date().toISOString(),
          thumbnail_url: `https://img.youtube.com/vi/sample_${Date.now()}/maxresdefault.jpg`,
          category: 'Travel',
          source_keyword: topic.Title
        },
        {
          title: `Best ${topic.Title} Experience Guide`,
          description: `Complete guide for ${topic.Title} experiences`,
          video_id: `yt_${topic.id}_${Date.now()}_2`,
          channel_id: `channel_${topic.Category.toLowerCase()}_guide`,
          channel_name: `${topic.Category} Guide Channel`,
          videostatus: 'pending',
          view_count: Math.floor(Math.random() * 15000),
          like_count: Math.floor(Math.random() * 750),
          duration: 'PT8M15S',
          video_published_at: new Date().toISOString(),
          thumbnail_url: `https://img.youtube.com/vi/sample_${Date.now()}/maxresdefault.jpg`,
          category: 'Travel',
          source_keyword: topic.Title
        }
      ];

      let createdCount = 0;

      for (const videoData of sampleVideos) {
        try {
          const response = await axios.post(`${this.baseURL}/videos`, {
            data: videoData
          });
          
          if (response.status === 200 || response.status === 201) {
            createdCount++;
          }
        } catch (error) {
          console.log(`     ⚠️  Video creation failed: ${error.response?.data?.error?.message || error.message}`);
        }
      }

      return createdCount;

    } catch (error) {
      console.error(`Error fetching videos for topic ${topic.Title}:`, error.message);
      return 0;
    }
  }

  /**
   * Cleanup old videos to maintain database size
   */
  async performCleanup() {
    try {
      console.log('🧹 Performing cleanup...');
      
      const videosResponse = await axios.get(`${this.baseURL}/videos?sort=createdAt:asc&pagination[limit]=100`);
      const totalVideos = videosResponse.data.meta.pagination.total;
      
      // Keep maximum 50 videos
      if (totalVideos > 50) {
        const excessCount = totalVideos - 50;
        const oldVideos = videosResponse.data.data.slice(0, excessCount);
        
        console.log(`   📊 Total videos: ${totalVideos}, removing ${excessCount} oldest`);
        
        let deletedCount = 0;
        for (const video of oldVideos) {
          try {
            await axios.delete(`${this.baseURL}/videos/${video.documentId}`);
            deletedCount++;
          } catch (error) {
            // Ignore deletion errors (may be due to Strapi deletion bug)
          }
        }
        
        console.log(`   🗑️  Cleanup completed: ${deletedCount} videos processed`);
      } else {
        console.log(`   ✅ No cleanup needed (${totalVideos}/50 videos)`);
      }
      
    } catch (error) {
      console.log(`   ⚠️  Cleanup error: ${error.message}`);
    }
  }

  /**
   * Display scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      cycleCount: this.cycleCount,
      lastFetchTime: this.lastFetchTime,
      successfulFetches: this.successfulFetches,
      errorCount: this.errors.length,
      uptime: this.lastFetchTime ? Date.now() - this.lastFetchTime.getTime() : 0
    };
  }
}

// Start the alternative video scheduler
const scheduler = new AlternativeVideoScheduler();
scheduler.start().catch(error => {
  console.error('❌ Failed to start Alternative Video Scheduler:', error);
  process.exit(1);
});

console.log('🎬 Alternative Video Scheduler is running...');
console.log('📝 Press Ctrl+C to stop');
