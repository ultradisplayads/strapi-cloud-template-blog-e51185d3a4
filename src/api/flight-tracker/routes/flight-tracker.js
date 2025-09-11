'use strict';

/**
 * flight-tracker router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/flight-tracker/flights/:airport',
      handler: 'flight-tracker.getLiveFlights',
      config: {
        auth: false,
        description: 'Get live flights for a specific airport',
        tags: ['Flight Tracker']
      }
    },
    {
      method: 'GET',
      path: '/flight-tracker/airports',
      handler: 'flight-tracker.getAllAirports',
      config: {
        auth: false,
        description: 'Get list of all supported airports with details',
        tags: ['Flight Tracker']
      }
    },
    {
      method: 'GET',
      path: '/flight-tracker/status',
      handler: 'flight-tracker.getStatus',
      config: {
        auth: false,
        description: 'Get flight tracker service status and statistics',
        tags: ['Flight Tracker']
      }
    },
    {
      method: 'GET',
      path: '/flight-tracker/cached',
      handler: 'flight-tracker.getCachedFlights',
      config: {
        auth: false,
        description: 'Get cached flight data from database',
        tags: ['Flight Tracker']
      }
    }
  ]
};
