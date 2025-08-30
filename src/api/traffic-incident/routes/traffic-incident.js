'use strict';

/**
 * traffic-incident router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreRouter('api::traffic-incident.traffic-incident');
