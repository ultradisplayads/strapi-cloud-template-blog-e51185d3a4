#!/usr/bin/env node

/**
 * Test script to verify photo gallery overlay schema changes
 * This script tests the new overlay text fields in the photo-gallery collection
 */

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

async function testPhotoOverlaySchema() {
  try {
    console.log('🧪 Testing Photo Gallery Overlay Schema...\n');

    // Test 1: Check if the collection type has the new fields
    console.log('1. Checking collection type schema...');
    
    const headers = API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {};
    
    // Try to fetch the collection type info
    try {
      const response = await axios.get(`${STRAPI_URL}/api/content-type-builder/content-types/api::photo-gallery.photo-gallery`, {
        headers
      });
      
      const schema = response.data.data.schema;
      const attributes = schema.attributes;
      
      console.log('✅ Collection type found');
      
      // Check for new overlay fields
      const overlayFields = [
        'overlay_text',
        'overlay_position', 
        'overlay_text_color',
        'overlay_background_color',
        'overlay_font_size',
        'sponsor_url'
      ];
      
      let allFieldsPresent = true;
      overlayFields.forEach(field => {
        if (attributes[field]) {
          console.log(`✅ Field '${field}' found:`, attributes[field].type);
        } else {
          console.log(`❌ Field '${field}' missing`);
          allFieldsPresent = false;
        }
      });
      
      if (allFieldsPresent) {
        console.log('✅ All overlay fields are present in the schema\n');
      } else {
        console.log('❌ Some overlay fields are missing from the schema\n');
        return;
      }
      
    } catch (error) {
      console.log('❌ Could not fetch collection type schema:', error.message);
      console.log('This might be because Strapi is not running or the API is not accessible\n');
      return;
    }

    // Test 2: Try to create a test photo with overlay data
    console.log('2. Testing photo creation with overlay data...');
    
    const testPhotoData = {
      data: {
        Title: "Test Photo with Overlay",
        Author: "Test Author",
        Location: "Pattaya Beach",
        Category: "Landscape",
        Description: "A test photo to verify overlay functionality",
        overlay_text: "Exclusive Deal! 50% Off Today!",
        overlay_position: "Bottom-Right",
        overlay_text_color: "#FFFFFF",
        overlay_background_color: "rgba(255,0,0,0.8)",
        overlay_font_size: 1.5,
        sponsor_url: "https://example.com/deal",
        IsActive: true,
        Featured: false,
        Likes: 0,
        Comments: 0,
        Views: 0,
        TimeAgo: "1 hour ago",
        LastUpdated: new Date().toISOString()
      }
    };

    try {
      const createResponse = await axios.post(`${STRAPI_URL}/api/photo-galleries`, testPhotoData, {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Test photo created successfully');
      console.log('   Photo ID:', createResponse.data.data.id);
      console.log('   Overlay Text:', createResponse.data.data.attributes.overlay_text);
      console.log('   Overlay Position:', createResponse.data.data.attributes.overlay_position);
      console.log('   Sponsor URL:', createResponse.data.data.attributes.sponsor_url);
      
      // Clean up - delete the test photo
      const photoId = createResponse.data.data.id;
      await axios.delete(`${STRAPI_URL}/api/photo-galleries/${photoId}`, { headers });
      console.log('✅ Test photo cleaned up\n');
      
    } catch (error) {
      console.log('❌ Could not create test photo:', error.response?.data?.error?.message || error.message);
      console.log('This might be because the collection is not published or there are validation errors\n');
    }

    // Test 3: Test fetching photos with overlay data
    console.log('3. Testing photo retrieval with overlay data...');
    
    try {
      const fetchResponse = await axios.get(`${STRAPI_URL}/api/photo-galleries?populate=*`, { headers });
      
      if (fetchResponse.data.data && fetchResponse.data.data.length > 0) {
        console.log('✅ Photos fetched successfully');
        console.log(`   Found ${fetchResponse.data.data.length} photos`);
        
        // Check if any photos have overlay data
        const photosWithOverlay = fetchResponse.data.data.filter(photo => 
          photo.attributes.overlay_text
        );
        
        if (photosWithOverlay.length > 0) {
          console.log(`   ${photosWithOverlay.length} photos have overlay text`);
          photosWithOverlay.forEach(photo => {
            console.log(`   - "${photo.attributes.Title}": "${photo.attributes.overlay_text}"`);
          });
        } else {
          console.log('   No photos currently have overlay text');
        }
      } else {
        console.log('ℹ️  No photos found in the collection');
      }
      
    } catch (error) {
      console.log('❌ Could not fetch photos:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 Photo Gallery Overlay Schema Test Complete!');
    console.log('\nNext steps:');
    console.log('1. Restart your Strapi backend to apply schema changes');
    console.log('2. Go to Strapi admin panel and edit a photo to add overlay text');
    console.log('3. Test the frontend widget to see overlay text in action');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPhotoOverlaySchema();
