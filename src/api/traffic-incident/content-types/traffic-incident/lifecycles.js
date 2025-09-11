const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new traffic-incident in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('traffic-incident', result);
      strapi.log.info(`Indexed new traffic-incident ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing traffic-incident in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated traffic-incident in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('traffic-incident', result);
      strapi.log.info(`Updated traffic-incident ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating traffic-incident in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove traffic-incident from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('traffic-incident', result.documentId || result.id);
      strapi.log.info(`Removed traffic-incident ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing traffic-incident from Algolia:', error);
    }
  },
};