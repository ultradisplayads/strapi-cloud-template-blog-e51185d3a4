'use strict';

/**
 * trusted-channel router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

//@ts-ignore
module.exports = createCoreRouter('api::trusted-channels.trusted-channel');
