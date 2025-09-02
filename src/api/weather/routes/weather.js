'use strict';

/**
 * Enhanced weather routes with geolocation support for Strapi v5
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/weather/current',
      handler: 'weather.getCurrent',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/weather/settings',
      handler: 'weather.getSettings',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/weather/suggestions',
      handler: 'weather.getSuggestions',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};
