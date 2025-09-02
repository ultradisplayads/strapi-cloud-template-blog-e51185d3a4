'use strict';

/**
 * breaking-news router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::breaking-news.breaking-news', {
  config: {
    find: {
      middlewares: [],
    },
    findOne: {
      middlewares: [],
    },
  },
  only: ['find', 'findOne', 'create', 'update', 'delete'],
});
