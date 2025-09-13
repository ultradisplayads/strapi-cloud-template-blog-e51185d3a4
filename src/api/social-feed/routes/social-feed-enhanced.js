'use strict';

/**
 * Enhanced social-feed router with new endpoints
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Existing routes
    {
      method: 'GET',
      path: '/social-feed/live',
      handler: 'social-feed.live',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/trending',
      handler: 'social-feed.trending',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/platform/:platform',
      handler: 'social-feed.byPlatform',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/search',
      handler: 'social-feed.search',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/social-feed/fetch-new',
      handler: 'social-feed.fetchNew',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/status',
      handler: 'social-feed.status',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/fetch-one',
      handler: 'social-feed.fetchOne',
      config: {
        auth: false,
      },
    },
    // New enhanced routes
    {
      method: 'GET',
      path: '/social-feed/enhanced',
      handler: 'social-feed.enhanced',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/categories',
      handler: 'social-feed.categories',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/trending-hashtags',
      handler: 'social-feed.trendingHashtags',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/business/:businessId',
      handler: 'social-feed.byBusiness',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/social-feed/aggregate',
      handler: 'social-feed.aggregate',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/social-feed/moderation-queue',
      handler: 'social-feed.moderationQueue',
      config: {
        auth: {
          scope: ['admin']
        },
      },
    },
    {
      method: 'POST',
      path: '/social-feed/moderate/:postId',
      handler: 'social-feed.moderate',
      config: {
        auth: {
          scope: ['admin']
        },
      },
    }
  ],
};
