'use strict';

/**
 * flight-tracker controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const AviationStackService = require('../../../../scripts/aviationstack-service');

module.exports = createCoreController('api::flight-tracker.flight-tracker', ({ strapi }) => ({
  
  // Get live flight data for specific airport
  async getLiveFlights(ctx) {
    const { airport } = ctx.params;
    const { type = 'both', limit = 50, status } = ctx.query;
    
    const validAirports = ['BKK', 'DMK', 'UTP'];
    if (!validAirports.includes(airport.toUpperCase())) {
      return ctx.badRequest(`Invalid airport code. Supported: ${validAirports.join(', ')}`);
    }

    try {
      const aviationService = new AviationStackService();
      const flights = await aviationService.getFlightData(airport.toUpperCase(), type, parseInt(limit));
      
      // Filter by status if provided
      let filteredFlights = flights;
      if (status) {
        filteredFlights = flights.filter(flight => flight.FlightStatus === status);
      }

      // Sort by priority and scheduled time
      filteredFlights.sort((a, b) => {
        if (a.Priority !== b.Priority) {
          return a.Priority - b.Priority;
        }
        return new Date(a.ScheduledTime) - new Date(b.ScheduledTime);
      });

      return ctx.send({
        data: filteredFlights,
        meta: {
          airport: airport.toUpperCase(),
          type,
          total: filteredFlights.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      ctx.throw(500, `Failed to fetch flight data: ${error.message}`);
    }
  },

  // Get arrivals for specific airport
  async getArrivals(ctx) {
    const { airport } = ctx.params;
    const { limit = 25 } = ctx.query;
    
    try {
      const aviationService = new AviationStackService();
      const flights = await aviationService.getFlightData(airport.toUpperCase(), 'arrivals', parseInt(limit));
      
      return ctx.send({
        data: flights.sort((a, b) => new Date(a.ScheduledTime) - new Date(b.ScheduledTime)),
        meta: {
          airport: airport.toUpperCase(),
          type: 'arrivals',
          total: flights.length
        }
      });
    } catch (error) {
      ctx.throw(500, `Failed to fetch arrivals: ${error.message}`);
    }
  },

  // Get departures for specific airport
  async getDepartures(ctx) {
    const { airport } = ctx.params;
    const { limit = 25 } = ctx.query;
    
    try {
      const aviationService = new AviationStackService();
      const flights = await aviationService.getFlightData(airport.toUpperCase(), 'departures', parseInt(limit));
      
      return ctx.send({
        data: flights.sort((a, b) => new Date(a.ScheduledTime) - new Date(b.ScheduledTime)),
        meta: {
          airport: airport.toUpperCase(),
          type: 'departures',
          total: flights.length
        }
      });
    } catch (error) {
      ctx.throw(500, `Failed to fetch departures: ${error.message}`);
    }
  },

  // Get all airports data
  async getAllAirports(ctx) {
    const { limit = 30 } = ctx.query;
    
    try {
      const aviationService = new AviationStackService();
      const allData = await aviationService.getAllAirportsData(parseInt(limit));
      
      const summary = {
        BKK: { flights: allData.BKK?.length || 0, airport: 'Suvarnabhumi Airport' },
        DMK: { flights: allData.DMK?.length || 0, airport: 'Don Mueang International' },
        UTP: { flights: allData.UTP?.length || 0, airport: 'U-Tapao International' }
      };

      return ctx.send({
        data: allData,
        meta: {
          summary,
          totalFlights: Object.values(allData).flat().length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      ctx.throw(500, `Failed to fetch all airports data: ${error.message}`);
    }
  },

  // Sync flight data to database
  async syncFlightData(ctx) {
    const { airport } = ctx.params;
    const { limit = 50 } = ctx.query;
    
    try {
      const aviationService = new AviationStackService();
      const flights = await aviationService.getFlightData(airport.toUpperCase(), 'both', parseInt(limit));
      
      let created = 0;
      let updated = 0;
      
      for (const flightData of flights) {
        try {
          // Check if flight already exists
          const existing = await strapi.entityService.findMany('api::flight-tracker.flight-tracker', {
            filters: {
              FlightNumber: flightData.FlightNumber,
              FlightDate: flightData.FlightDate,
              Airport: flightData.Airport,
              FlightType: flightData.FlightType
            },
            limit: 1
          });

          if (existing.length > 0) {
            // Update existing flight
            await strapi.entityService.update('api::flight-tracker.flight-tracker', existing[0].id, {
              data: flightData
            });
            updated++;
          } else {
            // Create new flight record
            await strapi.entityService.create('api::flight-tracker.flight-tracker', {
              data: flightData
            });
            created++;
          }
        } catch (error) {
          console.error(`Failed to sync flight ${flightData.FlightNumber}:`, error.message);
        }
      }

      return ctx.send({
        success: true,
        message: `Synced flight data for ${airport.toUpperCase()}`,
        data: {
          created,
          updated,
          total: created + updated,
          airport: airport.toUpperCase()
        }
      });
    } catch (error) {
      ctx.throw(500, `Failed to sync flight data: ${error.message}`);
    }
  },

  // Get flight tracker status
  async getStatus(ctx) {
    try {
      const aviationService = new AviationStackService();
      const connectionTest = await aviationService.testConnection();
      
      // Get database stats
      const totalFlights = await strapi.entityService.count('api::flight-tracker.flight-tracker');
      const activeFlights = await strapi.entityService.count('api::flight-tracker.flight-tracker', {
        filters: { IsActive: true }
      });

      return ctx.send({
        success: true,
        data: {
          apiConnection: connectionTest,
          database: {
            totalFlights,
            activeFlights,
            lastSync: new Date().toISOString()
          },
          supportedAirports: aviationService.getSupportedAirports()
        }
      });
    } catch (error) {
      ctx.throw(500, `Failed to get status: ${error.message}`);
    }
  },

  // Get cached flight data from database
  async getCachedFlights(ctx) {
    const { airport, type, status, limit = 50 } = ctx.query;
    
    try {
      const filters = { IsActive: true };
      
      if (airport) {
        filters.Airport = airport.toUpperCase();
      }
      
      if (type && type !== 'both') {
        filters.FlightType = type === 'arrivals' ? 'arrival' : 'departure';
      }
      
      if (status) {
        filters.FlightStatus = status;
      }

      const flights = await strapi.entityService.findMany('api::flight-tracker.flight-tracker', {
        filters,
        sort: { Priority: 'asc', ScheduledTime: 'asc' },
        limit: parseInt(limit)
      });

      return ctx.send({
        data: flights,
        meta: {
          airport: airport ? airport.toUpperCase() : 'all',
          type: type || 'both',
          total: flights.length,
          source: 'database'
        }
      });
    } catch (error) {
      ctx.throw(500, `Failed to fetch cached flights: ${error.message}`);
    }
  }
}));
