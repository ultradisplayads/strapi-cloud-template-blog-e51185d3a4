const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new traffic-route in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('traffic-route', result);
      strapi.log.info(`Indexed new traffic-route ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing traffic-route in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated traffic-route in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('traffic-route', result);
      strapi.log.info(`Updated traffic-route ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating traffic-route in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove traffic-route from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('traffic-route', result.documentId || result.id);
      strapi.log.info(`Removed traffic-route ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing traffic-route from Algolia:', error);
    }
  },
};