'use strict';

/**
 * pinned-forum-thread controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore - Custom content type not recognized by TypeScript
module.exports = createCoreController('api::pinned-forum-thread.pinned-forum-thread');
