const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new event-calendar in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('event-calendar', result);
      strapi.log.info(`Indexed new event-calendar ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing event-calendar in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated event-calendar in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('event-calendar', result);
      strapi.log.info(`Updated event-calendar ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating event-calendar in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove event-calendar from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('event-calendar', result.documentId || result.id);
      strapi.log.info(`Removed event-calendar ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing event-calendar from Algolia:', error);
    }
  },
};