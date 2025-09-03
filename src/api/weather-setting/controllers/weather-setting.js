'use strict';

/**
 * weather-setting controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::weather-setting.weather-setting');
