'use strict';

/**
 * forum-activity service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::forum-activity.forum-activity');
