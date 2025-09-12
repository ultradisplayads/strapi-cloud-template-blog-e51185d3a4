'use strict';

/**
 * trusted-channel controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

//@ts-ignore
module.exports = createCoreController('api::trusted-channels.trusted-channel', ({ strapi }) => ({
  // Custom controller methods will be added here
}));
