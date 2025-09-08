const axios = require('axios');
const RSS = require('rss-parser');

const newsSources = [
  {
    name: "Pattaya Mail",
    url: "https://www.pattayamail.com/feed",
    type: "rss_feed"
  },
  {
    name: "The Pattaya News",
    url: "https://thepattayanews.com/feed/",
    type: "rss_feed"
  },
  {
    name: "The Thaiger",
    url: "https://thethaiger.com/news/feed",
    type: "rss_feed"
  },
  {
    name: "The Thaiger Pattaya",
    url: "https://thethaiger.com/news/pattaya/feed",
    type: "rss_feed"
  },
  {
    name: "Bangkok Post",
    url: "https://www.bangkokpost.com/rss/data/most-recent.xml",
    type: "rss_feed"
  },
  {
    name: "The Nation Thailand",
    url: "https://www.nationthailand.com/rss",
    type: "rss_feed"
  },
  {
    name: "Thai PBS World",
    url: "https://www.thaipbsworld.com/feed/",
    type: "rss_feed"
  },
  {
    name: "Khaosod English",
    url: "https://www.khaosodenglish.com/feed/",
    type: "rss_feed"
  },
  {
    name: "ASEAN NOW Forum",
    url: "https://www.aseannow.com/forum/discover/8.xml/",
    type: "rss_feed"
  },
  {
    name: "Pattaya People",
    url: "http://pattayapeople.com/",
    type: "rss_feed"
  }
];

async function testRSSFeed(source) {
  try {
    console.log(`\n📰 Testing ${source.name}...`);
    console.log(`   URL: ${source.url}`);
    
    const parser = new RSS({
      customFields: {
        item: ['creator', 'dc:creator']
      }
    });
    
    const feed = await parser.parseURL(source.url);
    
    console.log(`   ✅ Success! Found ${feed.items.length} articles`);
    console.log(`   📰 Feed Title: ${feed.title || 'N/A'}`);
    console.log(`   📝 Feed Description: ${feed.description || 'N/A'}`);
    
    if (feed.items.length > 0) {
      const latestArticle = feed.items[0];
      console.log(`   🔥 Latest Article: "${latestArticle.title}"`);
      console.log(`   📅 Published: ${latestArticle.pubDate || 'N/A'}`);
      console.log(`   🔗 Link: ${latestArticle.link || 'N/A'}`);
    }
    
    return {
      success: true,
      articleCount: feed.items.length,
      feedTitle: feed.title,
      latestArticle: feed.items[0]?.title
    };
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testNewsAPI() {
  console.log(`\n📰 Testing NewsAPI.org...`);
  console.log(`   Note: Requires API key to test`);
  
  // This would require an actual API key
  console.log(`   ⚠️  Skipping actual test - requires API key`);
  console.log(`   📋 To test: Get API key from https://newsapi.org/`);
  console.log(`   🔗 Test URL: https://newsapi.org/v2/top-headlines?country=th&apiKey=YOUR_KEY`);
  
  return {
    success: true,
    note: "Requires API key to test"
  };
}

async function testGNews() {
  console.log(`\n📰 Testing GNews.io...`);
  console.log(`   Note: Requires API key to test`);
  
  // This would require an actual API key
  console.log(`   ⚠️  Skipping actual test - requires API key`);
  console.log(`   📋 To test: Get API key from https://gnews.io/`);
  console.log(`   🔗 Test URL: https://gnews.io/api/v4/top-headlines?country=th&apikey=YOUR_KEY`);
  
  return {
    success: true,
    note: "Requires API key to test"
  };
}

async function testAllNewsSources() {
  console.log('🧪 Testing All News Sources for Pattaya1...\n');
  console.log('=' * 60);
  
  const results = {
    rss: [],
    api: []
  };
  
  // Test RSS feeds
  for (const source of newsSources) {
    const result = await testRSSFeed(source);
    results.rss.push({
      name: source.name,
      ...result
    });
    
    // Add delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test API sources
  const newsAPIResult = await testNewsAPI();
  results.api.push({
    name: "NewsAPI.org",
    ...newsAPIResult
  });
  
  const gnewsResult = await testGNews();
  results.api.push({
    name: "GNews.io",
    ...gnewsResult
  });
  
  // Summary
  console.log('\n' + '=' * 60);
  console.log('📊 TEST SUMMARY');
  console.log('=' * 60);
  
  const successfulRSS = results.rss.filter(r => r.success).length;
  const totalRSS = results.rss.length;
  
  console.log(`\n📡 RSS Feeds: ${successfulRSS}/${totalRSS} working`);
  
  results.rss.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const info = result.success ? 
      `${result.articleCount} articles` : 
      result.error;
    console.log(`   ${status} ${result.name}: ${info}`);
  });
  
  console.log(`\n🔌 API Sources: 2 configured (require API keys)`);
  results.api.forEach(result => {
    console.log(`   ⚠️  ${result.name}: ${result.note}`);
  });
  
  console.log(`\n🎯 Overall Status: ${successfulRSS}/${totalRSS} RSS feeds working`);
  console.log(`📈 Success Rate: ${Math.round((successfulRSS / totalRSS) * 100)}%`);
  
  if (successfulRSS === totalRSS) {
    console.log('\n🎉 All RSS feeds are working perfectly!');
  } else {
    console.log('\n⚠️  Some RSS feeds need attention.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Get API keys for NewsAPI.org and GNews.io');
  console.log('   2. Update the API keys in the news sources configuration');
  console.log('   3. Run the populate script: node scripts/populate-news-sources.js');
  console.log('   4. Start the cron scheduler to begin fetching news');
}

// Run the test
testAllNewsSources().catch(console.error);
