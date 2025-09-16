'use strict';

/**
 * photo lifecycle callbacks
 */

module.exports = {
  async beforeUpdate(event) {
    const { data, where } = event.params;
    
    console.log('🔄 Photo beforeUpdate lifecycle triggered');
    console.log('📋 Update data:', JSON.stringify(data, null, 2));
    console.log('🔍 Where clause:', JSON.stringify(where, null, 2));
    
    try {
      // If status is being changed, automatically set the appropriate timestamp
      if (data.status && where.id) {
        console.log(`📸 Status change detected for photo ${where.id}: ${data.status}`);
        
        // @ts-ignore
        const currentPhoto = await strapi.entityService.findOne('api::photo.photo', where.id);
        
        if (currentPhoto) {
          console.log(`📸 Current photo status: ${currentPhoto.status}`);
          console.log(`📸 New photo status: ${data.status}`);
          
          // @ts-ignore
          if (currentPhoto.status !== data.status) {
            console.log(`🔄 Photo ${where.id} status changing from ${currentPhoto.status} to ${data.status}`);
            
            // Status is changing, set the appropriate timestamp
            if (data.status === 'approved') {
              data.approved_at = new Date();
              // Clear rejected fields if approving
              data.rejected_at = null;
              data.rejection_reason = null;
              console.log(`✅ Photo ${where.id} approved at ${data.approved_at}`);
              console.log(`🧹 Cleared rejected_at and rejection_reason`);
            } else if (data.status === 'rejected') {
              data.rejected_at = new Date();
              // Clear approved field if rejecting
              data.approved_at = null;
              console.log(`❌ Photo ${where.id} rejected at ${data.rejected_at}`);
              console.log(`🧹 Cleared approved_at`);
            } else if (data.status === 'pending') {
              // Reset both timestamps if going back to pending
              data.approved_at = null;
              data.rejected_at = null;
              data.rejection_reason = null;
              console.log(`⏳ Photo ${where.id} reset to pending`);
              console.log(`🧹 Cleared all status timestamps`);
            }
          } else {
            console.log(`ℹ️ Photo ${where.id} status unchanged: ${data.status}`);
          }
        } else {
          console.log(`❌ Photo ${where.id} not found in database`);
        }
      } else {
        console.log('ℹ️ No status change detected in update data');
      }
      
      console.log('📋 Final update data:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error in photo beforeUpdate lifecycle:', error);
      console.error('❌ Error stack:', error.stack);
      // Don't throw error to prevent blocking the update
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    console.log('✅ Photo afterUpdate lifecycle triggered');
    console.log('📸 Updated photo result:', JSON.stringify({
      id: result.id,
      status: result.status,
      approved_at: result.approved_at,
      rejected_at: result.rejected_at,
      rejection_reason: result.rejection_reason,
      uploaded_at: result.uploaded_at
    }, null, 2));
    
    try {
      // Log the final state
      if (result.status === 'approved') {
        console.log(`🎉 Photo ${result.id} successfully approved!`);
        console.log(`📅 Approved at: ${result.approved_at}`);
      } else if (result.status === 'rejected') {
        console.log(`🚫 Photo ${result.id} rejected`);
        console.log(`📅 Rejected at: ${result.rejected_at}`);
        console.log(`📝 Reason: ${result.rejection_reason || 'No reason provided'}`);
      } else if (result.status === 'pending') {
        console.log(`⏳ Photo ${result.id} status reset to pending`);
      }
    } catch (error) {
      console.error('❌ Error in photo afterUpdate lifecycle:', error);
    }
  },

  async beforeCreate(event) {
    const { data } = event.params;
    
    console.log('🆕 Photo beforeCreate lifecycle triggered');
    console.log('📋 Create data:', JSON.stringify(data, null, 2));
    
    try {
      // Set uploaded_at timestamp when creating a new photo
      if (!data.uploaded_at) {
        data.uploaded_at = new Date();
        console.log(`📸 New photo created with uploaded_at: ${data.uploaded_at}`);
      }
      
      // Ensure status is set to pending by default
      if (!data.status) {
        data.status = 'pending';
        console.log(`📸 New photo status set to: ${data.status}`);
      }
      
      console.log('📋 Final create data:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error in photo beforeCreate lifecycle:', error);
      // Don't throw error to prevent blocking the creation
    }
  },

  async afterCreate(event) {
    const { result } = event;
    
    console.log('✅ Photo afterCreate lifecycle triggered');
    console.log('📸 New photo created:', JSON.stringify({
      id: result.id,
      status: result.status,
      uploaded_at: result.uploaded_at,
      author: result.author?.id || result.author
    }, null, 2));
  }
};
