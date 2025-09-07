'use strict';

/**
 * news-settings lifecycles
 */

const path = require('path');

module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;
    
    // Get the previous data from params (before update)
    const previousData = params.data;
    
    // Get current data from result (after update)
    const currentData = result;
    
    const previousLimit = previousData?.maxArticleLimit;
    const currentLimit = currentData?.maxArticleLimit;
    
    // If article limit changed, trigger manual SQL cleanup
    if (previousLimit !== currentLimit && currentLimit) {
      console.log(`🔄 [Lifecycle] Article limit changed: ${previousLimit} → ${currentLimit}`);
      console.log(`🚀 [Lifecycle] Triggering SQL cleanup manager...`);
      
      setImmediate(async () => {
        try {
          // Import and run manual SQL cleanup
          const SQLCleanupManagerPath = path.join(process.cwd(), 'scripts', 'sql-cleanup-manager.js');
          const SQLCleanupManager = require(SQLCleanupManagerPath);
          const cleanupManager = new SQLCleanupManager();
          
          // Run the same cleanup as manual script
          const result = await cleanupManager.enforceLimit();
          
          console.log(`✅ [Lifecycle] SQL cleanup completed: ${result.deleted} articles deleted, final count: ${result.finalCount}/${result.maxLimit}`);
          
          if (result.finalCount < currentLimit) {
            console.log(`📊 [Lifecycle] ${currentLimit - result.finalCount} slots available for new articles`);
          }
          
        } catch (error) {
          console.log(`❌ [Lifecycle] SQL cleanup failed: ${error.message}`);
        }
      });
    }
  },
};
