module.exports = {
  /**
   * News fetching cron job - runs every 5 minutes to fetch real news
   */
  '*/5 * * * *': async ({ strapi }) => {
    try {
      strapi.log.info('Running 5-minute news fetch...');
      
      // Fetch news from RSS feeds and News API
      const newsSourceService = strapi.service('api::news-source.news-source');
      const breakingNewsService = strapi.service('api::breaking-news.breaking-news');
      
      // Get all active news sources
      const sources = await strapi.entityService.findMany('api::news-source.news-source', {
        filters: { isActive: true }
      });
      
      let totalArticles = 0;
      
      for (const source of sources) {
        try {
          let articles = [];
          
          articles = await newsSourceService.fetchFromSource(source);
          
          // Process and save articles
          for (const article of articles.slice(0, 5)) { // Limit to 5 per source
            try {
              await strapi.entityService.create('api::article.article', {
                data: {
                  title: article.title,
                  description: article.description?.substring(0, 80) || '',
                  slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  publishedAt: article.publishedAt || new Date().toISOString(),
                  blocks: [
                    {
                      __component: 'shared.rich-text',
                      body: article.content || article.description || ''
                    }
                  ]
                }
              });
              totalArticles++;
            } catch (createError) {
              // Skip duplicates or validation errors
              continue;
            }
          }
        } catch (sourceError) {
          strapi.log.error(`Failed to fetch from source ${source.name}:`, sourceError.message);
        }
      }
      
      strapi.log.info(`News fetch completed: ${totalArticles} new articles added`);
    } catch (error) {
      strapi.log.error('Scheduled news fetch failed:', error.message);
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
