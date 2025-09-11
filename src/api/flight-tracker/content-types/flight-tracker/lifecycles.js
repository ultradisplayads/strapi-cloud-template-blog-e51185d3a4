'use strict';

/**
 * flight-tracker lifecycles
 */

const OptimizedAlgoliaService = require('../../../../../scripts/optimized-algolia-service');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    try {
      // Index the new flight tracker data in Algolia
      await OptimizedAlgoliaService.addItem({
        objectID: `flight-tracker-${result.id}`,
        id: result.id,
        type: 'flight-tracker',
        flightNumber: result.FlightNumber,
        airline: result.Airline,
        flightStatus: result.FlightStatus,
        flightType: result.FlightType,
        airport: result.Airport,
        airportName: result.AirportName,
        originAirport: result.OriginAirport,
        destinationAirport: result.DestinationAirport,
        scheduledTime: result.ScheduledTime,
        estimatedTime: result.EstimatedTime,
        actualTime: result.ActualTime,
        terminal: result.Terminal,
        gate: result.Gate,
        flightDate: result.FlightDate,
        priority: result.Priority,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      });
      
      console.log(`✅ Flight tracker "${result.FlightNumber}" indexed in Algolia`);
    } catch (error) {
      console.error('❌ Failed to index flight tracker in Algolia:', error.message);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    try {
      // Update the flight tracker data in Algolia
      await OptimizedAlgoliaService.updateItem({
        objectID: `flight-tracker-${result.id}`,
        id: result.id,
        type: 'flight-tracker',
        flightNumber: result.FlightNumber,
        airline: result.Airline,
        flightStatus: result.FlightStatus,
        flightType: result.FlightType,
        airport: result.Airport,
        airportName: result.AirportName,
        originAirport: result.OriginAirport,
        destinationAirport: result.DestinationAirport,
        scheduledTime: result.ScheduledTime,
        estimatedTime: result.EstimatedTime,
        actualTime: result.ActualTime,
        terminal: result.Terminal,
        gate: result.Gate,
        flightDate: result.FlightDate,
        priority: result.Priority,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      });
      
      console.log(`✅ Flight tracker "${result.FlightNumber}" updated in Algolia`);
    } catch (error) {
      console.error('❌ Failed to update flight tracker in Algolia:', error.message);
    }
  },

  async afterDelete(event) {
    const { result } = event;
    
    try {
      // Remove the flight tracker data from Algolia
      await OptimizedAlgoliaService.removeItem(`flight-tracker-${result.id}`);
      
      console.log(`✅ Flight tracker "${result.FlightNumber}" removed from Algolia`);
    } catch (error) {
      console.error('❌ Failed to remove flight tracker from Algolia:', error.message);
    }
  }
};
