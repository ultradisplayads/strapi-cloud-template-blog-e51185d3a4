#!/usr/bin/env node

/**
 * Test script to verify scheduler works with 10 article limit
 * This will simulate adding new articles and verify cleanup happens
 */

const axios = require('axios');

async function testSchedulerWithLimit() {
  try {
    console.log('🧪 Testing scheduler with 10 article limit...\n');
    
    // Check current article count
    console.log('📊 Current state:');
    const currentResponse = await axios.get('http://localhost:1337/api/breaking-news/live');
    console.log(`   Total items: ${currentResponse.data.meta.total}`);
    console.log(`   News articles: ${currentResponse.data.meta.newsCount}`);
    console.log(`   Breaking news: ${currentResponse.data.meta.breakingCount}`);
    console.log(`   Pinned: ${currentResponse.data.meta.pinnedCount}\n`);
    
    // Get actual article count from database
    const articlesResponse = await axios.get('http://localhost:1337/api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=50');
    const articles = articlesResponse.data.data;
    console.log(`📰 Database articles: ${articles.length}\n`);
    
    // Create a test article to trigger cleanup
    console.log('➕ Adding test article to trigger cleanup...');
    const testArticle = {
      data: {
        Title: `Test Article - ${new Date().toLocaleTimeString()}`,
        Summary: 'This is a test article to verify the 10-article limit cleanup works correctly.',
        URL: 'https://example.com/test-article',
        Category: 'Test',
        Source: 'Test Source',
        IsBreaking: false,
        FeaturedImage: null,
        ImageAlt: '',
        ImageCaption: '',
        upvotes: 0,
        downvotes: 0,
        isPinned: false
      }
    };
    
    const createResponse = await axios.post('http://localhost:1337/api/breaking-news-plural', testArticle);
    console.log(`   ✅ Created test article: ${createResponse.data.data.Title}\n`);
    
    // Check count after adding
    const afterAddResponse = await axios.get('http://localhost:1337/api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=50');
    const afterAddArticles = afterAddResponse.data.data;
    console.log(`📈 After adding: ${afterAddArticles.length} articles`);
    
    // Trigger manual cleanup to simulate what scheduler does
    console.log('🧹 Triggering cleanup (simulating scheduler behavior)...');
    const DynamicCleanupManager = require('./dynamic-cleanup-manager');
    const cleanupManager = new DynamicCleanupManager();
    await cleanupManager.trigger();
    
    // Check final count
    console.log('\n📊 Final state:');
    const finalResponse = await axios.get('http://localhost:1337/api/breaking-news/live');
    console.log(`   Total items: ${finalResponse.data.meta.total}`);
    console.log(`   News articles: ${finalResponse.data.meta.newsCount}`);
    console.log(`   Breaking news: ${finalResponse.data.meta.breakingCount}`);
    
    const finalArticlesResponse = await axios.get('http://localhost:1337/api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=50');
    const finalArticles = finalArticlesResponse.data.data;
    console.log(`   Database articles: ${finalArticles.length}`);
    
    // Verify limit is respected
    if (finalArticles.length <= 10) {
      console.log('\n✅ SUCCESS: Article limit is being respected!');
      console.log(`   Maintained ${finalArticles.length} articles (≤ 10 limit)`);
    } else {
      console.log('\n❌ ISSUE: Article count exceeds limit');
      console.log(`   Found ${finalArticles.length} articles (> 10 limit)`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testSchedulerWithLimit();
