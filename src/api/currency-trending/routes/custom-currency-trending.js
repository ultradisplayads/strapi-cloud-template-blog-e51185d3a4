'use strict';

/**
 * Custom currency-trending routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/currency-trending/trending',
      handler: 'currency-trending.getTrendingCurrencies',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/currency-trending/trend/:currencyCode',
      handler: 'currency-trending.getCurrencyTrend',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/currency-trending/update-data',
      handler: 'currency-trending.updateCurrencyData',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};


