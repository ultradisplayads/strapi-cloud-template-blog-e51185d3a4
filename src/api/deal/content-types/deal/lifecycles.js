const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new deal in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('deal', result);
      strapi.log.info(`Indexed new deal ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing deal in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated deal in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('deal', result);
      strapi.log.info(`Updated deal ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating deal in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove deal from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('deal', result.documentId || result.id);
      strapi.log.info(`Removed deal ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing deal from Algolia:', error);
    }
  },
};