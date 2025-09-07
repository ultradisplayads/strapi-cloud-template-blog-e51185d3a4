const axios = require('axios');

const newsSources = [
  {
    name: "Pattaya Mail",
    url: "https://www.pattayamail.com/feed",
    sourceType: "rss_feed",
    isActive: true,
    priority: 1
  },
  {
    name: "The Pattaya News",
    url: "https://thepattayanews.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 2
  },
  {
    name: "The Thaiger",
    url: "https://thethaiger.com/news/feed",
    sourceType: "rss_feed",
    isActive: true,
    priority: 3
  },
  {
    name: "Bangkok Post",
    url: "https://www.bangkokpost.com/rss/data/news.xml",
    sourceType: "rss_feed",
    isActive: true,
    priority: 4
  },
  {
    name: "The Nation Thailand",
    url: "https://www.nationthailand.com/rss/news.xml",
    sourceType: "rss_feed",
    isActive: true,
    priority: 5
  },
  {
    name: "Thai PBS World",
    url: "https://www.thaipbsworld.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 6
  },
  {
    name: "Khaosod English",
    url: "https://www.khaosodenglish.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 7
  },
  {
    name: "Thai Enquirer",
    url: "https://www.thaienquirer.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 8
  },
  {
    name: "Phuket News",
    url: "https://www.thephuketnews.com/rss.php",
    sourceType: "rss_feed",
    isActive: true,
    priority: 9
  },
  {
    name: "Chiang Mai News",
    url: "https://www.chiangmaicitylife.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 10
  },
  {
    name: "Coconuts Bangkok",
    url: "https://coconuts.co/bangkok/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 11
  }
];

async function populateNewsSources() {
  console.log('🚀 Populating news sources...');
  
  try {
    let created = 0;
    let skipped = 0;
    
    for (const source of newsSources) {
      try {
        // Check if source already exists
        const existing = await axios.get(`https://api.pattaya1.com/api/news-sources?filters[name][$eq]=${encodeURIComponent(source.name)}`);
        
        if (existing.data.data && existing.data.data.length > 0) {
          console.log(`   ⏭️  Skipped: ${source.name} (already exists)`);
          skipped++;
          continue;
        }
        
        // Create new source
        await axios.post('https://api.pattaya1.com/api/news-sources', {
          data: source
        });
        
        console.log(`   ✅ Created: ${source.name}`);
        created++;
        
      } catch (error) {
        console.log(`   ❌ Failed to create ${source.name}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ News sources population completed:`);
    console.log(`   📊 Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📡 Total sources: ${created + skipped}`);
    
    // Verify the population
    const allSources = await axios.get('https://api.pattaya1.com/api/news-sources');
    console.log(`\n🔍 Verification: ${allSources.data.data.length} sources in database`);
    
  } catch (error) {
    console.error('❌ Population failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  populateNewsSources();
}

module.exports = { populateNewsSources, newsSources };
