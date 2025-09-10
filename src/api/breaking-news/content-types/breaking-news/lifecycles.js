const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;
    
    // Index updated breaking news in Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('breaking-news', result);
      strapi.log.info(`Updated breaking news ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error updating breaking news in Algolia:', error);
    }
    
    // Only proceed if this is actually being marked as sponsored for the first time
    if (result.SponsoredPost && result.sponsorName && params.data.SponsoredPost === true) {
      try {
        // Check if a sponsored post already exists for this breaking news item
        const existingSponsoredPost = await strapi.entityService.findMany('api::sponsored-post.sponsored-post', {
          filters: {
            $or: [
              { SourceBreakingNewsId: { $eq: result.id } },
              { 
                $and: [
                  { Title: { $eq: result.Title } },
                  { SponsorName: { $eq: result.sponsorName } }
                ]
              }
            ]
          }
        });

        // Only create if one doesn't already exist
        if (!existingSponsoredPost || existingSponsoredPost.length === 0) {
          // Create corresponding sponsored post entry
          const sponsoredPostData = {
            Title: result.Title,
            Summary: result.Summary,
            SponsorName: result.sponsorName,
            SponsorLogo: null,
            TargetURL: result.URL,
            IsActive: true,
            Priority: 1,
            DisplayPosition: 'position-3',
            CampaignStartDate: new Date(),
            CampaignEndDate: null, // No end date by default
            ClickCount: 0,
            ImpressionCount: 0,
            Budget: 0,
            CostPerClick: 0,
            SourceBreakingNewsId: result.id, // Link back to breaking news
            publishedAt: new Date() // Publish immediately
          };

          const createdSponsoredPost = await strapi.entityService.create('api::sponsored-post.sponsored-post', {
            data: sponsoredPostData
          });

          strapi.log.info(`Auto-created sponsored post ${createdSponsoredPost.id} for breaking news ${result.id}`);
        }
      } catch (error) {
        strapi.log.error('Error auto-creating sponsored post:', error);
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;
    
    // Index new breaking news in Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.addItem('breaking-news', result);
      strapi.log.info(`Indexed new breaking news ${result.id} in Algolia search index`);
    } catch (error) {
      strapi.log.error('Error indexing new breaking news in Algolia:', error);
    }
    
    // Check if this new breaking news item is marked as sponsored
    if (result.SponsoredPost && result.sponsorName) {
      try {
        // Create corresponding sponsored post entry
        const sponsoredPostData = {
          Title: result.Title,
          Summary: result.Summary,
          SponsorName: result.sponsorName,
          SponsorLogo: result.sponsorLogo || null,
          TargetURL: result.URL,
          IsActive: true,
          Priority: 1,
          DisplayPosition: 'position-3',
          CampaignStartDate: new Date(),
          CampaignEndDate: null,
          ClickCount: 0,
          ImpressionCount: 0,
          Budget: 0,
          CostPerClick: 0,
          SourceBreakingNewsId: result.id,
          publishedAt: new Date()
        };

        const createdSponsoredPost = await strapi.entityService.create('api::sponsored-post.sponsored-post', {
          data: sponsoredPostData
        });

        strapi.log.info(`Auto-created sponsored post ${createdSponsoredPost.id} for new breaking news ${result.id}`);
      } catch (error) {
        strapi.log.error('Error auto-creating sponsored post:', error);
      }
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    // Remove deleted breaking news from Algolia
    try {
      const algoliaService = new OptimizedAlgoliaService();
      await algoliaService.deleteItem('breaking-news', result.documentId);
      strapi.log.info(`Removed breaking news ${result.id} from Algolia search index`);
    } catch (error) {
      strapi.log.error('Error removing breaking news from Algolia:', error);
    }
  }
};
