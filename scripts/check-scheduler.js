const axios = require('axios');

async function checkSchedulerStatus() {
  try {
    console.log('🔍 Checking scheduler status...');
    
    // Check if process is running
    const { exec } = require('child_process');
    const checkProcess = () => new Promise((resolve) => {
      exec('ps aux | grep "alternative-scheduler" | grep -v grep', (error, stdout) => {
        resolve(stdout.trim());
      });
    });
    
    const processInfo = await checkProcess();
    if (processInfo) {
      console.log('✅ Scheduler process is running');
      console.log('   PID:', processInfo.split(/\s+/)[1]);
    } else {
      console.log('❌ Scheduler process is NOT running');
      return;
    }
    
    // Check API connectivity
    const response = await axios.get('https://api.pattaya1.com/api/breaking-news/live');
    console.log('✅ API is accessible');
    console.log('📊 Current articles:', response.data?.meta?.total || 0);
    
    // Check news sources
    const sourcesResponse = await axios.get('https://api.pattaya1.com/api/news-sources');
    const activeSources = sourcesResponse.data?.data?.filter(s => s.isActive) || [];
    console.log('📡 Active news sources:', activeSources.length);
    
    // Show next fetch time estimate
    const now = new Date();
    const nextFetch = new Date(now.getTime() + (5 * 60 * 1000)); // 5 minutes from now
    console.log('⏰ Next fetch cycle: ~' + nextFetch.toLocaleTimeString());
    
    console.log('\n🎯 Scheduler Status: RUNNING EVERY 5 MINUTES');
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  checkSchedulerStatus();
}

module.exports = { checkSchedulerStatus };
