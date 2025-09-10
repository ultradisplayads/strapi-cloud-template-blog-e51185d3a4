const axios = require('axios');

const BASE_URL = process.env.STRAPI_BASE_URL || 'https://api.pattaya1.com';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

const newsSources = [
  {
    name: "Pattaya Mail",
    description: "Pattaya's premier English-language newspaper - longest-running and established source for detailed local news, columns, and community events",
    url: "https://www.pattayamail.com/feed",
    rssUrl: "https://www.pattayamail.com/feed",
    sourceType: "rss_feed",
    isActive: true,
    priority: 1,
    fetchInterval: 30,
    keyValue: "Longest-running and established source for detailed local news, columns, and community events"
  },
  {
    name: "PR Pattaya (ประชาสัมพันธ์เมืองพัทยา)",
    description: "Official City Hall public relations page for Pattaya (announcements, events, road closures)",
    url: "https://www.facebook.com/PRPattayacity",
    sourceType: "facebook_page",
    isActive: true,
    priority: 4,
    fetchInterval: 60,
    keyValue: "The official public relations channel for Pattaya City Hall. The most reliable source for official city news."
  },
  {
    name: "Chonburi Provincial PR Office",
    description: "Official announcements for Chonburi province impacting Pattaya",
    url: "https://www.facebook.com/PR.Chonburi",
    sourceType: "facebook_page",
    isActive: true,
    priority: 5,
    fetchInterval: 60,
    keyValue: "Official news and announcements for Chonburi province"
  },
  {
    name: "The Pattaya News",
    description: "Very strong focus on up-to-the-minute breaking news, crime, and tourism-related stories. Often one of the fastest English sources",
    url: "https://thepattayanews.com/feed/",
    rssUrl: "https://thepattayanews.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 2,
    fetchInterval: 15,
    keyValue: "Very strong focus on up-to-the-minute breaking news, crime, and tourism-related stories. Often one of the fastest English sources"
  },
  {
    name: "The Thaiger",
    description: "Popular with expats, provides national context for Pattaya-related stories",
    url: "https://thethaiger.com/news/feed",
    rssUrl: "https://thethaiger.com/news/feed",
    sourceType: "rss_feed",
    isActive: true,
    priority: 3,
    fetchInterval: 30,
    keyValue: "Popular with expats, provides national context for Pattaya-related stories"
  },
  {
    name: "The Thaiger Pattaya",
    description: "The Thaiger's dedicated Pattaya section for local news",
    url: "https://thethaiger.com/news/pattaya/feed",
    rssUrl: "https://thethaiger.com/news/pattaya/feed",
    sourceType: "rss_feed",
    isActive: true,
    priority: 4,
    fetchInterval: 30,
    keyValue: "The Thaiger's dedicated Pattaya section for local news"
  },
  {
    name: "Bangkok Post",
    description: "Thailand's leading English-language newspaper",
    url: "https://www.bangkokpost.com/rss/data/most-recent.xml",
    rssUrl: "https://www.bangkokpost.com/rss/data/most-recent.xml",
    sourceType: "rss_feed",
    isActive: true,
    priority: 5,
    fetchInterval: 60,
    keyValue: "Thailand's leading English-language newspaper"
  },
  {
    name: "The Nation Thailand",
    description: "Breaking news from Thailand",
    url: "https://www.nationthailand.com/rss",
    rssUrl: "https://www.nationthailand.com/rss",
    sourceType: "rss_feed",
    isActive: true,
    priority: 6,
    fetchInterval: 45,
    keyValue: "Breaking news from Thailand"
  },
  {
    name: "Thai PBS World",
    description: "Thailand's public broadcasting news",
    url: "https://www.thaipbsworld.com/feed/",
    rssUrl: "https://www.thaipbsworld.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 7,
    fetchInterval: 60,
    keyValue: "Thailand's public broadcasting news"
  },
  {
    name: "Khaosod English",
    description: "Independent Thai news in English",
    url: "https://www.khaosodenglish.com/feed/",
    rssUrl: "https://www.khaosodenglish.com/feed/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 8,
    fetchInterval: 45,
    keyValue: "Independent Thai news in English"
  },
  {
    name: "ASEAN NOW Forum",
    description: "A major hub for expats to discuss and share news articles from various sources. A great gauge of what the expat community is talking about",
    url: "https://www.aseannow.com/forum/discover/8.xml/",
    rssUrl: "https://www.aseannow.com/forum/discover/8.xml/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 9,
    fetchInterval: 60,
    keyValue: "A major hub for expats to discuss and share news articles from various sources. A great gauge of what the expat community is talking about"
  },
  {
    name: "Pattaya People",
    description: "A local newspaper and TV channel focused more on lifestyle, events, and positive community news",
    url: "http://pattayapeople.com/",
    rssUrl: "http://pattayapeople.com/",
    sourceType: "rss_feed",
    isActive: true,
    priority: 10,
    fetchInterval: 60,
    keyValue: "A local newspaper and TV channel focused more on lifestyle, events, and positive community news"
  },
  {
    name: "NewsAPI.org Thailand",
    description: "Breaking news from NewsAPI.org for Thailand",
    url: "https://newsapi.org/v2/top-headlines",
    sourceType: "news_api",
    apiKey: "YOUR_NEWSAPI_KEY_HERE",
    isActive: true,
    priority: 11,
    fetchInterval: 120,
    keyValue: "Breaking news from NewsAPI.org for Thailand"
  },
  {
    name: "GNews.io Thailand",
    description: "Breaking news from GNews.io for Thailand",
    url: "https://gnews.io/api/v4/top-headlines",
    sourceType: "news_api",
    apiKey: "YOUR_GNEWS_KEY_HERE",
    isActive: true,
    priority: 12,
    fetchInterval: 120,
    keyValue: "Breaking news from GNews.io for Thailand"
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
        const existing = await axios.get(`${BASE_URL}/api/news-sources?filters[name][$eq]=${encodeURIComponent(source.name)}`);
        
        if (existing.data.data && existing.data.data.length > 0) {
          console.log(`   ⏭️  Skipped: ${source.name} (already exists)`);
          skipped++;
          continue;
        }
        
        // Create new source
        const headers = API_TOKEN
          ? { Authorization: `Bearer ${API_TOKEN}` }
          : {};

        if (!API_TOKEN) {
          console.warn('   ⚠️  No STRAPI_API_TOKEN set. Attempting unauthenticated create (likely to fail on production).');
        }

        await axios.post(`${BASE_URL}/api/news-sources`, {
          data: source
        }, { headers });
        
        console.log(`   ✅ Created: ${source.name}`);
        created++;
        
      } catch (error) {
        const msg = error?.response?.data || error?.message;
        console.log(`   ❌ Failed to create ${source.name}: ${JSON.stringify(msg)}`);
      }
    }
    
    console.log(`\n✅ News sources population completed:`);
    console.log(`   📊 Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📡 Total sources: ${created + skipped}`);
    
    // Verify the population
    const allSources = await axios.get(`${BASE_URL}/api/news-sources`);
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
