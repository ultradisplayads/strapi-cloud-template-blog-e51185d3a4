#!/usr/bin/env node

/**
 * Debug script to investigate news fetching issues
 * Tests RSS sources and duplicate detection
 */

const axios = require('axios');
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['description', 'fullDescription']
    ]
  }
});

async function debugNewsFetch() {
  try {
    console.log('🔍 Debugging news fetch process...\n');
    
    // Check if news sources API is accessible
    console.log('1️⃣ Testing news sources API...');
    try {
      const sourcesResponse = await axios.get('http://localhost:1337/api/news-sources');
      const sources = sourcesResponse.data.data;
      console.log(`   ✅ Found ${sources.length} total sources`);
      
      const activeSources = sources.filter(s => s.isActive === true);
      console.log(`   ✅ Found ${activeSources.length} active sources`);
      
      // List active sources
      activeSources.forEach((source, index) => {
        console.log(`   ${index + 1}. ${source.name} - ${source.url}`);
      });
      
    } catch (error) {
      console.log(`   ❌ News sources API failed: ${error.message}`);
      return;
    }
    
    console.log('\n2️⃣ Testing RSS feed parsing...');
    
    // Test first few RSS sources
    const sourcesResponse = await axios.get('http://localhost:1337/api/news-sources');
    const activeSources = sourcesResponse.data.data.filter(s => s.isActive === true);
    
    for (const source of activeSources.slice(0, 3)) {
      try {
        console.log(`\n   🔍 Testing ${source.name}...`);
        console.log(`   URL: ${source.url}`);
        
        const feed = await parser.parseURL(source.url);
        console.log(`   ✅ RSS parsed successfully`);
        console.log(`   📰 Found ${feed.items.length} items in feed`);
        
        if (feed.items.length > 0) {
          const firstItem = feed.items[0];
          console.log(`   📄 Latest article: "${firstItem.title?.substring(0, 60)}..."`);
          console.log(`   🔗 URL: ${firstItem.link}`);
          console.log(`   📅 Published: ${firstItem.pubDate}`);
        }
        
      } catch (sourceError) {
        console.log(`   ❌ ${source.name} failed: ${sourceError.message}`);
      }
    }
    
    console.log('\n3️⃣ Testing duplicate detection...');
    
    // Get existing articles to test duplicate detection
    try {
      const existingResponse = await axios.get('http://localhost:1337/api/breaking-news-plural?pagination[limit]=50');
      const existingArticles = existingResponse.data.data;
      console.log(`   📊 Found ${existingArticles.length} existing articles in database`);
      
      if (existingArticles.length > 0) {
        console.log(`   📄 Sample existing article: "${existingArticles[0].Title?.substring(0, 60)}..."`);
        console.log(`   🔗 URL: ${existingArticles[0].URL}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to fetch existing articles: ${error.message}`);
    }
    
    console.log('\n4️⃣ Testing article creation...');
    
    // Try to create a test article
    const testArticle = {
      data: {
        Title: `Debug Test Article - ${new Date().toISOString()}`,
        Summary: 'This is a debug test article to verify creation works.',
        URL: `https://debug-test.com/article-${Date.now()}`,
        Category: 'Debug',
        Source: 'Debug Source',
        IsBreaking: false,
        FeaturedImage: null,
        ImageAlt: '',
        ImageCaption: '',
        upvotes: 0,
        downvotes: 0,
        isPinned: false
      }
    };
    
    try {
      const createResponse = await axios.post('http://localhost:1337/api/breaking-news-plural', testArticle);
      console.log(`   ✅ Test article created successfully`);
      console.log(`   📄 Title: ${createResponse.data.data.Title}`);
      
      // Clean up test article
      await axios.delete(`http://localhost:1337/api/breaking-news-plural/${createResponse.data.data.id}`);
      console.log(`   🗑️  Test article cleaned up`);
      
    } catch (createError) {
      console.log(`   ❌ Article creation failed: ${createError.message}`);
      if (createError.response) {
        console.log(`   📋 Response: ${JSON.stringify(createError.response.data, null, 2)}`);
      }
    }
    
    console.log('\n🎯 Debug Summary:');
    console.log('   - Check if RSS sources are returning new content');
    console.log('   - Verify duplicate detection is not blocking all articles');
    console.log('   - Ensure article creation permissions are correct');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugNewsFetch();
