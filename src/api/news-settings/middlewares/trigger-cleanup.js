'use strict';

/**
 * Middleware to trigger cleanup when news settings are updated
 */

const path = require('path');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Store original data for comparison
    const { id } = ctx.params;
    let currentSettings = null;
    
    if (ctx.method === 'PUT' && id) {
      try {
        currentSettings = await strapi.entityService.findOne('api::news-settings.news-settings', id);
      } catch (error) {
        console.log('Could not fetch current settings:', error.message);
      }
    }
    
    // Continue with the request
    await next();
    
    // After successful update, check if limit changed
    if (ctx.method === 'PUT' && ctx.status === 200 && currentSettings) {
      const { data } = ctx.request.body;
      const currentLimit = currentSettings?.maxArticleLimit;
      const newLimit = data?.maxArticleLimit;
      
      if (currentLimit !== newLimit && newLimit) {
        console.log(`🔄 [Middleware] Article limit changed: ${currentLimit} → ${newLimit}`);
        
        try {
          // Import required managers with absolute paths
          const SQLCleanupManagerPath = path.join(process.cwd(), 'scripts', 'sql-cleanup-manager.js');
          const SQLCleanupManager = require(SQLCleanupManagerPath);
          const cleanupManager = new SQLCleanupManager();
          
          if (newLimit > currentLimit) {
            // Limit increased - trigger repopulation
            console.log(`📈 [Middleware] Limit increased - triggering news fetch to populate ${newLimit - currentLimit} additional slots`);
            
            setImmediate(async () => {
              try {
                // First ensure we're within current limit
                const cleanupResult = await cleanupManager.enforceLimit();
                console.log(`🧹 [Middleware] Cleanup result: ${cleanupResult.finalCount}/${cleanupResult.maxLimit}`);
                
                // Then trigger news fetch to populate new slots
                const NewsSchedulerPath = path.join(process.cwd(), 'scripts', 'alternative-scheduler.js');
                const NewsScheduler = require(NewsSchedulerPath);
                const scheduler = new NewsScheduler();
                await scheduler.fetchNews();
                
                console.log(`✅ [Middleware] Auto-repopulation completed for increased limit: ${newLimit}`);
              } catch (error) {
                console.log(`❌ [Middleware] Auto-repopulation failed: ${error.message}`);
              }
            });
            
          } else if (newLimit < currentLimit) {
            // Limit decreased - trigger cleanup
            setImmediate(async () => {
              try {
                const result = await cleanupManager.enforceLimit();
                console.log(`✅ [Middleware] Auto-cleanup completed: ${result.deleted} articles deleted, final count: ${result.finalCount}/${result.maxLimit}`);
              } catch (error) {
                console.log(`❌ [Middleware] Auto-cleanup failed: ${error.message}`);
              }
            });
          }
          
          console.log(`🚀 [Middleware] Automatic adjustment triggered for new limit: ${newLimit}`);
        } catch (error) {
          console.log(`⚠️ [Middleware] Failed to trigger automatic adjustment: ${error.message}`);
        }
      }
    }
  };
};
