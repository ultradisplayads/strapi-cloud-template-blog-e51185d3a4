'use strict';

/**
 * booking router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::booking.booking');

const customRouter = (innerRouter, extraRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes);
      return routes;
    },
  };
};

module.exports = customRouter(defaultRouter, [
  {
    method: 'GET',
    path: '/bookings/me',
    handler: 'booking.me',
    config: {
      auth: {
        scope: ['authenticated']
      }
    }
  },
  {
    method: 'POST',
    path: '/bookings/confirm',
    handler: 'booking.confirm',
    config: {
      auth: {
        scope: ['authenticated']
      }
    }
  },
  {
    method: 'GET',
    path: '/bookings/:id/calendar-event',
    handler: 'booking.calendarEvent',
    config: {
      auth: {
        scope: ['authenticated']
      }
    }
  },
  {
    method: 'POST',
    path: '/venue/redeem',
    handler: 'booking.redeem',
    config: {
      auth: {
        scope: ['authenticated']
      }
    }
  }
]);
