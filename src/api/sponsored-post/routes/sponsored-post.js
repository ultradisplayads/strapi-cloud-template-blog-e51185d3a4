'use strict';

/**
 * sponsored-post router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const customRoutes = [
  {
    method: 'GET',
    path: '/sponsored-posts/active',
    handler: 'sponsored-post.active',
    config: {
      middlewares: [],
    }
  },
  {
    method: 'POST',
    path: '/sponsored-posts/:id/click',
    handler: 'sponsored-post.trackClick',
    config: {
      middlewares: [],
    }
  },
  {
    method: 'POST',
    path: '/sponsored-posts/:id/impression',
    handler: 'sponsored-post.trackImpression',
    config: {
      middlewares: [],
    }
  }
];

module.exports = {
  routes: customRoutes
};
