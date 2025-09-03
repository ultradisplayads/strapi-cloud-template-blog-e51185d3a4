'use strict';

/**
 * deal router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::deal.deal');

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
    method: 'POST',
    path: '/deals/:id/purchase',
    handler: 'deal.purchase',
    config: {
      auth: {
        scope: ['authenticated']
      }
    }
  },
  {
    method: 'POST',
    path: '/deals/:id/confirm-payment',
    handler: 'deal.confirmPayment',
    config: {
      auth: {
        scope: ['authenticated']
      }
    }
  },
  {
    method: 'POST',
    path: '/deals/webhook',
    handler: 'deal.handleWebhook',
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/deals/test-payment',
    handler: 'deal.testPayment',
    config: {
      auth: false
    }
  }
]);
