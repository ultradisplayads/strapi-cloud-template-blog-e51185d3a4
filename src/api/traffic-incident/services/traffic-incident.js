'use strict';

/**
 * traffic-incident service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::traffic-incident.traffic-incident');
