module.exports = {
  /**
   * News fetching cron job - runs every 1 minute to fetch real news
   */
  '* * * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🔄 Running 1-minute news fetch...');
      
      // Get all active news sources
      const sources = await strapi.entityService.findMany('api::news-source.news-source', {
        filters: { isActive: true }
      });
      
      strapi.log.info(`📡 Found ${sources.length} active news sources`);
      
      let totalArticles = 0;
      
      // Use RSS parser directly for better reliability
      const RSS = require('rss-parser');
      const parser = new RSS({
        customFields: {
          item: ['creator', 'dc:creator']
        }
      });
      
      for (const source of sources) {
        try {
          strapi.log.info(`📰 Fetching from ${source.name}...`);
          
          if (source.sourceType === 'rss_feed') {
            const feed = await parser.parseURL(source.url);
            const articles = feed.items.slice(0, 3); // Limit to 3 per source
            
            for (const item of articles) {
              try {
                // Create unique slug with timestamp
                const slug = `${item.title.toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
                  .substring(0, 50)}-${Date.now()}`;
                
                await strapi.entityService.create('api::breaking-news.breaking-news', {
                  data: {
                    Title: item.title || 'Untitled',
                    Summary: (item.contentSnippet || item.content || '').substring(0, 200),
                    Category: 'General',
                    Source: source.name,
                    URL: item.link || '#',
                    IsBreaking: false,
                    PublishedTimestamp: item.pubDate ? new Date(item.pubDate) : new Date(),
                    isPinned: false,
                    voteScore: 0,
                    upvotes: 0,
                    downvotes: 0,
                    userVotes: {},
                    moderationStatus: 'approved',
                    isHidden: false,
                    fetchedFromAPI: true,
                    apiSource: source.name,
                    originalAPIData: item,
                    publishedAt: new Date()
                  }
                });
                totalArticles++;
                strapi.log.info(`✅ Created: ${item.title}`);
              } catch (createError) {
                // Skip duplicates or validation errors
                strapi.log.debug(`Skipped article: ${createError.message}`);
                continue;
              }
            }
          } else if (source.sourceType === 'news_api') {
            // Handle NewsAPI.org and GNews.io
            let apiUrl = source.url;
            let params = {};
            
            if (source.name.includes('NewsAPI')) {
              // NewsAPI.org format
              apiUrl = `${source.url}?country=th&apiKey=${source.apiKey}`;
            } else if (source.name.includes('GNews')) {
              // GNews.io format
              apiUrl = `${source.url}?country=th&apikey=${source.apiKey}`;
            }
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            let articles = [];
            if (data.articles) {
              articles = data.articles.slice(0, 3); // Limit to 3 per source
            }
            
            for (const item of articles) {
              try {
                await strapi.entityService.create('api::breaking-news.breaking-news', {
                  data: {
                    Title: item.title || 'Untitled',
                    Summary: (item.description || item.content || '').substring(0, 200),
                    Category: 'General',
                    Source: source.name,
                    URL: item.url || item.link || '#',
                    IsBreaking: false,
                    PublishedTimestamp: item.publishedAt ? new Date(item.publishedAt) : new Date(),
                    isPinned: false,
                    voteScore: 0,
                    upvotes: 0,
                    downvotes: 0,
                    userVotes: {},
                    moderationStatus: 'approved',
                    isHidden: false,
                    fetchedFromAPI: true,
                    apiSource: source.name,
                    originalAPIData: item,
                    publishedAt: new Date()
                  }
                });
                totalArticles++;
                strapi.log.info(`✅ Created: ${item.title}`);
              } catch (createError) {
                // Skip duplicates or validation errors
                strapi.log.debug(`Skipped article: ${createError.message}`);
                continue;
              }
            }
          }
        } catch (sourceError) {
          strapi.log.error(`❌ Failed to fetch from ${source.name}: ${sourceError.message}`);
        }
      }
      
      strapi.log.info(`🎯 News fetch completed: ${totalArticles} new articles added`);
    } catch (error) {
      strapi.log.error('❌ Scheduled news fetch failed:', error.message);
    }
  },

  /**
   * Dynamic cleanup based on admin settings
   * Runs every 15 minutes to check if cleanup is needed
   */
  '*/15 * * * *': async ({ strapi }) => {
    try {
      // Get cleanup settings
      const settings = await strapi.entityService.findOne('api::news-settings.news-settings', 1);
      if (!settings || !settings.cleanupFrequencyMinutes) {
        return; // Skip if no settings
      }

      // Check if it's time to run cleanup
      const now = new Date();
      const lastRun = settings.lastCleanupRun ? new Date(settings.lastCleanupRun) : null;
      const frequencyMs = settings.cleanupFrequencyMinutes * 60 * 1000;
      
      if (lastRun && (now - lastRun) < frequencyMs) {
        return; // Not time yet
      }

      strapi.log.info('🧹 Running dynamic cleanup based on admin settings...');
      
      // Call the cleanup endpoint
      const cleanupResult = await strapi.controller('api::breaking-news.breaking-news').cleanup({
        state: {},
        throw: (code, message) => { throw new Error(`${code}: ${message}`); }
      });

      if (cleanupResult && cleanupResult.deletedCount > 0) {
        strapi.log.info(`✅ Dynamic cleanup completed: ${cleanupResult.deletedCount} articles deleted`);
      } else {
        strapi.log.info('✅ Dynamic cleanup completed: No articles needed deletion');
      }
    } catch (error) {
      strapi.log.error('❌ Dynamic cleanup failed:', error.message);
    }
  },

  /**
   * Daily cleanup at 2 AM - Remove old rejected articles (legacy)
   */
  '0 2 * * *': async ({ strapi }) => {
    try {
      strapi.log.info('🧹 Running daily rejected articles cleanup...');
      
      // Delete rejected articles older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const deletedArticles = await strapi.db.query('api::breaking-news.breaking-news').deleteMany({
        where: {
          moderationStatus: 'rejected',
          createdAt: {
            $lt: sevenDaysAgo
          }
        }
      });
      
      strapi.log.info(`✅ Daily rejected cleanup completed: ${deletedArticles.count} old rejected articles removed`);
    } catch (error) {
      strapi.log.error('❌ Daily rejected cleanup failed:', error.message);
    }
  }
};
