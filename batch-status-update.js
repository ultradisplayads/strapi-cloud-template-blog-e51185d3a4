#!/usr/bin/env node

/**
 * Batch Video Status Update Tool
 * Usage: node batch-status-update.js <status> <video_ids...>
 * Example: node batch-status-update.js active 1 2 3 4 5
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337';
const VALID_STATUSES = ['pending', 'active', 'rejected', 'archived'];

async function batchUpdateStatus(status, videoIds, reason = null) {
  try {
    console.log('🔄 Starting batch status update...');
    console.log(`📊 Status: ${status}`);
    console.log(`📹 Video IDs: ${videoIds.join(', ')}`);
    console.log(`📝 Reason: ${reason || 'No reason provided'}\n`);

    const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/bulk-status`, {
      videoIds: videoIds.map(id => parseInt(id)),
      status: status,
      reason: reason
    });

    if (response.data.success) {
      console.log('✅ Batch update completed successfully!');
      console.log(`📈 Updated ${response.data.updated} videos`);
      console.log(`⏰ Completed at: ${new Date().toLocaleString()}`);
      
      // Verify updates by fetching updated videos
      console.log('\n🔍 Verifying updates...');
      for (const videoId of videoIds) {
        try {
          const videoResponse = await axios.get(`${BASE_URL}/api/videos?filters[id][$eq]=${videoId}`);
          const videos = videoResponse.data.data;
          
          if (videos.length > 0) {
            const video = videos[0];
            console.log(`✓ Video ${videoId}: ${video.title.substring(0, 50)}... → ${video.status}`);
          } else {
            console.log(`⚠️  Video ${videoId}: Not found`);
          }
        } catch (verifyError) {
          console.log(`❌ Video ${videoId}: Verification failed`);
        }
      }
    } else {
      console.log('❌ Batch update failed');
      console.log(`Error: ${response.data.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.log('❌ Batch update failed');
    if (error.response?.data?.error) {
      console.log(`API Error: ${error.response.data.error}`);
    } else {
      console.log(`Network Error: ${error.message}`);
    }
    
    // Try individual updates as fallback
    console.log('\n🔄 Attempting individual updates as fallback...');
    let successCount = 0;
    
    for (const videoId of videoIds) {
      try {
        const response = await axios.put(`${BASE_URL}/api/featured-videos/moderation/update/${videoId}`, {
          status: status,
          reason: reason
        });
        
        if (response.data.success) {
          console.log(`✓ Video ${videoId}: Updated successfully`);
          successCount++;
        } else {
          console.log(`❌ Video ${videoId}: ${response.data.error}`);
        }
      } catch (individualError) {
        console.log(`❌ Video ${videoId}: ${individualError.response?.data?.error || individualError.message}`);
      }
    }
    
    console.log(`\n📊 Fallback Results: ${successCount}/${videoIds.length} videos updated`);
  }
}

async function showUsage() {
  console.log('📺 Batch Video Status Update Tool');
  console.log('================================\n');
  console.log('Usage:');
  console.log('  node batch-status-update.js <status> <video_ids...> [reason]');
  console.log('  node batch-status-update.js <status> --file <file_path> [reason]\n');
  console.log('Examples:');
  console.log('  node batch-status-update.js active 1 2 3 4 5');
  console.log('  node batch-status-update.js rejected 10 11 12 "Inappropriate content"');
  console.log('  node batch-status-update.js pending --file video_ids.txt "Needs review"\n');
  console.log('Valid statuses: ' + VALID_STATUSES.join(', '));
  console.log('\nFile format (one video ID per line):');
  console.log('  1');
  console.log('  2');
  console.log('  3');
}

async function readVideoIdsFromFile(filePath) {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !isNaN(parseInt(line)))
      .map(line => parseInt(line));
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    await showUsage();
    process.exit(1);
  }

  const status = args[0].toLowerCase();
  
  if (!VALID_STATUSES.includes(status)) {
    console.log(`❌ Invalid status: ${status}`);
    console.log(`Valid statuses: ${VALID_STATUSES.join(', ')}`);
    process.exit(1);
  }

  let videoIds = [];
  let reason = null;

  // Check if using file input
  if (args[1] === '--file') {
    if (args.length < 3) {
      console.log('❌ File path required when using --file option');
      process.exit(1);
    }
    
    try {
      videoIds = await readVideoIdsFromFile(args[2]);
      reason = args[3] || null;
    } catch (error) {
      console.log(`❌ ${error.message}`);
      process.exit(1);
    }
  } else {
    // Parse video IDs from command line
    const idArgs = args.slice(1);
    const lastArg = idArgs[idArgs.length - 1];
    
    // Check if last argument is a reason (not a number)
    if (isNaN(parseInt(lastArg)) && idArgs.length > 1) {
      reason = lastArg;
      videoIds = idArgs.slice(0, -1).map(id => parseInt(id)).filter(id => !isNaN(id));
    } else {
      videoIds = idArgs.map(id => parseInt(id)).filter(id => !isNaN(id));
    }
  }

  if (videoIds.length === 0) {
    console.log('❌ No valid video IDs provided');
    process.exit(1);
  }

  if (videoIds.length > 100) {
    console.log('⚠️  Warning: Updating more than 100 videos at once may cause performance issues');
    console.log('Consider breaking this into smaller batches');
  }

  await batchUpdateStatus(status, videoIds, reason);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { batchUpdateStatus };
