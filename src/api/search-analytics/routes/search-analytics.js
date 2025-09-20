module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/search-analytics/track',
      handler: 'search-analytics.track',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search-analytics/trending',
      handler: 'search-analytics.getTrending',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/search-analytics/calculate',
      handler: 'search-analytics.calculateTrending',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search-analytics/stats',
      handler: 'search-analytics.getStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search-analytics',
      handler: 'search-analytics.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/search-analytics/:id',
      handler: 'search-analytics.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/search-analytics/:id',
      handler: 'search-analytics.update',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/search-analytics/:id',
      handler: 'search-analytics.delete',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
