'use strict';

/**
 * forum-activity router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// Custom routes for enhanced forum activity
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/forum-activity/enhanced',
      handler: 'forum-activity.getEnhanced',
      config: {
        auth: false,
      },
    },
  ],
};