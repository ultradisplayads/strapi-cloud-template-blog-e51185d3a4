'use strict';

/**
 * weather-cache router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::weather-cache.weather-cache');
