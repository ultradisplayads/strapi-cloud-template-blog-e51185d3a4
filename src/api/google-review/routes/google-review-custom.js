'use strict';

/**
 * google-review custom routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/google-reviews/latest',
      handler: 'google-review.latest',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/google-reviews/business/:businessId',
      handler: 'google-review.byBusiness',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/google-reviews/stats',
      handler: 'google-review.stats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/reviews/latest',
      handler: 'google-review.latest',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/reviews/stats',
      handler: 'google-review.stats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
