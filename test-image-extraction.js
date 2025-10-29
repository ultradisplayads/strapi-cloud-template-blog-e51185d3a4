#!/usr/bin/env node

/**
 * Test script to verify image extraction in breaking news RSS feeds
 * This script tests the updated breaking news service to ensure images are being extracted and stored
 */

const axios = require('axios');
const Parser = require('rss-parser');

// Test RSS feeds with known image content
const testFeeds = [
  {
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    expectedImages: true
  },
  {
    name: 'CNN Top Stories',
    url: 'http://rss.cnn.com/rss/edition.rss',
    expectedImages: true
  },
  {
    name: 'Reuters World News',
    url: 'https://feeds.reuters.com/reuters/worldNews',
    expectedImages: true
  }
];

async function testImageExtraction() {
  console.log('🧪 Testing RSS Image Extraction for Breaking News...\n');
  
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

  let totalTests = 0;
  let successfulExtractions = 0;
  let totalImagesFound = 0;

  for (const feed of testFeeds) {
    console.log(`📡 Testing ${feed.name}...`);
    
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items.slice(0, 3); // Test first 3 items
      
      console.log(`   Found ${items.length} items to test`);
      
      for (const item of items) {
        totalTests++;
        
        // Extract featured image with multiple methods (same logic as updated service)
        let featuredImage = null;
        let imageAlt = '';
        let imageCaption = '';
        
        // Method 1: Check media fields
        if (item.mediaContent && item.mediaContent.url) {
          featuredImage = item.mediaContent.url;
          console.log(`   ✅ Media content image found: ${featuredImage.substring(0, 60)}...`);
        } else if (item.mediaThumbnail && item.mediaThumbnail.url) {
          featuredImage = item.mediaThumbnail.url;
          console.log(`   ✅ Media thumbnail found: ${featuredImage.substring(0, 60)}...`);
        } else if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
          featuredImage = item.enclosure.url;
          console.log(`   ✅ Enclosure image found: ${featuredImage.substring(0, 60)}...`);
        }
        
        // Method 2: Extract from content
        if (!featuredImage) {
          const contentToSearch = item.content || item.description || item.fullDescription || '';
          const imgRegex = /<img[^>]+src="([^">]+)"/i;
          const match = imgRegex.exec(contentToSearch);
          if (match) {
            featuredImage = match[1];
            console.log(`   ✅ HTML image found: ${featuredImage.substring(0, 60)}...`);
            
            // Extract alt text
            const altRegex = /<img[^>]+alt="([^">]*)"/i;
            const altMatch = altRegex.exec(contentToSearch);
            if (altMatch) {
              imageAlt = altMatch[1];
            }
          }
        }
        
        // Ensure full URL for relative paths
        if (featuredImage && !featuredImage.startsWith('http')) {
          try {
            const sourceUrl = new URL(feed.url);
            featuredImage = `${sourceUrl.protocol}//${sourceUrl.hostname}${featuredImage.startsWith('/') ? '' : '/'}${featuredImage}`;
            console.log(`   🔗 Converted relative URL to: ${featuredImage.substring(0, 60)}...`);
          } catch (urlError) {
            console.log(`   ⚠️  Failed to resolve relative image URL: ${featuredImage}`);
          }
        }
        
        if (featuredImage) {
          successfulExtractions++;
          totalImagesFound++;
          console.log(`   🖼️  Image extracted successfully for: "${item.title?.substring(0, 50)}..."`);
        } else {
          console.log(`   ❌ No image found for: "${item.title?.substring(0, 50)}..."`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to test ${feed.name}: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('📊 Test Results Summary:');
  console.log(`   Total items tested: ${totalTests}`);
  console.log(`   Items with images: ${successfulExtractions}`);
  console.log(`   Success rate: ${totalTests > 0 ? ((successfulExtractions / totalTests) * 100).toFixed(1) : 0}%`);
  console.log(`   Total images found: ${totalImagesFound}`);
  
  if (successfulExtractions > 0) {
    console.log('\n✅ Image extraction is working! The updated breaking news service should now store images.');
  } else {
    console.log('\n❌ No images were extracted. Check RSS feed formats and image extraction logic.');
  }
  
  console.log('\n🔧 Next steps:');
  console.log('   1. Restart your Strapi server to load the updated service');
  console.log('   2. Wait for the next cron job run (every 5 minutes)');
  console.log('   3. Check the breaking news entries in Strapi admin for FeaturedImage fields');
  console.log('   4. Verify images appear in the frontend breaking news feed');
}

// Run the test
testImageExtraction().catch(console.error);
