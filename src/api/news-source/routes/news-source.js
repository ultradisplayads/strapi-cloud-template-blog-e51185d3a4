'use strict';

/**
 * news-source router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::news-source.news-source', {
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
