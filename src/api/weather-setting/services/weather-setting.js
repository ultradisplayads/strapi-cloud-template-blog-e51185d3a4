'use strict';

/**
 * weather-setting service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::weather-setting.weather-setting');
