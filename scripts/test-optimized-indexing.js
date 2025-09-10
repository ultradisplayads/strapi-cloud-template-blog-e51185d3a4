require('dotenv').config();
const OptimizedAlgoliaService = require('./optimized-algolia-service');

async function testOptimizedIndexing() {
  console.log('🚀 Starting optimized Algolia indexing test...');
  
  try {
    const algoliaService = new OptimizedAlgoliaService();
    
    // Configure the unified index
    console.log('🔧 Configuring unified index...');
    await algoliaService.configureIndex();
    
    // Index all content types to unified index
    console.log('📚 Indexing all content to unified index...');
    const totalIndexed = await algoliaService.indexAllContent();
    
    console.log(`✅ Successfully indexed ${totalIndexed} total items`);
    
    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    
    // Test general search
    const searchResults = await algoliaService.search('news', { limit: 5 });
    console.log(`   📊 General search for "news": ${searchResults.nbHits} results`);
    
    // Test content-type specific search
    const breakingNewsResults = await algoliaService.search('', { 
      contentType: 'breaking-news',
      limit: 3 
    });
    console.log(`   📰 Breaking news search: ${breakingNewsResults.nbHits} results`);
    
    // Test suggestions
    const suggestions = await algoliaService.getSuggestions('news', { limit: 3 });
    console.log(`   💡 Suggestions for "news": ${suggestions.length} items`);
    
    // Test facets
    const facets = await algoliaService.getFacets();
    console.log(`   🏷️  Available facets:`, Object.keys(facets));
    
    console.log('\n✅ Optimized indexing test completed successfully!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testOptimizedIndexing();
