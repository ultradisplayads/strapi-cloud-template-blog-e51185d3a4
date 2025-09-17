'use strict';

/**
 * currency-favorite router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::currency-favorite.currency-favorite', {
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    findOne: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    create: {
      auth: {
        scope: ['find', 'findOne', 'create', 'update', 'delete']
      },
      policies: [],
      middlewares: [],
    },
    update: {
      auth: {
        scope: ['find', 'findOne', 'create', 'update', 'delete']
      },
      policies: [],
      middlewares: [],
    },
    delete: {
      auth: {
        scope: ['find', 'findOne', 'create', 'update', 'delete']
      },
      policies: [],
      middlewares: [],
    },
  },
});

