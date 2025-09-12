'use strict';

/**
 * social-post router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

//@ts-ignore
module.exports = createCoreRouter('api::social-posts.social-post');
