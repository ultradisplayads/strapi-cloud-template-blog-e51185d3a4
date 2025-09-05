const axios = require('axios');

class NewsScheduler {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.fetchCount = 0;
  }

  async fetchNews() {
    if (this.isRunning) {
      console.log('⏳ Previous fetch still running, skipping...');
      return;
    }

    this.isRunning = true;
    this.fetchCount++;
    
    try {
      console.log(`🔄 [${new Date().toLocaleTimeString()}] News fetch #${this.fetchCount} starting...`);
      
      // Get active sources
      const sourcesResponse = await axios.get('https://api.pattaya1.com/api/news-sources');
      const activeSources = sourcesResponse.data.data.filter(s => s.isActive === true);
      
      console.log(`   📡 Found ${activeSources.length} active news sources`);
      
      const Parser = require('rss-parser');
      const parser = new Parser({
        customFields: {
          item: [
            'dc:creator', 
            'creator',
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['content:encoded', 'contentEncoded'],
            'description'
          ]
        }
      });
      
      let totalCreated = 0;
      
      for (const source of activeSources.slice(0, 3)) {
        try {
          if (source.sourceType === 'rss_feed' && source.url) {
            console.log(`   🔍 Fetching from ${source.name}...`);
            const feed = await parser.parseURL(source.url);
            const articles = feed.items.slice(0, 2);
            
            for (const item of articles) {
              try {
                // Check for duplicates
                const existing = await axios.get(`https://api.pattaya1.com/api/breaking-news-plural?filters[URL][$eq]=${encodeURIComponent(item.link)}`);
                
                if (existing.data.data.length === 0) {
                  // Clean content
                  let cleanContent = item.contentSnippet || item.content || item.summary || '';
                  cleanContent = cleanContent.replace(/<[^>]*>/g, '').substring(0, 500);
                  
                  // Extract featured image
                  let featuredImage = null;
                  let imageAlt = '';
                  let imageCaption = '';
                  
                  // Method 1: Check media fields
                  if (item.mediaContent && item.mediaContent.url) {
                    featuredImage = item.mediaContent.url;
                  } else if (item.mediaThumbnail && item.mediaThumbnail.url) {
                    featuredImage = item.mediaThumbnail.url;
                  } else if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
                    featuredImage = item.enclosure.url;
                  }
                  
                  // Method 2: Extract from content
                  if (!featuredImage) {
                    const contentToSearch = item.contentEncoded || item.content || item.description || '';
                    const imgRegex = /<img[^>]+src="([^">]+)"/i;
                    const match = imgRegex.exec(contentToSearch);
                    if (match) {
                      featuredImage = match[1];
                      
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
                    const sourceUrl = new URL(source.url);
                    featuredImage = `${sourceUrl.protocol}//${sourceUrl.hostname}${featuredImage.startsWith('/') ? '' : '/'}${featuredImage}`;
                  }
                  
                  // Check for breaking news keywords
                  const breakingKeywords = ['breaking', 'urgent', 'alert', 'emergency', 'developing', 'just in'];
                  const isBreaking = breakingKeywords.some(keyword => 
                    item.title.toLowerCase().includes(keyword) || 
                    cleanContent.toLowerCase().includes(keyword)
                  );
                  
                  if (isBreaking) {
                    console.log(`     🚨 BREAKING NEWS detected: ${item.title}...`);
                  }
                  
                  if (featuredImage) {
                    console.log(`     🖼️  Image found: ${featuredImage.substring(0, 60)}...`);
                  }

                  const breakingNewsData = {
                    Title: item.title,
                    Summary: cleanContent,
                    Severity: isBreaking ? 'high' : 'medium',
                    Category: item.categories?.[0] || 'General',
                    Source: source.name,
                    URL: item.link,
                    IsBreaking: isBreaking,
                    PublishedTimestamp: item.pubDate ? new Date(item.pubDate) : new Date(),
                    isPinned: false,
                    voteScore: 0,
                    upvotes: 0,
                    downvotes: 0,
                    moderationStatus: 'approved',
                    isHidden: false,
                    fetchedFromAPI: true,
                    apiSource: source.name,
                    originalAPIData: item,
                    FeaturedImage: featuredImage,
                    ImageAlt: imageAlt,
                    ImageCaption: imageCaption,
                    publishedAt: new Date()
                  };

                  await axios.post('https://api.pattaya1.com/api/breaking-news-plural', {
                    data: breakingNewsData
                  });
                  totalCreated++;
                }
              } catch (createError) {
                continue;
              }
            }
          }
        } catch (sourceError) {
          console.log(`   ❌ ${source.name}: ${sourceError.message}`);
        }
      }
      
      console.log(`✅ [${new Date().toLocaleTimeString()}] Fetch #${this.fetchCount} completed: ${totalCreated} new articles`);
      
    } catch (error) {
      console.log(`❌ [${new Date().toLocaleTimeString()}] Fetch #${this.fetchCount} failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  start(intervalMinutes = 5) {
    console.log(`🚀 Starting news scheduler (every ${intervalMinutes} minute(s))...`);
    
    // Run immediately
    this.fetchNews();
    
    // Then run on interval
    this.interval = setInterval(() => {
      this.fetchNews();
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('✅ News scheduler started successfully');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('🛑 News scheduler stopped');
    }
  }

  getStatus() {
    return {
      running: !!this.interval,
      fetchCount: this.fetchCount,
      currentlyFetching: this.isRunning
    };
  }
}

// Export for use in Strapi
module.exports = NewsScheduler;

// If run directly, start the scheduler
if (require.main === module) {
  const scheduler = new NewsScheduler();
  scheduler.start(5); // Every 5 minutes
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down news scheduler...');
    scheduler.stop();
    process.exit(0);
  });
  
  // Keep the process alive
  console.log('📡 News scheduler running. Press Ctrl+C to stop.');
}
