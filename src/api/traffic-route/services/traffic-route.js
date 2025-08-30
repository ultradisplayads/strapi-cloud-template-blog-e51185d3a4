'use strict';

/**
 * traffic-route service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::traffic-route.traffic-route');
