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

const comprehensiveNewsSources = [
  // Primary English News Sources
  {
    name: "Pattaya Mail",
    sourceType: "rss_feed",
    url: "https://www.pattayamail.com/feed",
    description: "Longest-running and established source for detailed local news, columns, and community events",
    isActive: true,
    priority: 1,
    fetchInterval: 30
  },
  {
    name: "The Pattaya News", 
    sourceType: "rss_feed",
    url: "https://thepattayanews.com/feed/",
    description: "Very strong focus on up-to-the-minute breaking news, crime, and tourism-related stories",
    isActive: true,
    priority: 1,
    fetchInterval: 15
  },
  {
    name: "The Thaiger",
    sourceType: "rss_feed", 
    url: "https://thethaiger.com/news/feed",
    description: "Popular with expats, provides national context for stories",
    isActive: true,
    priority: 2,
    fetchInterval: 30
  },
  {
    name: "The Thaiger Pattaya",
    sourceType: "rss_feed",
    url: "https://thethaiger.com/news/pattaya/feed", 
    description: "Pattaya-specific section of The Thaiger with local context",
    isActive: true,
    priority: 1,
    fetchInterval: 30
  },
  {
    name: "Bangkok Post",
    sourceType: "rss_feed",
    url: "https://www.bangkokpost.com/rss/data/most-recent.xml",
    description: "Leading English-language newspaper in Thailand",
    isActive: true,
    priority: 2,
    fetchInterval: 60
  },
  {
    name: "The Nation Thailand",
    sourceType: "rss_feed",
    url: "https://www.nationthailand.com/rss",
    description: "Major English-language daily newspaper",
    isActive: true,
    priority: 2, 
    fetchInterval: 60
  },
  {
    name: "Thai PBS World",
    sourceType: "rss_feed",
    url: "https://www.thaipbsworld.com/feed/",
    description: "Public broadcasting service with comprehensive coverage",
    isActive: true,
    priority: 2,
    fetchInterval: 60
  },
  {
    name: "Khaosod English",
    sourceType: "rss_feed", 
    url: "https://www.khaosodenglish.com/feed/",
    description: "Independent news source with investigative reporting",
    isActive: true,
    priority: 2,
    fetchInterval: 60
  },
  
  // Community & Expat Sources
  {
    name: "ASEAN NOW Pattaya Forum",
    sourceType: "rss_feed",
    url: "https://www.aseannow.com/forum/discover/8.xml/",
    description: "Major hub for expats to discuss and share news articles",
    isActive: true,
    priority: 3,
    fetchInterval: 120
  },
  
  // API Sources
  {
    name: "NewsAPI Thailand",
    sourceType: "api",
    url: "https://newsapi.org/v2/top-headlines?country=th",
    description: "Aggregated news from multiple Thai sources via NewsAPI",
    isActive: false,
    priority: 3,
    fetchInterval: 60,
    keyValue: "NEWS_API_KEY"
  },
  {
    name: "GNews Thailand",
    sourceType: "api", 
    url: "https://gnews.io/api/v4/top-headlines?country=th",
    description: "Real-time news aggregation from GNews.io",
    isActive: false,
    priority: 3,
    fetchInterval: 60,
    keyValue: "GNEWS_API_KEY"
  }
];

async function populateProductionSources() {
  console.log('🚀 Populating production news sources...');
  console.log(`📡 Target API: ${PRODUCTION_API_URL}`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const source of comprehensiveNewsSources) {
    try {
      // Check if source already exists
      const existing = await axios.get(
        `${PRODUCTION_API_URL}/api/news-sources?filters[name][$eq]=${encodeURIComponent(source.name)}`,
        axiosConfig
      );
      
      if (existing.data.data && existing.data.data.length > 0) {
        console.log(`   ⏭️  Skipped: ${source.name} (already exists)`);
        skipped++;
        continue;
      }
      
      // Create new source
      await axios.post(`${PRODUCTION_API_URL}/api/news-sources`, {
        data: source
      }, axiosConfig);
      
      console.log(`   ✅ Created: ${source.name}`);
      created++;
      
    } catch (error) {
      console.log(`   ❌ Failed to create ${source.name}: ${error.message}`);
      if (error.response) {
        console.log(`      Status: ${error.response.status}`);
        console.log(`      Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      errors++;
    }
  }
  
  console.log(`\n✅ Production news sources population completed:`);
  console.log(`   📊 Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📡 Total sources: ${created + skipped}`);
  
  // Verify the population
  try {
    const allSources = await axios.get(`${PRODUCTION_API_URL}/api/news-sources`, axiosConfig);
    const activeSources = allSources.data.data.filter(s => s.isActive);
    console.log(`\n🔍 Verification:`);
    console.log(`   📊 Total sources in production: ${allSources.data.data.length}`);
    console.log(`   ✅ Active sources: ${activeSources.length}`);
    
    console.log(`\n📋 Active RSS sources:`);
    activeSources
      .filter(s => s.sourceType === 'rss_feed')
      .forEach(s => console.log(`   • ${s.name}: ${s.url}`));
      
  } catch (verifyError) {
    console.log(`\n❌ Verification failed: ${verifyError.message}`);
  }
}

// Run the population
populateProductionSources();
