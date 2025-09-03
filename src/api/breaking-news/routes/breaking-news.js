'use strict';

/**
 * breaking-news router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::breaking-news.breaking-news', {
  config: {
    create: {
      auth: false,
    },
    update: {
      auth: false,
    },
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
    delete: {
      auth: false,
    },
  },
});
