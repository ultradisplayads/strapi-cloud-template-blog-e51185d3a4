const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new booking in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('booking', result);
      strapi.log.info(`Indexed new booking ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing booking in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated booking in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('booking', result);
      strapi.log.info(`Updated booking ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating booking in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove booking from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('booking', result.documentId || result.id);
      strapi.log.info(`Removed booking ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing booking from Algolia:', error);
    }
  },
};