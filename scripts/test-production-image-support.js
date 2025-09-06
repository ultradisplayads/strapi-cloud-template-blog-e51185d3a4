const axios = require('axios');

async function testProductionImageSupport() {
  console.log('🔍 Testing production image support...\n');
  
  try {
    // Test 1: Check if image fields exist in API response
    console.log('1. Checking API response structure...');
    const response = await axios.get('https://api.pattaya1.com/api/breaking-news/live');
    const firstItem = response.data.data[0];
    
    const hasImageField = 'image' in firstItem;
    const hasImageAltField = 'imageAlt' in firstItem;
    const hasImageCaptionField = 'imageCaption' in firstItem;
    
    console.log(`   ✅ image field: ${hasImageField ? '✓' : '✗'}`);
    console.log(`   ✅ imageAlt field: ${hasImageAltField ? '✓' : '✗'}`);
    console.log(`   ✅ imageCaptionField: ${hasImageCaptionField ? '✓' : '✗'}`);
    
    // Test 2: Check if any items have actual image data
    console.log('\n2. Checking for actual image data...');
    const itemsWithImages = response.data.data.filter(item => item.image && item.image !== null);
    console.log(`   📊 Items with images: ${itemsWithImages.length}/${response.data.data.length}`);
    
    if (itemsWithImages.length > 0) {
      console.log(`   🖼️  Sample image: ${itemsWithImages[0].image}`);
    }
    
    // Test 3: Check schema via direct API
    console.log('\n3. Checking breaking-news schema...');
    try {
      const schemaResponse = await axios.get('https://api.pattaya1.com/api/breaking-news-plural');
      console.log(`   📊 Total articles: ${schemaResponse.data.data.length}`);
      
      if (schemaResponse.data.data.length > 0) {
        const sampleItem = schemaResponse.data.data[0];
        const hasSchemaImageFields = 'FeaturedImage' in sampleItem.attributes;
        console.log(`   ✅ FeaturedImage in schema: ${hasSchemaImageFields ? '✓' : '✗'}`);
      }
    } catch (schemaError) {
      console.log(`   ❌ Schema check failed: ${schemaError.message}`);
    }
    
    console.log('\n📋 Summary:');
    if (hasImageField && hasImageAltField && hasImageCaptionField) {
      console.log('✅ Production API supports image fields');
      if (itemsWithImages.length > 0) {
        console.log('✅ Production has articles with images');
      } else {
        console.log('⚠️  No articles with images found (may need scheduler update)');
      }
    } else {
      console.log('❌ Production API missing image field support');
      console.log('   → Need to update controller in production');
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

testProductionImageSupport();
