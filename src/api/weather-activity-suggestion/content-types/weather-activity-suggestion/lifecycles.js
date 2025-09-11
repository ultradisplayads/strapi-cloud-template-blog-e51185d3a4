const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new weather-activity-suggestion in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('weather-activity-suggestion', result);
      strapi.log.info(`Indexed new weather-activity-suggestion ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing weather-activity-suggestion in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated weather-activity-suggestion in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('weather-activity-suggestion', result);
      strapi.log.info(`Updated weather-activity-suggestion ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating weather-activity-suggestion in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove weather-activity-suggestion from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('weather-activity-suggestion', result.documentId || result.id);
      strapi.log.info(`Removed weather-activity-suggestion ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing weather-activity-suggestion from Algolia:', error);
    }
  },
};