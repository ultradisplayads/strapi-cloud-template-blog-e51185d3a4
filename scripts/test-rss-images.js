const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

async function testRSSImages() {
  const sources = [
    { name: 'Pattaya Mail', url: 'https://www.pattayamail.com/feed' },
    { name: 'The Pattaya News', url: 'https://thepattayanews.com/feed/' },
    { name: 'The Thaiger', url: 'https://thethaiger.com/news/feed' },
    { name: 'Bangkok Post', url: 'https://www.bangkokpost.com/rss/data/most-recent.xml' }
  ];

  for (const source of sources) {
    console.log(`\n🔍 Testing ${source.name}:`);
    console.log(`📡 URL: ${source.url}`);
    
    try {
      const feed = await parser.parseURL(source.url);
      const firstItem = feed.items[0];
      
      if (firstItem) {
        console.log(`📰 Title: ${firstItem.title}`);
        
        // Check for images in various RSS fields
        const images = [];
        
        // Method 1: media:content or media:thumbnail
        if (firstItem.mediaContent) {
          images.push({ type: 'media:content', url: firstItem.mediaContent.$ ? firstItem.mediaContent.$.url : firstItem.mediaContent });
        }
        if (firstItem.mediaThumbnail) {
          images.push({ type: 'media:thumbnail', url: firstItem.mediaThumbnail.$ ? firstItem.mediaThumbnail.$.url : firstItem.mediaThumbnail });
        }
        
        // Method 2: enclosure (for podcasts/media)
        if (firstItem.enclosure && firstItem.enclosure.url) {
          images.push({ type: 'enclosure', url: firstItem.enclosure.url });
        }
        
        // Method 3: Extract from content:encoded or description
        const contentToSearch = firstItem.contentEncoded || firstItem.content || firstItem.description || '';
        const imgRegex = /<img[^>]+src="([^">]+)"/gi;
        let match;
        while ((match = imgRegex.exec(contentToSearch)) !== null) {
          images.push({ type: 'content-img', url: match[1] });
        }
        
        // Method 4: Check for WordPress featured image in content
        const wpImageRegex = /wp-content\/uploads\/[^"'\s]+\.(jpg|jpeg|png|gif|webp)/gi;
        let wpMatch;
        while ((wpMatch = wpImageRegex.exec(contentToSearch)) !== null) {
          const fullUrl = wpMatch[0].startsWith('http') ? wpMatch[0] : `https://${new URL(source.url).hostname}/${wpMatch[0]}`;
          images.push({ type: 'wp-featured', url: fullUrl });
        }
        
        if (images.length > 0) {
          console.log(`✅ Found ${images.length} images:`);
          images.forEach((img, index) => {
            console.log(`   ${index + 1}. [${img.type}] ${img.url}`);
          });
          
          // Test first image accessibility
          try {
            const response = await axios.head(images[0].url, { timeout: 5000 });
            console.log(`✅ First image accessible: ${response.status} ${response.statusText}`);
            console.log(`📏 Content-Type: ${response.headers['content-type']}`);
            if (response.headers['content-length']) {
              console.log(`📦 Size: ${Math.round(response.headers['content-length'] / 1024)}KB`);
            }
          } catch (error) {
            console.log(`❌ First image not accessible: ${error.message}`);
          }
        } else {
          console.log('❌ No images found');
        }
      }
    } catch (error) {
      console.log(`❌ Error parsing feed: ${error.message}`);
    }
  }
}

testRSSImages().catch(console.error);
