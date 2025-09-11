const axios = require('axios');

// AviationStack API configuration
const API_KEY = process.env.AVIATIONSTACK_API_KEY || 'your-api-key-here';
const BASE_URL = 'http://api.aviationstack.com/v1';

// Thai airports to test
const AIRPORTS = ['BKK', 'DMK', 'UTP'];

async function testAviationStackAPI() {
  console.log('✈️ Testing AviationStack API Integration...\n');

  for (const airport of AIRPORTS) {
    console.log(`Testing ${airport} airport...`);
    
    try {
      // Test departures
      const departuresResponse = await axios.get(`${BASE_URL}/flights`, {
        params: {
          access_key: API_KEY,
          dep_iata: airport,
          limit: 5
        }
      });

      console.log(`✅ ${airport} Departures: ${departuresResponse.data.data?.length || 0} flights`);

      // Test arrivals
      const arrivalsResponse = await axios.get(`${BASE_URL}/flights`, {
        params: {
          access_key: API_KEY,
          arr_iata: airport,
          limit: 5
        }
      });

      console.log(`✅ ${airport} Arrivals: ${arrivalsResponse.data.data?.length || 0} flights`);

      // Show sample flight data
      if (departuresResponse.data.data?.length > 0) {
        const sampleFlight = departuresResponse.data.data[0];
        console.log(`Sample flight from ${airport}:`, {
          flight: sampleFlight.flight?.iata,
          airline: sampleFlight.airline?.name,
          destination: sampleFlight.arrival?.iata,
          status: sampleFlight.flight_status
        });
      }

    } catch (error) {
      console.log(`❌ ${airport} API test failed:`, error.response?.data?.error || error.message);
    }

    console.log('---');
  }

  console.log('🏁 AviationStack API testing complete!');
}

testAviationStackAPI();
