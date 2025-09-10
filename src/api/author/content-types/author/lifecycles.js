const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new author in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('author', result);
      strapi.log.info(`Indexed new author ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing author in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated author in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('author', result);
      strapi.log.info(`Updated author ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating author in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove author from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('author', result.documentId || result.id);
      strapi.log.info(`Removed author ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing author from Algolia:', error);
    }
  },
};