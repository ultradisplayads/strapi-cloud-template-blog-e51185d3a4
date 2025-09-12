'use strict';

/**
 * pinned-forum-thread service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore - Custom content type not recognized by TypeScript
module.exports = createCoreService('api::pinned-forum-thread.pinned-forum-thread');