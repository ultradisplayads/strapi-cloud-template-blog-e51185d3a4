'use strict';

/**
 * Currency converter routes with real-time exchange rates
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/currency-converter/rates',
      handler: 'enhanced-currency-converter.getRates',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/convert',
      handler: 'enhanced-currency-converter.convert',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/currencies',
      handler: 'enhanced-currency-converter.getCurrencies',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/trending',
      handler: 'enhanced-currency-converter.getTrending',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/history',
      handler: 'enhanced-currency-converter.getHistory',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/settings',
      handler: 'enhanced-currency-converter.getSettings',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};