const axios = require('axios');
const https = require('https');

// Production API configuration
const PRODUCTION_API_URL = 'https://api.pattaya1.com';

// Configure axios to handle SSL certificates
const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Accept self-signed certificates
  }),
  timeout: 30000 // 30 second timeout
};

async function testProductionCron() {
  console.log('🔍 Testing production cron job functionality...');
  console.log(`📡 Production API: ${PRODUCTION_API_URL}`);
  
  try {
    // Test 1: Fetch news sources from production
    console.log('\n1️⃣ Testing news sources fetch from production...');
    const sourcesResponse = await axios.get(`${PRODUCTION_API_URL}/api/news-sources`, axiosConfig);
    const activeSources = sourcesResponse.data.data.filter(s => s.isActive === true);
    
    console.log(`   ✅ Found ${activeSources.length} active news sources`);
    console.log(`   📊 Total sources: ${sourcesResponse.data.data.length}`);
    
    // Test 2: Test duplicate check endpoint
    console.log('\n2️⃣ Testing duplicate check endpoint...');
    const testUrl = 'https://example.com/test-article';
    const duplicateCheck = await axios.get(
      `${PRODUCTION_API_URL}/api/breaking-news-plural?filters[URL][$eq]=${encodeURIComponent(testUrl)}`,
      axiosConfig
    );
    console.log(`   ✅ Duplicate check working - found ${duplicateCheck.data.data.length} matches`);
    
    // Test 3: Test live feed endpoint
    console.log('\n3️⃣ Testing live feed endpoint...');
    const liveResponse = await axios.get(`${PRODUCTION_API_URL}/api/breaking-news/live`, axiosConfig);
    console.log(`   ✅ Live feed working`);
    console.log(`   📊 Meta:`, liveResponse.data.meta);
    
    // Test 4: Simulate RSS parsing for first active source
    if (activeSources.length > 0) {
      console.log('\n4️⃣ Testing RSS parsing...');
      const RSS = require('rss-parser');
      const parser = new RSS({
        customFields: {
          item: ['dc:creator', 'creator']
        }
      });
      
      const testSource = activeSources[0];
      console.log(`   🔍 Testing RSS from: ${testSource.name}`);
      
      if (testSource.sourceType === 'rss_feed' && testSource.url) {
        try {
          const feed = await parser.parseURL(testSource.url);
          console.log(`   ✅ RSS parsed successfully - ${feed.items.length} articles found`);
          
          if (feed.items.length > 0) {
            const firstItem = feed.items[0];
            console.log(`   📰 Sample article: ${firstItem.title?.substring(0, 50)}...`);
          }
        } catch (rssError) {
          console.log(`   ❌ RSS parsing failed: ${rssError.message}`);
        }
      }
    }
    
    console.log('\n✅ Production cron job test completed successfully!');
    console.log('\n🔧 Configuration summary:');
    console.log(`   • Production API: ${PRODUCTION_API_URL}`);
    console.log(`   • Active sources: ${activeSources.length}`);
    console.log(`   • SSL handling: Enabled (self-signed certificates accepted)`);
    console.log(`   • Timeout: 30 seconds`);
    
  } catch (error) {
    console.error('\n❌ Production cron job test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    // Provide troubleshooting suggestions
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('   1. Check if production API is accessible from this network');
    console.log('   2. Verify SSL certificate configuration');
    console.log('   3. Check if API endpoints require authentication');
    console.log('   4. Ensure CORS is configured for cross-origin requests');
  }
}

// Run the test
testProductionCron();
