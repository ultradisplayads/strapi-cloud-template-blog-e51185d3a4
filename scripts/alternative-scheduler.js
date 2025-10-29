const axios = require('axios');
const Parser = require('rss-parser');
const DynamicCleanupManager = require('./dynamic-cleanup-manager');
const OptimizedAlgoliaService = require('./optimized-algolia-service');

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

class NewsScheduler {
  constructor() {
    this.fetchCount = 0;
    this.isRunning = false;
    this.cleanupManager = new DynamicCleanupManager();
    this.algoliaService = new OptimizedAlgoliaService();
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
      
      // Use the global parser instance
      
      let totalCreated = 0;
      
      for (const source of activeSources) {
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
                    const contentToSearch = item.content || item.description || item.fullDescription || '';
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

                  const response = await axios.post('https://api.pattaya1.com/api/breaking-news-plural', {
                    data: breakingNewsData
                  });
                  
                  // Index the new breaking news item in Algolia
                  try {
                    await this.algoliaService.addItem('breaking-news', response.data.data);
                    console.log(`     🔍 Indexed in Algolia: ${item.title.substring(0, 50)}...`);
                  } catch (algoliaError) {
                    console.log(`     ⚠️  Algolia indexing failed: ${algoliaError.message}`);
                  }
                  
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
      
      // Check current article count and limit before cleanup
      const currentCountResponse = await axios.get('https://api.pattaya1.com/api/breaking-news-plural');
      const currentCount = currentCountResponse.data.data.length;
      
      const settingsResponse = await axios.get('https://api.pattaya1.com/api/news-settings');
      const maxLimit = settingsResponse.data.data.maxArticleLimit || 21;
      
      console.log(`📊 Current articles: ${currentCount}/${maxLimit}`);
      
      // Only trigger cleanup if we exceed the limit
      if (currentCount > maxLimit) {
        console.log(`⚠️  Exceeded limit by ${currentCount - maxLimit} articles - triggering cleanup`);
        await this.cleanupManager.trigger();
      } else if (currentCount < maxLimit) {
        console.log(`📈 ${maxLimit - currentCount} slots available for more articles`);
      } else {
        console.log(`✅ At optimal limit of ${maxLimit} articles`);
      }
      
      console.log(`✅ [${new Date().toLocaleTimeString()}] Fetch #${this.fetchCount} completed: ${totalCreated} new articles`);
      
    } catch (error) {
      console.log(`❌ [${new Date().toLocaleTimeString()}] Fetch #${this.fetchCount} failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  async cleanupOldArticles() {
    try {
      console.log('   🧹 Checking article count and cleaning up old articles...');
      
      // Get the dynamic article limit from settings
      let maxArticleLimit = 21; // Default fallback
      try {
        const settingsResponse = await axios.get('https://api.pattaya1.com/api/news-settings');
        if (settingsResponse.data.data && settingsResponse.data.data.maxArticleLimit) {
          maxArticleLimit = settingsResponse.data.data.maxArticleLimit;
          console.log(`   ⚙️  Using configured article limit: ${maxArticleLimit}`);
        } else {
          console.log(`   ⚙️  Using default article limit: ${maxArticleLimit}`);
        }
      } catch (settingsError) {
        console.log(`   ⚠️  Could not fetch settings, using default limit: ${maxArticleLimit}`);
      }
      
      // Get all breaking news articles ordered by creation date (newest first)
      const allArticles = await axios.get('https://api.pattaya1.com/api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=200');
      const articles = allArticles.data.data;
      
      console.log(`   📊 Found ${articles.length} total articles`);
      
      // If we have more than the configured limit, delete the oldest ones
      if (articles.length > maxArticleLimit) {
        const articlesToDelete = articles.slice(maxArticleLimit); // Get articles beyond the limit
        console.log(`   🗑️  Deleting ${articlesToDelete.length} oldest articles to maintain limit of ${maxArticleLimit}`);
        
        for (const article of articlesToDelete) {
          try {
            await axios.delete(`https://api.pattaya1.com/api/breaking-news-plural/${article.id}`);
            console.log(`   ✅ Deleted article: ${article.Title.substring(0, 50)}...`);
          } catch (deleteError) {
            console.log(`   ❌ Failed to delete article ${article.id}: ${deleteError.message}`);
          }
        }
        
        console.log(`   ✅ Cleanup completed. Maintained limit of ${maxArticleLimit} articles.`);
      } else {
        console.log(`   ✅ Article count (${articles.length}) is within limit of ${maxArticleLimit}. No cleanup needed.`);
      }
      
    } catch (error) {
      console.log(`   ❌ Cleanup failed: ${error.message}`);
    }
  }

  start(intervalMinutes = 5) {
    console.log(`🚀 Starting news scheduler (every ${intervalMinutes} minute(s))...`);
    
    // Start the dynamic cleanup manager
    this.cleanupManager.start();
    
    // Initial fetch
    this.fetchNews();
    
    // Set up interval
    setInterval(() => {
      this.fetchNews();
    }, intervalMinutes * 60 * 1000);
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