'use strict';

/**
 * Currency converter routes with real-time exchange rates
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/currency-converter/rates',
      handler: 'currency-converter.getRates',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/convert',
      handler: 'currency-converter.convert',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/currencies',
      handler: 'currency-converter.getCurrencies',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/history',
      handler: 'currency-converter.getHistory',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/currency-converter/settings',
      handler: 'currency-converter.getSettings',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};