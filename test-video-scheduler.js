async function testVideoScheduler() {
  console.log('🚀 Testing Video Scheduler...');
  
  try {
    // Initialize Strapi
    const strapi = require('@strapi/strapi')();
    await strapi.load();
    
    // Check if video scheduler exists
    if (!strapi.videoScheduler) {
      console.log('❌ Video scheduler not found in global strapi object');
      return;
    }
    
    console.log('✅ Video scheduler found');
    
    // Test scheduler methods
    const scheduler = strapi.videoScheduler;
    
    // Check if scheduler has expected methods
    const methods = ['fetchDaytimeVideos', 'fetchNighttimeVideos', 'fetchTrendingVideos', 'cleanupOldVideos', 'updateStats'];
    
    for (const method of methods) {
      if (typeof scheduler[method] === 'function') {
        console.log(`✅ Method ${method} exists`);
      } else {
        console.log(`❌ Method ${method} missing`);
      }
    }
    
    // Test a simple scheduler function
    console.log('\n🔄 Testing daytime video fetch...');
    try {
      await scheduler.fetchDaytimeVideos();
      console.log('✅ Daytime video fetch completed');
    } catch (error) {
      console.log('❌ Daytime video fetch failed:', error.message);
    }
    
    // Test stats update
    console.log('\n🔄 Testing stats update...');
    try {
      await scheduler.updateStats();
      console.log('✅ Stats update completed');
    } catch (error) {
      console.log('❌ Stats update failed:', error.message);
    }
    
    console.log('\n✅ Video scheduler test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testVideoScheduler();
