const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new social-media-post in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('social-media-post', result);
      strapi.log.info(`Indexed new social-media-post ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing social-media-post in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated social-media-post in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('social-media-post', result);
      strapi.log.info(`Updated social-media-post ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating social-media-post in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove social-media-post from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('social-media-post', result.documentId || result.id);
      strapi.log.info(`Removed social-media-post ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing social-media-post from Algolia:', error);
    }
  },
};