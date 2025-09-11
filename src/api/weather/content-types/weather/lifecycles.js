const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new weather in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('weather', result);
      strapi.log.info(`Indexed new weather ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing weather in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated weather in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('weather', result);
      strapi.log.info(`Updated weather ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating weather in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove weather from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('weather', result.documentId || result.id);
      strapi.log.info(`Removed weather ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing weather from Algolia:', error);
    }
  },
};