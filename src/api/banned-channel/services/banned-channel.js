'use strict';

/**
 * banned-channel service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::banned-channel.banned-channel');
