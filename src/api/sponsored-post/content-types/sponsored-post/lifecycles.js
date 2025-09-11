const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new sponsored post in Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('sponsored-post', result);
      strapi.log.info(`Indexed new sponsored post ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing new sponsored post in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated sponsored post in Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('sponsored-post', result);
      strapi.log.info(`Updated sponsored post ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating sponsored post in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove deleted sponsored post from Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.deleteItem('sponsored-post', result.documentId);
      strapi.log.info(`Removed sponsored post ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing sponsored post from Algolia:', error);
    }
  }
};
