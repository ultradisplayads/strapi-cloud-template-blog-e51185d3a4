'use strict';

/**
 * social-post service
 */

const { createCoreService } = require('@strapi/strapi').factories;


//@ts-ignore
module.exports = createCoreService('api::social-posts.social-post', ({ strapi }) => ({
  // Custom service methods will be added here
}));
