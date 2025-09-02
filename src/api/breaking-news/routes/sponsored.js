module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/breaking-news/widget-config/:id',
      handler: 'breaking-news.getWidgetConfig',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/breaking-news/widget-config/:id',
      handler: 'breaking-news.updateWidgetConfig',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
