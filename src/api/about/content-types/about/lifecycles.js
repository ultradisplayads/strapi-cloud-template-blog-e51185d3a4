const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new about in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('about', result);
      strapi.log.info(`Indexed new about ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing about in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated about in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('about', result);
      strapi.log.info(`Updated about ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating about in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove about from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('about', result.documentId || result.id);
      strapi.log.info(`Removed about ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing about from Algolia:', error);
    }
  },
};