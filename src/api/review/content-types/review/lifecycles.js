const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new review in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('review', result);
      strapi.log.info(`Indexed new review ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing review in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated review in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('review', result);
      strapi.log.info(`Updated review ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating review in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove review from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('review', result.documentId || result.id);
      strapi.log.info(`Removed review ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing review from Algolia:', error);
    }
  },
};