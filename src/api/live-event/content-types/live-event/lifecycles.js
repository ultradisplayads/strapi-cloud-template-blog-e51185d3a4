const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new live-event in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('live-event', result);
      strapi.log.info(`Indexed new live-event ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing live-event in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated live-event in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('live-event', result);
      strapi.log.info(`Updated live-event ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating live-event in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove live-event from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('live-event', result.documentId || result.id);
      strapi.log.info(`Removed live-event ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing live-event from Algolia:', error);
    }
  },
};