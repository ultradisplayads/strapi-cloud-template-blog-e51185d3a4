'use strict';

/**
 * sponsored-post router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::sponsored-post.sponsored-post', {
  config: {
    create: { auth: false },
    find: { auth: false },
    findOne: { auth: false },
    update: { auth: false },
    delete: { auth: false }
  }
});
