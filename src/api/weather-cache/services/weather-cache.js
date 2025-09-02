'use strict';

/**
 * weather-cache service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::weather-cache.weather-cache');
