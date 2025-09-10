const ComprehensiveAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    // Index new photo-gallery in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('photo-gallery', result);
      strapi.log.info(`Indexed new photo-gallery ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing photo-gallery in Algolia:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    // Index updated photo-gallery in Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.indexSingleItem('photo-gallery', result);
      strapi.log.info(`Updated photo-gallery ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating photo-gallery in Algolia:', error);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove photo-gallery from Algolia
    try {
      const algoliaService = new ComprehensiveAlgoliaService();
      await algoliaService.deleteItem('photo-gallery', result.documentId || result.id);
      strapi.log.info(`Removed photo-gallery ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing photo-gallery from Algolia:', error);
    }
  },
};