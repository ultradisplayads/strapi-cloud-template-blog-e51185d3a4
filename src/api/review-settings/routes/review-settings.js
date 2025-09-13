'use strict';

/**
 * review-settings router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/review-settings',
      handler: 'review-settings.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/review-settings',
      handler: 'review-settings.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/review-settings/platform-status',
      handler: 'review-settings.updatePlatformStatus',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/review-settings/stats',
      handler: 'review-settings.getStats',
      config: {
        auth: false,
      },
    }
  ],
};
