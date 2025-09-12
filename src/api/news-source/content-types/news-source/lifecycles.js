module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new news source in Algolia (with error handling)
    try {
      const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('news-source', result);
      strapi.log.info(`Indexed new news source ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.warn(`Algolia indexing not available for news source ${result.id}:`, error.message);
      // Don't throw error - just log warning and continue
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated news source in Algolia (with error handling)
    try {
      const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('news-source', result);
      strapi.log.info(`Updated news source ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.warn(`Algolia indexing not available for news source ${result.id}:`, error.message);
      // Don't throw error - just log warning and continue
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove deleted news source from Algolia (with error handling)
    try {
      const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.deleteItem('news-source', result.documentId || result.id);
      strapi.log.info(`Removed news source ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.warn(`Algolia indexing not available for news source ${result.id}:`, error.message);
      // Don't throw error - just log warning and continue
    }
  }
};
