module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new review in Algolia (with error handling)
    try {
      const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('review', result);
      strapi.log.info(`Indexed new review ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.warn(`Algolia indexing not available for review ${result.id}:`, error.message);
      // Don't throw error - just log warning and continue
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated review in Algolia (with error handling)
    try {
      const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('review', result);
      strapi.log.info(`Updated review ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.warn(`Algolia indexing not available for review ${result.id}:`, error.message);
      // Don't throw error - just log warning and continue
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove review from Algolia (with error handling)
    try {
      const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.deleteItem('review', result.documentId || result.id);
      strapi.log.info(`Removed review ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.warn(`Algolia indexing not available for review ${result.id}:`, error.message);
      // Don't throw error - just log warning and continue
    }
  },
};