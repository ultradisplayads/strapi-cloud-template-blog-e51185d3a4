'use strict';

/**
 * Custom flight-tracker routes
 */

module.exports = {
  routes: [
    // Live flight data endpoints
    {
      method: 'GET',
      path: '/flight-tracker/live/:airport',
      handler: 'flight-tracker.getLiveFlights',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/flight-tracker/:airport/arrivals',
      handler: 'flight-tracker.getArrivals',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/flight-tracker/:airport/departures',
      handler: 'flight-tracker.getDepartures',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/flight-tracker/airports/all',
      handler: 'flight-tracker.getAllAirports',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/flight-tracker/sync/:airport',
      handler: 'flight-tracker.syncFlightData',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/flight-tracker/status',
      handler: 'flight-tracker.getStatus',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/flight-tracker/cached/:airport',
      handler: 'flight-tracker.getCachedFlights',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    }
  ]
};
