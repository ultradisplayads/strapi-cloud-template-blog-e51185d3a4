module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/travel-widget/flight-search',
      handler: 'travel-widget.flightSearch',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/travel-widget/hotel-search',
      handler: 'travel-widget.hotelSearch',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/travel-widget/destinations',
      handler: 'travel-widget.destinations',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/travel-widget/config',
      handler: 'travel-widget.config',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/travel-widget/track',
      handler: 'travel-widget.trackEvent',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
