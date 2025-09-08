#!/usr/bin/env node

/**
 * Check actual database count and investigate discrepancy
 */

const axios = require('axios');

async function checkActualCount() {
  try {
    console.log('🔍 Checking actual breaking news count...\n');
    
    // Method 1: Check via breaking-news-plural API
    console.log('1️⃣ Via breaking-news-plural API:');
    try {
      const pluralResponse = await axios.get('https://api.pattaya1.com/api/breaking-news-plural?pagination[limit]=100&sort=createdAt:desc');
      const pluralArticles = pluralResponse.data.data;
      console.log(`   📊 Found ${pluralArticles.length} articles`);
      
      if (pluralArticles.length > 0) {
        console.log(`   📄 Newest: "${pluralArticles[0].Title?.substring(0, 50)}..."`);
        console.log(`   📄 Oldest: "${pluralArticles[pluralArticles.length - 1].Title?.substring(0, 50)}..."`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    
    // Method 2: Check via live API
    console.log('\n2️⃣ Via live API:');
    try {
      const liveResponse = await axios.get('https://api.pattaya1.com/api/breaking-news/live');
      console.log(`   📊 Total items: ${liveResponse.data.meta.total}`);
      console.log(`   📰 News count: ${liveResponse.data.meta.newsCount}`);
      console.log(`   📌 Pinned count: ${liveResponse.data.meta.pinnedCount}`);
      console.log(`   💰 Sponsored count: ${liveResponse.data.meta.sponsoredCount}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    
    // Method 3: Direct database query simulation
    console.log('\n3️⃣ Checking for cleanup issues:');
    try {
      const allResponse = await axios.get('https://api.pattaya1.com/api/breaking-news-plural?pagination[limit]=100');
      const allArticles = allResponse.data.data;
      
      console.log(`   📊 Total database entries: ${allArticles.length}`);
      
      // Check for duplicates
      const urls = allArticles.map(a => a.URL);
      const uniqueUrls = [...new Set(urls)];
      console.log(`   🔗 Unique URLs: ${uniqueUrls.length}`);
      console.log(`   🔄 Potential duplicates: ${allArticles.length - uniqueUrls.length}`);
      
      // Show recent articles
      console.log('\n   📋 Recent articles:');
      allArticles.slice(0, 5).forEach((article, index) => {
        console.log(`   ${index + 1}. "${article.Title?.substring(0, 40)}..." (ID: ${article.id})`);
      });
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    
    // Method 4: Check settings
    console.log('\n4️⃣ Current settings:');
    try {
      const settingsResponse = await axios.get('https://api.pattaya1.com/api/news-settings');
      if (settingsResponse.data.data) {
        console.log(`   ⚙️  Max Article Limit: ${settingsResponse.data.data.maxArticleLimit}`);
      } else {
        console.log(`   ⚠️  No settings found`);
      }
    } catch (error) {
      console.log(`   ❌ Settings check failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run the check
checkActualCount();
