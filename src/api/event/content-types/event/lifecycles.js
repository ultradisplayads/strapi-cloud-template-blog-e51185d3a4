const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new event in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('event', result);
      strapi.log.info(`Indexed new event ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing event in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated event in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('event', result);
      strapi.log.info(`Updated event ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating event in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove event from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('event', result.documentId || result.id);
      strapi.log.info(`Removed event ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing event from Algolia:', error);
    }
  },
};