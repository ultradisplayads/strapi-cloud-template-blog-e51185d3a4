'use strict';

/**
 * content-safety-keyword service
 */

const { createCoreService } = require('@strapi/strapi').factories;

//@ts-ignore
module.exports = createCoreService('api::content-safety-keywords.content-safety-keyword', ({ strapi }) => ({
  // Custom service methods will be added here
}));
