'use strict';

/**
 * Seed script to populate restaurants in Strapi
 * Run with: node scripts/seed-restaurants.js
 */

const restaurants = [
  {
    name: "Seafood Paradise",
    cuisine: "Thai Seafood",
    rating: 4.8,
    priceRange: "moderate",
    location: "Beach Road, Pattaya",
    latitude: 12.9236,
    longitude: 100.8825,
    description: "Fresh seafood with stunning ocean views. Experience authentic Thai flavors with the freshest catch of the day. Our signature dishes include grilled sea bass and tom yum goong.",
    features: ["Ocean View", "Fresh Seafood", "Thai Cuisine", "Romantic Setting"],
    discounts: [
      { type: "time-based", value: 30, timeSlots: ["14:00-16:00", "21:00-22:00"], maxBookings: 20, currentBookings: 8 },
      { type: "fixed-price", value: 899, originalPrice: 1299, packageName: "Seafood Feast for 2", maxBookings: 15, currentBookings: 5 }
    ],
    maxDailyBookings: 50,
    currentDailyBookings: 23,
    isAllYouCanEat: false,
    topDiscount: 30,
    relevanceScore: 95,
    contact: "+66 38 123 456",
    openHours: "11:00 AM - 11:00 PM"
  },
  {
    name: "Thai Garden BBQ",
    cuisine: "Thai BBQ",
    rating: 4.6,
    priceRange: "budget",
    location: "Central Pattaya",
    latitude: 12.9276,
    longitude: 100.8776,
    description: "Traditional Thai BBQ in a beautiful garden setting. Perfect for groups and families. Unlimited grilled meats and fresh vegetables in our all-you-can-eat buffet.",
    features: ["Garden Setting", "BBQ Grill", "Family Friendly", "Group Dining"],
    discounts: [
      { type: "all-you-can-eat", value: 599, originalPrice: 899, packageName: "BBQ Buffet Unlimited", maxBookings: 30, currentBookings: 12 },
      { type: "time-based", value: 25, timeSlots: ["15:00-17:00"], maxBookings: 25, currentBookings: 8 }
    ],
    maxDailyBookings: 80,
    currentDailyBookings: 35,
    isAllYouCanEat: true,
    topDiscount: 33,
    relevanceScore: 88,
    contact: "+66 38 234 567",
    openHours: "5:00 PM - 12:00 AM"
  },
  {
    name: "Spice Route",
    cuisine: "Indian",
    rating: 4.7,
    priceRange: "moderate",
    location: "Walking Street, Pattaya",
    latitude: 12.9156,
    longitude: 100.8706,
    description: "Authentic Indian cuisine with aromatic spices and traditional recipes. Vegetarian and non-vegetarian options available.",
    features: ["Authentic Indian", "Vegetarian Options", "Spicy Food", "Traditional Recipes"],
    discounts: [
      { type: "time-based", value: 20, timeSlots: ["12:00-14:00", "17:00-19:00"], maxBookings: 40, currentBookings: 15 }
    ],
    maxDailyBookings: 60,
    currentDailyBookings: 28,
    isAllYouCanEat: false,
    topDiscount: 20,
    relevanceScore: 82,
    contact: "+66 38 345 678",
    openHours: "12:00 PM - 11:00 PM"
  },
  {
    name: "Sushi Zen",
    cuisine: "Japanese",
    rating: 4.9,
    priceRange: "expensive",
    location: "Central Festival, Pattaya",
    latitude: 12.9200,
    longitude: 100.8800,
    description: "Premium Japanese sushi and sashimi with fresh ingredients imported daily. Traditional omakase experience available.",
    features: ["Fresh Sushi", "Omakase", "Premium Ingredients", "Traditional Japanese"],
    discounts: [
      { type: "time-based", value: 15, timeSlots: ["12:00-14:00"], maxBookings: 15, currentBookings: 5 }
    ],
    maxDailyBookings: 30,
    currentDailyBookings: 12,
    isAllYouCanEat: false,
    topDiscount: 15,
    relevanceScore: 92,
    contact: "+66 38 456 789",
    openHours: "11:30 AM - 10:00 PM"
  },
  {
    name: "Pizza Corner",
    cuisine: "Italian",
    rating: 4.4,
    priceRange: "budget",
    location: "Jomtien Beach, Pattaya",
    latitude: 12.9000,
    longitude: 100.8500,
    description: "Authentic Italian pizza with wood-fired oven and fresh ingredients. Family-friendly atmosphere with great value.",
    features: ["Wood-fired Pizza", "Family Friendly", "Great Value", "Italian Authentic"],
    discounts: [
      { type: "fixed-price", value: 299, originalPrice: 399, packageName: "Margherita Pizza + Drink", maxBookings: 25, currentBookings: 8 }
    ],
    maxDailyBookings: 40,
    currentDailyBookings: 18,
    isAllYouCanEat: false,
    topDiscount: 25,
    relevanceScore: 75,
    contact: "+66 38 567 890",
    openHours: "10:00 AM - 11:00 PM"
  }
];

async function seedRestaurants() {
  try {
    console.log('🌱 Starting restaurant seeding...');
    
    // This would typically use Strapi's entity service
    // For now, we'll just log the data structure
    console.log('📋 Sample restaurant data ready for Strapi:');
    console.log(JSON.stringify(restaurants, null, 2));
    
    console.log('✅ Restaurant seeding data prepared!');
    console.log('📝 To add these restaurants to Strapi:');
    console.log('1. Go to Strapi Admin Panel');
    console.log('2. Navigate to Content Manager > Restaurant');
    console.log('3. Create new entries with the data above');
    console.log('4. Or use the Strapi API to POST to /api/restaurants');
    
  } catch (error) {
    console.error('❌ Error seeding restaurants:', error);
  }
}

// Run the seeding
seedRestaurants();
