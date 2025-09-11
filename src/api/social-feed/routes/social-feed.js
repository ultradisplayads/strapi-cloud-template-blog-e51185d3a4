'use strict';

/**
 * social-feed router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// Custom routes for social feed
module.exports = {
  routes: [
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
  ],
};
