'use strict';

/**
 * pinned-forum-thread router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// @ts-ignore - Custom content type not recognized by TypeScript
module.exports = createCoreRouter('api::pinned-forum-thread.pinned-forum-thread');