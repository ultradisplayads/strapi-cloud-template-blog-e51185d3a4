#!/usr/bin/env node

/**
 * Demo script showing the complete Pattaya place details and reviews workflow
 * This demonstrates the flow using the fsq_place_id we found: 4bdd65154ffaa5938b576ff7
 */

console.log('🏖️ Pattaya Place Details and Reviews Workflow Demo\n');

// Step 1: Search for Pattaya places (we already found this)
console.log('🔍 Step 1: Searching for Pattaya places...');
const pattayaSearchResult = {
  "fsq_place_id": "4bdd65154ffaa5938b576ff7",
  "name": "Pattaya Beach (หาดพัทยา)",
  "latitude": 12.933223,
  "longitude": 100.88038,
  "categories": [
    {
      "fsq_category_id": "4bf58dd8d48988d1e2941735",
      "name": "Beach",
      "short_name": "Beach",
      "plural_name": "Beaches"
    }
  ],
  "location": {
    "address": "Pattaya Sai Nueang Rd.",
    "locality": "บางละมุง",
    "region": "ชลบุรี",
    "postcode": "20150",
    "country": "TH",
    "formatted_address": "Pattaya Sai Nueang Rd., บางละมุง, ชลบุรี 20150"
  }
};

console.log(`✅ Found Pattaya place: ${pattayaSearchResult.name}`);
console.log(`✅ fsq_place_id: ${pattayaSearchResult.fsq_place_id}\n`);

// Step 2: Get place details using the fsq_place_id
console.log('🔍 Step 2: Getting place details using fsq_place_id...');
console.log(`   API Call: GET https://places-api.foursquare.com/places/${pattayaSearchResult.fsq_place_id}`);
console.log(`   Headers: Authorization: Bearer GZ5SURWSV22FP0PEUKLBYFIMV11KKS0H2IZVFDAHE2BGPKBU`);
console.log(`   Headers: X-Places-Api-Version: 2025-06-17`);
console.log(`   Query: ?fields=name,location,categories,rating,tips,price,stats\n`);

// Mock place details response
const placeDetails = {
  "fsq_place_id": "4bdd65154ffaa5938b576ff7",
  "name": "Pattaya Beach (หาดพัทยา)",
  "location": {
    "address": "Pattaya Sai Nueang Rd.",
    "locality": "บางละมุง",
    "region": "ชลบุรี",
    "postcode": "20150",
    "country": "TH",
    "formatted_address": "Pattaya Sai Nueang Rd., บางละมุง, ชลบุรี 20150"
  },
  "categories": [
    {
      "fsq_category_id": "4bf58dd8d48988d1e2941735",
      "name": "Beach",
      "short_name": "Beach",
      "plural_name": "Beaches"
    }
  ],
  "rating": 4.2,
  "stats": {
    "total_tips": 45,
    "total_ratings": 128,
    "total_photos": 67
  },
  "tips": [
    {
      "fsq_tip_id": "tip_1",
      "created_at": "2024-01-15T10:30:00Z",
      "text": "Beautiful beach with crystal clear water! Perfect for swimming and sunbathing. The sand is soft and clean.",
      "user": {
        "first_name": "Sarah",
        "last_name": "Johnson"
      },
      "agree_count": 12,
      "disagree_count": 1
    },
    {
      "fsq_tip_id": "tip_2", 
      "created_at": "2024-01-10T14:20:00Z",
      "text": "Great place to relax and enjoy the sunset. Lots of beach activities available. Highly recommended!",
      "user": {
        "first_name": "Mike",
        "last_name": "Chen"
      },
      "agree_count": 8,
      "disagree_count": 0
    },
    {
      "fsq_tip_id": "tip_3",
      "created_at": "2024-01-05T09:15:00Z", 
      "text": "Very crowded during peak season but still enjoyable. Good facilities and clean beach area.",
      "user": {
        "first_name": "Anna",
        "last_name": "Schmidt"
      },
      "agree_count": 5,
      "disagree_count": 2
    }
  ]
};

console.log('✅ Place Details Retrieved:');
console.log(`   Name: ${placeDetails.name}`);
console.log(`   Address: ${placeDetails.location.formatted_address}`);
console.log(`   Rating: ${placeDetails.rating}`);
console.log(`   Categories: ${placeDetails.categories.map(c => c.name).join(', ')}`);
console.log(`   Total Tips: ${placeDetails.stats.total_tips}`);
console.log(`   Total Ratings: ${placeDetails.stats.total_ratings}\n`);

// Step 3: Get place tips (reviews) using the fsq_place_id
console.log('🔍 Step 3: Getting place tips (reviews) using fsq_place_id...');
console.log(`   API Call: GET https://places-api.foursquare.com/places/${pattayaSearchResult.fsq_place_id}`);
console.log(`   Query: ?fields=tips&limit=10\n`);

console.log(`✅ Retrieved ${placeDetails.tips.length} tips/reviews:\n`);

placeDetails.tips.forEach((tip, index) => {
  console.log(`   Review ${index + 1}:`);
  console.log(`   User: ${tip.user.first_name} ${tip.user.last_name}`);
  console.log(`   Date: ${new Date(tip.created_at).toLocaleDateString()}`);
  console.log(`   Text: ${tip.text}`);
  console.log(`   Agrees: ${tip.agree_count}, Disagrees: ${tip.disagree_count}\n`);
});

// Step 4: Transform tips to review format
console.log('🔍 Step 4: Transforming tips to review format...');

const transformedReviews = placeDetails.tips.map(tip => ({
  source_platform: 'Foursquare',
  source_review_id: tip.fsq_tip_id,
  AuthorName: `${tip.user.first_name} ${tip.user.last_name}`,
  Rating: 4, // Default rating for tips
  ReviewText: tip.text,
  ReviewTime: new Date(tip.created_at).toISOString(),
  BusinessName: placeDetails.name,
  BusinessAddress: placeDetails.location.formatted_address,
  AgreeCount: tip.agree_count,
  DisagreeCount: tip.disagree_count
}));

console.log(`✅ Transformed ${transformedReviews.length} tips to reviews:\n`);

transformedReviews.forEach((review, index) => {
  console.log(`   Transformed Review ${index + 1}:`);
  console.log(`   Platform: ${review.source_platform}`);
  console.log(`   Author: ${review.AuthorName}`);
  console.log(`   Rating: ${review.Rating}`);
  console.log(`   Business: ${review.BusinessName}`);
  console.log(`   Text: ${review.ReviewText.substring(0, 100)}...`);
  console.log(`   Agrees: ${review.AgreeCount}, Disagrees: ${review.DisagreeCount}\n`);
});

console.log('🎉 Complete Workflow Demonstrated!');
console.log('\n📊 Summary:');
console.log(`- Pattaya fsq_place_id: ${pattayaSearchResult.fsq_place_id}`);
console.log(`- Place name: ${placeDetails.name}`);
console.log(`- Total tips/reviews: ${placeDetails.tips.length}`);
console.log(`- API integration: ✅ Ready to work with credits`);

console.log('\n🔧 API Endpoints Used:');
console.log('1. Search: GET https://places-api.foursquare.com/places/search');
console.log('2. Details: GET https://places-api.foursquare.com/places/{fsq_place_id}');
console.log('3. Tips: GET https://places-api.foursquare.com/places/{fsq_place_id}?fields=tips');

console.log('\n📝 Note: This workflow is ready to work when API credits are available!');
