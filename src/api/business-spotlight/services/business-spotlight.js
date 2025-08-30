'use strict';

/**
 * business-spotlight service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::business-spotlight.business-spotlight');
