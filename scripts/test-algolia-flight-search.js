const algoliasearch = require('algoliasearch');

// Algolia configuration
const ALGOLIA_APP_ID = 'JLN45KZ8AZ';
const ALGOLIA_ADMIN_KEY = 'd7a9eecdea02e40550a0bce6cea26d02';
const INDEX_NAME = 'unified_search';

// Initialize Algolia client
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(INDEX_NAME);

async function testFlightSearch() {
  console.log('🛫 Testing Algolia Flight Search Integration...\n');

  try {
    // Test 1: Search for flight data
    console.log('1. Searching for flight data...');
    const searchResults = await index.search('flight', {
      filters: 'contentType:flight-tracker',
      hitsPerPage: 10
    });
    
    console.log(`Found ${searchResults.hits.length} flight records`);
    
    if (searchResults.hits.length > 0) {
      console.log('Sample flight record:');
      console.log(JSON.stringify(searchResults.hits[0], null, 2));
    }

    // Test 2: Search by airport code
    console.log('\n2. Searching by airport code (BKK)...');
    const airportResults = await index.search('BKK', {
      filters: 'contentType:flight-tracker',
      hitsPerPage: 5
    });
    
    console.log(`Found ${airportResults.hits.length} BKK flights`);

    // Test 3: Search by airline
    console.log('\n3. Searching by airline...');
    const airlineResults = await index.search('Thai', {
      filters: 'contentType:flight-tracker',
      hitsPerPage: 5
    });
    
    console.log(`Found ${airlineResults.hits.length} Thai airline flights`);

    // Test 4: Get index statistics
    console.log('\n4. Index statistics...');
    const stats = await index.getSettings();
    console.log('Index settings:', {
      searchableAttributes: stats.searchableAttributes,
      attributesForFaceting: stats.attributesForFaceting
    });

    console.log('\n✅ Flight search testing complete!');

  } catch (error) {
    console.error('❌ Flight search test failed:', error.message);
  }
}

// Manual indexing function for testing
async function manualIndexFlightData() {
  console.log('📝 Manually indexing sample flight data...\n');

  const sampleFlightData = [
    {
      objectID: 'flight-test-1',
      contentType: 'flight-tracker',
      title: 'TG 123 - Bangkok to Phuket',
      content: 'Thai Airways flight from BKK to HKT',
      flightNumber: 'TG123',
      airline: 'Thai Airways',
      departure: 'BKK',
      arrival: 'HKT',
      status: 'On Time'
    },
    {
      objectID: 'flight-test-2', 
      contentType: 'flight-tracker',
      title: 'WE 456 - Bangkok to Udon Thani',
      content: 'Thai Smile flight from BKK to UTP',
      flightNumber: 'WE456',
      airline: 'Thai Smile',
      departure: 'BKK',
      arrival: 'UTP',
      status: 'Delayed'
    }
  ];

  try {
    await index.saveObjects(sampleFlightData);
    console.log('✅ Sample flight data indexed successfully!');
  } catch (error) {
    console.error('❌ Manual indexing failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await manualIndexFlightData();
  await testFlightSearch();
}

runTests();
