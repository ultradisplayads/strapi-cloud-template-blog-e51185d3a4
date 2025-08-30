'use strict';

/**
 * traffic-incident controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController('api::traffic-incident.traffic-incident');
