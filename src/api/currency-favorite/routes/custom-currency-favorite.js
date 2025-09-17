'use strict';

/**
 * Custom currency-favorite routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/currency-favorites/user',
      handler: 'currency-favorite.getUserFavorites',
      config: {
        auth: {
          scope: ['find', 'findOne', 'create', 'update', 'delete']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/currency-favorites/add',
      handler: 'currency-favorite.addToFavorites',
      config: {
        auth: {
          scope: ['find', 'findOne', 'create', 'update', 'delete']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/currency-favorites/remove/:currencyCode',
      handler: 'currency-favorite.removeFromFavorites',
      config: {
        auth: {
          scope: ['find', 'findOne', 'create', 'update', 'delete']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/currency-favorites/sort',
      handler: 'currency-favorite.updateSortOrder',
      config: {
        auth: {
          scope: ['find', 'findOne', 'create', 'update', 'delete']
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
