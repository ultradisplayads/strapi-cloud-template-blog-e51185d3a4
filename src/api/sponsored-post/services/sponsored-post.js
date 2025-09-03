'use strict';

/**
 * sponsored-post service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sponsored-post.sponsored-post', ({ strapi }) => ({
  async getActiveSponsored(position = null) {
    try {
      const now = new Date();
      const filters = {
        IsActive: true,
        $or: [
          { CampaignStartDate: { $null: true } },
          { CampaignStartDate: { $lte: now } }
        ],
        $and: [
          {
            $or: [
              { CampaignEndDate: { $null: true } },
              { CampaignEndDate: { $gte: now } }
            ]
          }
        ]
      };

      if (position) {
        filters.DisplayPosition = position;
      }

      const posts = await strapi.entityService.findMany('api::sponsored-post.sponsored-post', {
        filters,
        sort: ['Priority:desc', 'createdAt:desc'],
        populate: ['SponsorLogo', 'Image']
      });

      return posts;
    } catch (error) {
      strapi.log.error('Failed to get active sponsored posts:', error.message);
      return [];
    }
  },

  async insertIntoFeed(articles, position = 3) {
    try {
      const sponsoredPosts = await this.getActiveSponsored('position-3');
      
      if (sponsoredPosts.length === 0) {
        return articles;
      }

      const sponsored = sponsoredPosts[0];
      const modifiedArticles = [...articles];

      // Insert sponsored post at specified position
      if (modifiedArticles.length >= position) {
        modifiedArticles.splice(position - 1, 0, {
          ...sponsored,
          isSponsored: true,
          type: 'sponsored'
        });
      }

      return modifiedArticles;
    } catch (error) {
      strapi.log.error('Failed to insert sponsored content:', error.message);
      return articles;
    }
  }
}));
