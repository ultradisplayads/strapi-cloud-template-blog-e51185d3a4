#!/usr/bin/env node

/**
 * Test duplicate detection logic to see why new articles aren't being created
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

async function testDuplicateDetection() {
  try {
    console.log('🔍 Testing duplicate detection logic...\n');
    
    // Get existing articles
    const existingResponse = await axios.get('https://api.pattaya1.com/api/breaking-news-plural?pagination[limit]=50');
    const existingArticles = existingResponse.data.data;
    console.log(`📊 Found ${existingArticles.length} existing articles\n`);
    
    // Test RSS feed from The Pattaya News
    console.log('📡 Fetching from The Pattaya News RSS...');
    const feed = await parser.parseURL('https://thepattayanews.com/feed/');
    console.log(`📰 Found ${feed.items.length} items in RSS feed\n`);
    
    // Check each RSS item against existing articles
    let duplicateCount = 0;
    let newCount = 0;
    
    for (const item of feed.items.slice(0, 5)) {
      const itemUrl = item.link;
      const itemTitle = item.title;
      
      console.log(`🔍 Checking: "${itemTitle?.substring(0, 50)}..."`);
      console.log(`   URL: ${itemUrl}`);
      
      // Check for duplicate by URL
      const duplicateByUrl = existingArticles.find(existing => existing.URL === itemUrl);
      
      // Check for duplicate by title (similar to scheduler logic)
      const duplicateByTitle = existingArticles.find(existing => 
        existing.Title && existing.Title.toLowerCase().trim() === itemTitle?.toLowerCase().trim()
      );
      
      if (duplicateByUrl) {
        console.log(`   ❌ DUPLICATE (URL): Found existing article with same URL`);
        console.log(`   📄 Existing: "${duplicateByUrl.Title?.substring(0, 50)}..."`);
        duplicateCount++;
      } else if (duplicateByTitle) {
        console.log(`   ❌ DUPLICATE (Title): Found existing article with same title`);
        console.log(`   📄 Existing: "${duplicateByTitle.Title?.substring(0, 50)}..."`);
        duplicateCount++;
      } else {
        console.log(`   ✅ NEW: This article is not a duplicate`);
        newCount++;
      }
      console.log('');
    }
    
    console.log('📈 Summary:');
    console.log(`   Duplicates found: ${duplicateCount}`);
    console.log(`   New articles: ${newCount}`);
    console.log(`   Total checked: ${duplicateCount + newCount}\n`);
    
    if (newCount === 0) {
      console.log('🚨 ISSUE IDENTIFIED: All RSS articles are being detected as duplicates!');
      console.log('   This explains why 0 new articles are being created.');
      console.log('   Possible causes:');
      console.log('   1. RSS feeds contain old articles already in database');
      console.log('   2. Duplicate detection logic is too strict');
      console.log('   3. Articles were recently added and RSS hasn\'t updated');
    } else {
      console.log('✅ Found new articles that should be created');
    }
    
    // Show latest RSS vs latest DB article dates
    console.log('\n📅 Date comparison:');
    if (feed.items.length > 0) {
      console.log(`   Latest RSS article: ${feed.items[0].pubDate}`);
    }
    if (existingArticles.length > 0) {
      const sortedExisting = existingArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log(`   Latest DB article: ${sortedExisting[0].createdAt}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDuplicateDetection();
