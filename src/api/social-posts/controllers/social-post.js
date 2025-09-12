'use strict';

/**
 * social-post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

//@ts-ignore
module.exports = createCoreController('api::social-posts.social-post', ({ strapi }) => ({
  // Custom controller methods will be added here
}));
