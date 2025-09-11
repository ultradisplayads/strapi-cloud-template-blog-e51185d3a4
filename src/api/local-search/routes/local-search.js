module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/local-search',
      handler: 'local-search.search',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/local-search/suggestions',
      handler: 'local-search.suggestions',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/local-search/content-types',
      handler: 'local-search.contentTypes',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/local-search/reindex',
      handler: 'local-search.reindex',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/local-search/stats',
      handler: 'local-search.stats',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
