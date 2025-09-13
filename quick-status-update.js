#!/usr/bin/env node

/**
 * Quick Status Update Tool
 * Simple script to change video status using the most reliable endpoint
 */

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('📺 Quick Video Status Update');
  console.log('Usage: node quick-status-update.js <video_id> <status>');
  console.log('');
  console.log('Status options: active, pending, rejected, archived');
  console.log('');
  console.log('Examples:');
  console.log('  node quick-status-update.js 8 active');
  console.log('  node quick-status-update.js 9 rejected');
  console.log('  node quick-status-update.js 10 pending');
  process.exit(1);
}

const [videoId, newStatus] = args;
const validStatuses = ['active', 'pending', 'rejected', 'archived'];

if (!validStatuses.includes(newStatus)) {
  console.log('❌ Invalid status. Must be one of:', validStatuses.join(', '));
  process.exit(1);
}

async function updateVideoStatus() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${BASE_URL}/api/featured-videos/moderation/update/${videoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        reason: `Manual status change to ${newStatus}`
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log(`✅ Video ${videoId} status updated to: ${newStatus}`);
      console.log(`📝 Title: ${result.data.title}`);
      console.log(`🎬 Channel: ${result.data.channel_name}`);
    } else {
      console.log('❌ Update failed:', result.error || result.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

updateVideoStatus();
