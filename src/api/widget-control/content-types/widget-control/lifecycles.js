const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new widget-control in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('widget-control', result);
      strapi.log.info(`Indexed new widget-control ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing widget-control in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated widget-control in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('widget-control', result);
      strapi.log.info(`Updated widget-control ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating widget-control in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove widget-control from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('widget-control', result.documentId || result.id);
      strapi.log.info(`Removed widget-control ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing widget-control from Algolia:', error);
    }
  },
};