'use strict';

/**
 * trusted-channel service
 */

const { createCoreService } = require('@strapi/strapi').factories;

//@ts-ignore
module.exports = createCoreService('api::trusted-channels.trusted-channel', ({ strapi }) => ({
  // Custom service methods will be added here
}));
