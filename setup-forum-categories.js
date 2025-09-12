#!/usr/bin/env node

/**
 * Sample Forum Categories Data
 * This script populates the Forum Categories collection with default categories
 */

const sampleCategories = [
  {
    category_id_from_discourse: 1,
    category_name: "Food & Dining",
    display_icon: "🍴",
    display_color: "#FF6B6B",
    is_active: true,
    sort_order: 1
  },
  {
    category_id_from_discourse: 2,
    category_name: "Visa & Legal",
    display_icon: "🛂",
    display_color: "#4ECDC4",
    is_active: true,
    sort_order: 2
  },
  {
    category_id_from_discourse: 3,
    category_name: "Nightlife",
    display_icon: "🍸",
    display_color: "#45B7D1",
    is_active: true,
    sort_order: 3
  },
  {
    category_id_from_discourse: 4,
    category_name: "Transportation",
    display_icon: "🚗",
    display_color: "#96CEB4",
    is_active: true,
    sort_order: 4
  },
  {
    category_id_from_discourse: 5,
    category_name: "Events",
    display_icon: "🎉",
    display_color: "#FFEAA7",
    is_active: true,
    sort_order: 5
  },
  {
    category_id_from_discourse: 6,
    category_name: "Living",
    display_icon: "🏠",
    display_color: "#DDA0DD",
    is_active: true,
    sort_order: 6
  },
  {
    category_id_from_discourse: 7,
    category_name: "Accommodation",
    display_icon: "🏨",
    display_color: "#98D8C8",
    is_active: true,
    sort_order: 7
  },
  {
    category_id_from_discourse: 8,
    category_name: "Shopping",
    display_icon: "🛍️",
    display_color: "#F7DC6F",
    is_active: true,
    sort_order: 8
  },
  {
    category_id_from_discourse: 9,
    category_name: "Health",
    display_icon: "🏥",
    display_color: "#BB8FCE",
    is_active: true,
    sort_order: 9
  },
  {
    category_id_from_discourse: 10,
    category_name: "Entertainment",
    display_icon: "🎬",
    display_color: "#85C1E9",
    is_active: true,
    sort_order: 10
  },
  {
    category_id_from_discourse: 11,
    category_name: "Sports",
    display_icon: "⚽",
    display_color: "#82E0AA",
    is_active: true,
    sort_order: 11
  },
  {
    category_id_from_discourse: 12,
    category_name: "General",
    display_icon: "💬",
    display_color: "#F8C471",
    is_active: true,
    sort_order: 12
  }
];

const samplePinnedThreads = [
  {
    thread_url: "https://your-discourse-site.com/t/important-announcement/123",
    display_title: "Important Community Announcement",
    is_active: true,
    display_order: 1,
    category_id: 12,
    author_name: "Admin",
    last_activity: new Date().toISOString(),
    reply_count: 5
  },
  {
    thread_url: "https://your-discourse-site.com/t/visa-guide-2024/456",
    display_title: "Complete Visa Guide for 2024",
    is_active: true,
    display_order: 2,
    category_id: 2,
    author_name: "VisaExpert",
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reply_count: 12
  }
];

console.log('Sample Forum Categories Data:');
console.log(JSON.stringify(sampleCategories, null, 2));

console.log('\nSample Pinned Threads Data:');
console.log(JSON.stringify(samplePinnedThreads, null, 2));

console.log('\nTo populate your Strapi database:');
console.log('1. Go to Strapi Admin Panel');
console.log('2. Navigate to Content Manager');
console.log('3. Select "Forum Categories" collection');
console.log('4. Create entries using the sample data above');
console.log('5. Repeat for "Pinned Forum Threads" collection');

console.log('\nEnvironment Variables needed:');
console.log('DISCOURSE_API_KEY=your_discourse_api_key');
console.log('DISCOURSE_API_USERNAME=system');
console.log('DISCOURSE_BASE_URL=https://your-discourse-site.com');
