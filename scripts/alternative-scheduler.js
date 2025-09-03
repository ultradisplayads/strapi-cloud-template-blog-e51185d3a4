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
      const sourcesResponse = await axios.get('http://localhost:1337/api/news-sources');
      const activeSources = sourcesResponse.data.data.filter(s => s.isActive === true);
      
      console.log(`   📡 Found ${activeSources.length} active news sources`);
      
      const RSS = require('rss-parser');
      const parser = new RSS({
        customFields: {
          item: ['dc:creator', 'creator']
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
                const existing = await axios.get(`http://localhost:1337/api/breaking-news-plural?filters[URL][$eq]=${encodeURIComponent(item.link)}`);
                if (existing.data.data && existing.data.data.length > 0) continue;
                
                // Check if article contains breaking news keywords
                const title = (item.title || '').toLowerCase();
                const content = (item.contentSnippet || item.content || '').toLowerCase();
                const breakingKeywords = [
                  'breaking news', 'breaking:', 'urgent:', 'alert:', 'emergency', 
                  'developing story', 'just in:', 'live update', 'bombshell', 
                  'crisis', 'dissolve parliament', 'parliament dissolution', 
                  'urgent action', 'immediate', 'critical', 'major announcement',
                  'shocking', 'unprecedented', 'explosive', 'scandal'
                ];
                
                const isBreaking = breakingKeywords.some(keyword => 
                  title.includes(keyword) || content.includes(keyword)
                );
                
                // Log keyword detection for debugging
                if (isBreaking) {
                  console.log(`     🚨 BREAKING NEWS detected: ${item.title?.substring(0, 50)}...`);
                }

                // Create breaking news entry
                const breakingNewsData = {
                  Title: item.title || 'Untitled',
                  Summary: (item.contentSnippet || item.content || '').substring(0, 200),
                  Category: 'General',
                  Source: source.name,
                  URL: item.link || '#',
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
                  publishedAt: new Date()
                };

                await axios.post('http://localhost:1337/api/breaking-news-plural', {
                  data: breakingNewsData
                });
                totalCreated++;
                console.log(`     ✅ Created: ${item.title?.substring(0, 50)}...`);
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
