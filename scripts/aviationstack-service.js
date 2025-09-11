const axios = require('axios');

class AviationStackService {
  constructor() {
    this.apiKey = process.env.AVIATIONSTACK_API_KEY;
    this.baseUrl = 'http://api.aviationstack.com/v1';
    this.airports = {
      'BKK': { name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
      'DMK': { name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand' },
      'UTP': { name: 'U-Tapao International Airport', city: 'Pattaya', country: 'Thailand' }
    };
  }

  /**
   * Get live flight data for a specific airport
   */
  async getFlightData(airportCode, type = 'both', limit = 100) {
    if (!this.apiKey) {
      throw new Error('AviationStack API key not configured');
    }

    try {
      const requests = [];
      
      if (type === 'arrivals' || type === 'both') {
        requests.push(this.fetchFlights(airportCode, 'arrival', limit));
      }
      
      if (type === 'departures' || type === 'both') {
        requests.push(this.fetchFlights(airportCode, 'departure', limit));
      }

      const results = await Promise.allSettled(requests);
      const flights = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          flights.push(...result.value);
        } else {
          console.error(`Failed to fetch ${type} data:`, result.reason);
        }
      });

      return flights;
    } catch (error) {
      console.error('AviationStack API error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch flights for specific airport and type
   */
  async fetchFlights(airportCode, flightType, limit = 50) {
    const params = {
      access_key: this.apiKey,
      limit: limit,
      flight_status: 'active,scheduled,landed'
    };

    if (flightType === 'arrival') {
      params.arr_iata = airportCode;
    } else {
      params.dep_iata = airportCode;
    }

    const response = await axios.get(`${this.baseUrl}/flights`, { params });
    
    if (response.data.error) {
      throw new Error(`AviationStack API Error: ${response.data.error.message}`);
    }

    return this.transformFlightData(response.data.data, airportCode, flightType);
  }

  /**
   * Transform AviationStack data to our schema format
   */
  transformFlightData(flights, airportCode, flightType) {
    return flights.map(flight => {
      const departure = flight.departure || {};
      const arrival = flight.arrival || {};
      const airline = flight.airline || {};
      const flightInfo = flight.flight || {};

      // Determine scheduled, estimated, and actual times
      const isArrival = flightType === 'arrival';
      const relevantData = isArrival ? arrival : departure;
      
      return {
        FlightNumber: flightInfo.iata || flightInfo.icao || 'N/A',
        Airline: airline.name || 'Unknown',
        AirlineIATA: airline.iata,
        AirlineICAO: airline.icao,
        Aircraft: flight.aircraft?.registration || null,
        FlightStatus: this.mapFlightStatus(flight.flight_status),
        FlightType: flightType,
        Airport: airportCode,
        AirportName: this.airports[airportCode]?.name || airportCode,
        OriginAirport: departure.airport || 'Unknown',
        OriginAirportIATA: departure.iata,
        DestinationAirport: arrival.airport || 'Unknown',
        DestinationAirportIATA: arrival.iata,
        ScheduledTime: relevantData.scheduled ? new Date(relevantData.scheduled) : null,
        EstimatedTime: relevantData.estimated ? new Date(relevantData.estimated) : null,
        ActualTime: relevantData.actual ? new Date(relevantData.actual) : null,
        DelayMinutes: relevantData.delay || 0,
        Terminal: relevantData.terminal || null,
        Gate: relevantData.gate || null,
        Baggage: relevantData.baggage || null,
        FlightDate: flight.flight_date ? new Date(flight.flight_date) : new Date(),
        AviationStackData: flight, // Store raw data for reference
        LastUpdated: new Date(),
        IsActive: true,
        Priority: this.calculatePriority(flight.flight_status, relevantData)
      };
    });
  }

  /**
   * Map AviationStack flight status to our enum
   */
  mapFlightStatus(status) {
    const statusMap = {
      'scheduled': 'scheduled',
      'active': 'active',
      'landed': 'landed',
      'cancelled': 'cancelled',
      'incident': 'incident',
      'diverted': 'diverted'
    };
    return statusMap[status] || 'scheduled';
  }

  /**
   * Calculate display priority based on flight status and timing
   */
  calculatePriority(status, flightData) {
    if (status === 'active') return 1; // Highest priority for active flights
    if (status === 'landed' && flightData.actual) {
      const landedTime = new Date(flightData.actual);
      const now = new Date();
      const hoursSinceLanded = (now - landedTime) / (1000 * 60 * 60);
      if (hoursSinceLanded < 2) return 2; // Recent landings
    }
    if (status === 'scheduled') {
      const scheduledTime = new Date(flightData.scheduled);
      const now = new Date();
      const hoursUntilFlight = (scheduledTime - now) / (1000 * 60 * 60);
      if (hoursUntilFlight < 2) return 3; // Flights departing/arriving soon
    }
    return 5; // Default priority
  }

  /**
   * Get all supported airports
   */
  getSupportedAirports() {
    return this.airports;
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/flights`, {
        params: {
          access_key: this.apiKey,
          limit: 1
        }
      });
      
      return {
        success: true,
        message: 'AviationStack API connection successful',
        remainingCalls: response.data.pagination?.total || 'Unknown'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.response?.data || error
      };
    }
  }

  /**
   * Get flight data for all supported airports
   */
  async getAllAirportsData(limit = 50) {
    const results = {};
    
    for (const [code, info] of Object.entries(this.airports)) {
      try {
        console.log(`📡 Fetching flight data for ${code} (${info.name})...`);
        results[code] = await this.getFlightData(code, 'both', limit);
        console.log(`✅ Found ${results[code].length} flights for ${code}`);
      } catch (error) {
        console.error(`❌ Failed to fetch data for ${code}:`, error.message);
        results[code] = [];
      }
    }
    
    return results;
  }
}

module.exports = AviationStackService;
