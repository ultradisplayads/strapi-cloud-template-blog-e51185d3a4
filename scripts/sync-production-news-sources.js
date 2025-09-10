const axios = require('axios');

const PRODUCTION_URL = 'https://accessible-prize-23fea45f9e.strapiapp.com';
const LOCAL_URL = 'https://api.pattaya1.com';

async function syncProductionNewsSources() {
  try {
    console.log('🔄 Syncing news sources from production...');
    
    // Fetch production news sources
    const productionResponse = await axios.get(`${PRODUCTION_URL}/api/news-sources`);
    const productionSources = productionResponse.data.data;
    
    console.log(`📡 Found ${productionSources.length} sources in production`);
    
    // Get existing local sources
    console.log('📋 Checking existing local sources...');
    const localSources = await axios.get(`${LOCAL_URL}/api/news-sources`);
    console.log(`   Found ${localSources.data.data.length} existing sources`)
    
    // Create new sources from production
    let created = 0;
    let failed = 0;
    
    for (const source of productionSources) {
      try {
        // Clean the source data (remove production-specific fields)
        const cleanSource = {
          name: source.name,
          sourceType: source.sourceType,
          url: source.url,
          description: source.description,
          isActive: source.isActive,
          priority: source.priority,
          fetchInterval: source.fetchInterval
        };
        
        await axios.post(`${LOCAL_URL}/api/news-sources`, {
          data: cleanSource
        });
        
        console.log(`   ✅ Created: ${source.name} (${source.url})`);
        created++;
        
      } catch (error) {
        console.log(`   ❌ Failed to create ${source.name}: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n📊 Sync completed:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📡 Total synced: ${created}`);
    
    // Verify sync
    const newLocalSources = await axios.get(`${LOCAL_URL}/api/news-sources`);
    console.log(`\n🔍 Verification: ${newLocalSources.data.data.length} sources now in local database`);
    
    // Show active sources
    const activeSources = newLocalSources.data.data.filter(s => s.isActive);
    console.log(`📈 Active sources: ${activeSources.length}`);
    
    console.log('\n🎯 Ready to fetch news from production-grade sources!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  syncProductionNewsSources();
}

module.exports = { syncProductionNewsSources };
