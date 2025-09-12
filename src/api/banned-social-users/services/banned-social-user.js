'use strict';

/**
 * banned-social-user service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::banned-social-users.banned-social-user', ({ strapi }) => ({
  // Custom service methods will be added here
}));
