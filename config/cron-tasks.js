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
   * Cleanup old articles cron job
   * Runs daily at 2 AM to clean up old rejected articles
   */
  '0 2 * * *': async ({ strapi }) => {
    try {
      strapi.log.info('Running daily cleanup...');
      
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
      
      strapi.log.info(`Daily cleanup completed: ${deletedArticles.count} old rejected articles removed`);
    } catch (error) {
      strapi.log.error('Daily cleanup failed:', error.message);
    }
  }
};
