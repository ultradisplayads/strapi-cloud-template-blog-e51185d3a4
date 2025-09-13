#!/usr/bin/env node

/**
 * Fix Status Update Script
 * This script helps test and fix manual status updates for videos
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎬 Video Status Update Helper');
console.log('=============================\n');

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function listVideos() {
  console.log('📋 Current Videos:');
  const result = await makeRequest('http://localhost:1337/api/videos');
  
  if (result.success && result.data.data) {
    result.data.data.forEach((video, index) => {
      console.log(`${index + 1}. ID: ${video.id} | DocID: ${video.documentId} | Status: ${video.status} | Title: ${video.title}`);
    });
    return result.data.data;
  } else {
    console.log('❌ Failed to fetch videos:', result.error || result.data);
    return [];
  }
}

async function updateVideoStatus(videoId, newStatus, useDocumentId = false) {
  const url = `http://localhost:1337/api/videos/${videoId}`;
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        status: newStatus
      }
    })
  };

  console.log(`\n🔄 Updating video ${videoId} to status: ${newStatus}`);
  console.log(`Using ${useDocumentId ? 'Document ID' : 'Regular ID'}`);
  
  const result = await makeRequest(url, options);
  
  if (result.success) {
    console.log('✅ Status updated successfully!');
    console.log(`New status: ${result.data.data.status}`);
  } else {
    console.log('❌ Update failed:', result.data?.error?.message || result.error);
    
    // If regular ID failed, suggest trying document ID
    if (!useDocumentId && result.status === 404) {
      console.log('💡 Trying with document ID instead...');
      return false; // Signal to retry with document ID
    }
  }
  
  return result.success;
}

async function main() {
  const videos = await listVideos();
  
  if (videos.length === 0) {
    console.log('No videos found. Exiting.');
    rl.close();
    return;
  }

  rl.question('\nEnter video number to update (or "q" to quit): ', async (answer) => {
    if (answer.toLowerCase() === 'q') {
      rl.close();
      return;
    }

    const videoIndex = parseInt(answer) - 1;
    if (videoIndex < 0 || videoIndex >= videos.length) {
      console.log('❌ Invalid video number');
      rl.close();
      return;
    }

    const selectedVideo = videos[videoIndex];
    
    rl.question('Enter new status (active/pending/rejected/archived): ', async (newStatus) => {
      const validStatuses = ['active', 'pending', 'rejected', 'archived'];
      
      if (!validStatuses.includes(newStatus)) {
        console.log('❌ Invalid status. Must be one of:', validStatuses.join(', '));
        rl.close();
        return;
      }

      // Try with regular ID first
      let success = await updateVideoStatus(selectedVideo.id, newStatus, false);
      
      // If failed, try with document ID
      if (!success) {
        success = await updateVideoStatus(selectedVideo.documentId, newStatus, true);
      }

      if (success) {
        console.log('\n🎉 Status update completed!');
        console.log('You can now refresh the admin panel to see the changes.');
      } else {
        console.log('\n❌ Both update methods failed. Check Strapi server logs for details.');
      }

      rl.close();
    });
  });
}

// Run the script
main().catch(console.error);
