#!/usr/bin/env node

/**
 * Comprehensive Video Status Management Tool
 * Provides interactive CLI interface for managing video statuses
 */

const readline = require('readline');
const axios = require('axios');

const BASE_URL = 'http://localhost:1337';
const VALID_STATUSES = ['pending', 'active', 'rejected', 'archived'];

class VideoStatusManager {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🎬 Video Status Management System');
    console.log('================================\n');
    
    while (true) {
      try {
        await this.showMainMenu();
      } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
      }
    }
  }

  async showMainMenu() {
    console.log('Select an option:');
    console.log('1. View videos by status');
    console.log('2. Update single video status');
    console.log('3. Bulk update video statuses');
    console.log('4. View moderation statistics');
    console.log('5. Search videos');
    console.log('6. Exit\n');

    const choice = await this.askQuestion('Enter your choice (1-6): ');
    
    switch (choice.trim()) {
      case '1':
        await this.viewVideosByStatus();
        break;
      case '2':
        await this.updateSingleVideo();
        break;
      case '3':
        await this.bulkUpdateVideos();
        break;
      case '4':
        await this.viewModerationStats();
        break;
      case '5':
        await this.searchVideos();
        break;
      case '6':
        console.log('👋 Goodbye!');
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid choice. Please try again.\n');
    }
  }

  async viewVideosByStatus() {
    console.log('\n📊 Videos by Status');
    console.log('==================');
    
    const status = await this.askQuestion('Enter status (pending/active/rejected/archived) or "all": ');
    
    try {
      let url = `${BASE_URL}/api/videos`;
      if (status.trim().toLowerCase() !== 'all' && VALID_STATUSES.includes(status.trim().toLowerCase())) {
        url += `?filters[status][$eq]=${status.trim().toLowerCase()}`;
      }
      
      const response = await axios.get(url);
      const videos = response.data.data;
      
      if (videos.length === 0) {
        console.log('📭 No videos found.\n');
        return;
      }
      
      console.log(`\n📹 Found ${videos.length} videos:\n`);
      videos.forEach((video, index) => {
        console.log(`${index + 1}. ID: ${video.id} | Document ID: ${video.documentId}`);
        console.log(`   Title: ${video.title}`);
        console.log(`   Status: ${this.getStatusEmoji(video.status)} ${video.status}`);
        console.log(`   Channel: ${video.channel_name}`);
        console.log(`   Modified: ${new Date(video.updatedAt).toLocaleString()}\n`);
      });
      
    } catch (error) {
      console.log(`❌ Failed to fetch videos: ${error.message}\n`);
    }
  }

  async updateSingleVideo() {
    console.log('\n✏️  Update Single Video Status');
    console.log('=============================');
    
    const videoId = await this.askQuestion('Enter video ID (regular ID, not document ID): ');
    
    // First, get video details
    try {
      const videoResponse = await axios.get(`${BASE_URL}/api/videos?filters[id][$eq]=${videoId}`);
      const videos = videoResponse.data.data;
      
      if (videos.length === 0) {
        console.log('❌ Video not found.\n');
        return;
      }
      
      const video = videos[0];
      console.log(`\n📹 Current video details:`);
      console.log(`   Title: ${video.title}`);
      console.log(`   Current Status: ${this.getStatusEmoji(video.status)} ${video.status}`);
      console.log(`   Channel: ${video.channel_name}\n`);
      
      console.log('Available statuses:');
      VALID_STATUSES.forEach((status, index) => {
        console.log(`${index + 1}. ${this.getStatusEmoji(status)} ${status}`);
      });
      
      const newStatus = await this.askQuestion('\nEnter new status: ');
      
      if (!VALID_STATUSES.includes(newStatus.trim().toLowerCase())) {
        console.log('❌ Invalid status.\n');
        return;
      }
      
      const reason = await this.askQuestion('Enter reason (optional): ');
      
      // Update using custom moderation endpoint
      const updateResponse = await axios.put(
        `${BASE_URL}/api/featured-videos/moderation/update/${videoId}`,
        {
          status: newStatus.trim().toLowerCase(),
          reason: reason.trim() || null
        }
      );
      
      if (updateResponse.data.success) {
        console.log(`✅ Video status updated successfully!`);
        console.log(`   New Status: ${this.getStatusEmoji(newStatus)} ${newStatus}`);
        console.log(`   Updated At: ${new Date().toLocaleString()}\n`);
      }
      
    } catch (error) {
      console.log(`❌ Failed to update video: ${error.response?.data?.error || error.message}\n`);
    }
  }

  async bulkUpdateVideos() {
    console.log('\n📦 Bulk Update Video Statuses');
    console.log('============================');
    
    const videoIds = await this.askQuestion('Enter video IDs (comma-separated): ');
    const idsArray = videoIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (idsArray.length === 0) {
      console.log('❌ No valid video IDs provided.\n');
      return;
    }
    
    console.log('Available statuses:');
    VALID_STATUSES.forEach((status, index) => {
      console.log(`${index + 1}. ${this.getStatusEmoji(status)} ${status}`);
    });
    
    const newStatus = await this.askQuestion('\nEnter new status for all videos: ');
    
    if (!VALID_STATUSES.includes(newStatus.trim().toLowerCase())) {
      console.log('❌ Invalid status.\n');
      return;
    }
    
    const reason = await this.askQuestion('Enter reason (optional): ');
    
    try {
      const response = await axios.put(
        `${BASE_URL}/api/featured-videos/moderation/bulk-status`,
        {
          videoIds: idsArray,
          status: newStatus.trim().toLowerCase(),
          reason: reason.trim() || null
        }
      );
      
      if (response.data.success) {
        console.log(`✅ ${response.data.updated} videos updated successfully!`);
        console.log(`   New Status: ${this.getStatusEmoji(newStatus)} ${newStatus}`);
        console.log(`   Updated At: ${new Date().toLocaleString()}\n`);
      }
      
    } catch (error) {
      console.log(`❌ Failed to bulk update: ${error.response?.data?.error || error.message}\n`);
    }
  }

  async viewModerationStats() {
    console.log('\n📈 Moderation Statistics');
    console.log('=======================');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/featured-videos/moderation/stats`);
      const stats = response.data.stats;
      
      console.log(`📊 Status Distribution:`);
      console.log(`   ${this.getStatusEmoji('pending')} Pending: ${stats.pending}`);
      console.log(`   ${this.getStatusEmoji('active')} Active: ${stats.active}`);
      console.log(`   ${this.getStatusEmoji('rejected')} Rejected: ${stats.rejected}`);
      console.log(`   📹 Total: ${stats.total}`);
      console.log(`   ✅ Approval Rate: ${stats.approval_rate}%\n`);
      
      if (response.data.recent_activity && response.data.recent_activity.length > 0) {
        console.log('🕒 Recent Activity (Last 24 hours):');
        response.data.recent_activity.forEach((activity, index) => {
          console.log(`${index + 1}. ${activity.title.substring(0, 50)}...`);
          console.log(`   Status: ${this.getStatusEmoji(activity.status)} ${activity.status}`);
          console.log(`   Modified: ${new Date(activity.moderated_at).toLocaleString()}\n`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Failed to fetch stats: ${error.message}\n`);
    }
  }

  async searchVideos() {
    console.log('\n🔍 Search Videos');
    console.log('================');
    
    const searchTerm = await this.askQuestion('Enter search term (title, channel, or description): ');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/videos?filters[$or][0][title][$containsi]=${encodeURIComponent(searchTerm)}&filters[$or][1][channel_name][$containsi]=${encodeURIComponent(searchTerm)}&filters[$or][2][description][$containsi]=${encodeURIComponent(searchTerm)}`);
      const videos = response.data.data;
      
      if (videos.length === 0) {
        console.log('📭 No videos found matching your search.\n');
        return;
      }
      
      console.log(`\n🎯 Found ${videos.length} matching videos:\n`);
      videos.forEach((video, index) => {
        console.log(`${index + 1}. ID: ${video.id} | Status: ${this.getStatusEmoji(video.status)} ${video.status}`);
        console.log(`   Title: ${video.title}`);
        console.log(`   Channel: ${video.channel_name}`);
        console.log(`   Views: ${video.view_count?.toLocaleString() || 'N/A'}\n`);
      });
      
    } catch (error) {
      console.log(`❌ Search failed: ${error.message}\n`);
    }
  }

  getStatusEmoji(status) {
    const emojis = {
      'pending': '⏳',
      'active': '✅',
      'rejected': '❌',
      'archived': '📦'
    };
    return emojis[status] || '❓';
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Start the application
if (require.main === module) {
  const manager = new VideoStatusManager();
  manager.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = VideoStatusManager;
