'use strict';

/**
 * weather-cache controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::weather-cache.weather-cache');
