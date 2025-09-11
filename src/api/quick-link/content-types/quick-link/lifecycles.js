const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new quick-link in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('quick-link', result);
      strapi.log.info(`Indexed new quick-link ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing quick-link in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated quick-link in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('quick-link', result);
      strapi.log.info(`Updated quick-link ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating quick-link in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove quick-link from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('quick-link', result.documentId || result.id);
      strapi.log.info(`Removed quick-link ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing quick-link from Algolia:', error);
    }
  },
};