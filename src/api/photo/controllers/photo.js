'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// @ts-ignore
module.exports = createCoreController('api::photo.photo', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    const user = ctx.state.user;

    // Debug authentication
    console.log('📸 Photo upload request received');
    console.log('User from ctx.state.user:', user ? `ID: ${user.id}, Username: ${user.username}` : 'No user');
    console.log('Authorization header:', ctx.request.header.authorization ? 'Present' : 'Missing');
    console.log('Token preview:', ctx.request.header.authorization?.substring(0, 50) + '...');

    // Ensure user is authenticated
    if (!user) {
      console.log('❌ No authenticated user found');
      return ctx.unauthorized('You must be logged in to upload photos');
    }

    try {
      let imageFile = null;
      
      // Handle base64 image upload
      if (data.image && typeof data.image === 'string' && data.image.startsWith('data:')) {
        try {
          console.log('Processing base64 image upload...');
          
          // Convert base64 to buffer
          const base64Data = data.image.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          console.log('Base64 data length:', base64Data.length);
          console.log('Buffer size:', buffer.length);
          
          // Get file extension from base64 header
          const mimeType = data.image.split(',')[0].split(':')[1].split(';')[0];
          const extension = mimeType.split('/')[1] || 'jpg';
          console.log('MIME type:', mimeType, 'Extension:', extension);
          
          // Create filename and save directly to uploads directory
          const fileName = `photo_${Date.now()}.${extension}`;
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          
          // Ensure uploads directory exists
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = path.join(uploadsDir, fileName);
          console.log('Saving file to:', filePath);
          
          // Write buffer to file
          fs.writeFileSync(filePath, buffer);
          console.log('File saved successfully');
          
          // Create file record manually
          // @ts-ignore
          const fileRecord = await strapi.entityService.create('plugin::upload.file', {
            data: {
              name: fileName,
              alternativeText: null,
              caption: null,
              width: null,
              height: null,
              formats: null,
              hash: `photo_${Date.now()}`,
              ext: `.${extension}`,
              mime: mimeType,
              size: buffer.length,
              url: `/uploads/${fileName}`,
              previewUrl: null,
              provider: 'local',
              provider_metadata: null,
              folderPath: '/',
              folder: null
            }
          });
          
          imageFile = fileRecord;
          console.log('File record created successfully:', imageFile.id);
        } catch (error) {
          console.error('Error uploading base64 image:', error);
          console.error('Error stack:', error.stack);
          return ctx.badRequest('Failed to process image: ' + error.message);
        }
      }

      // Set photo data with authenticated user
      const photoData = {
        ...data,
        image: imageFile ? imageFile.id : data.image,
        author: user.id, // Set author to authenticated user ID
        status: 'approved', // Set to approved immediately
        uploaded_at: new Date(),
        approved_at: new Date(), // Set approval timestamp immediately
        file_size: imageFile ? imageFile.size : null,
        mime_type: imageFile ? imageFile.mime : null,
        is_public: true
      };

      // Process image to get dimensions and orientation
      if (imageFile) {
        try {
          // Read the file directly from the filesystem since we saved it there
          // imageFile.url typically starts with '/uploads/...', so ensure we don't break path.join
          const relativeUrlPath = imageFile.url && imageFile.url.startsWith('/') ? imageFile.url.slice(1) : imageFile.url;
          const filePath = path.join(process.cwd(), 'public', relativeUrlPath);
          
          if (fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath);
            const metadata = await sharp(imageBuffer).metadata();
            
            photoData.width = metadata.width;
            photoData.height = metadata.height;
            
            // Determine orientation
            if (metadata.width > metadata.height) {
              photoData.orientation = 'landscape';
            } else if (metadata.height > metadata.width) {
              photoData.orientation = 'portrait';
            } else {
              photoData.orientation = 'square';
            }
          }
        } catch (error) {
          console.error('Error processing image metadata:', error);
        }
      }

      // @ts-ignore
      const photo = await strapi.entityService.create('api::photo.photo', {
        data: photoData,
        populate: ['author', 'hashtags', 'image']
      });

      return ctx.created({ data: photo });
    } catch (error) {
      console.error('Error creating photo:', error);
      return ctx.badRequest('Failed to create photo');
    }
  },

  async find(ctx) {
    const { query } = ctx;
    
    // Only show approved photos to public
    const filters = Object.assign({}, query.filters || {}, {
      status: { $eq: 'approved' }
    });

    // @ts-ignore
    const photos = await strapi.entityService.findMany('api::photo.photo', Object.assign({}, query, {
      filters,
      populate: ['author', 'hashtags', 'image']
    }));

    return { data: photos };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    
    // @ts-ignore
    const photo = await strapi.entityService.findOne('api::photo.photo', id, {
      populate: ['author', 'hashtags', 'image']
    });

    // @ts-ignore
    if (!photo || photo.status !== 'approved') {
      return ctx.notFound('Photo not found');
    }

    // Increment view count
    // @ts-ignore
    await strapi.entityService.update('api::photo.photo', id, {
      // @ts-ignore
      data: { views: (photo.views || 0) + 1 }
    });

    return { data: photo };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const user = ctx.state.user;

    console.log('🔄 Photo update request received');
    console.log('📸 Photo ID:', id);
    console.log('👤 User:', user ? `ID: ${user.id}, Username: ${user.username}` : 'No user');
    console.log('📋 Update data:', JSON.stringify(data, null, 2));

    // Check if user is authenticated
    if (!user) {
      console.log('❌ No authenticated user found');
      return ctx.unauthorized('You must be logged in to update photos');
    }

    try {
      // Check if photo exists
      // @ts-ignore
      const existingPhoto = await strapi.entityService.findOne('api::photo.photo', id);
      
      if (!existingPhoto) {
        console.log('❌ Photo not found:', id);
        return ctx.notFound('Photo not found');
      }

      // Cast to any to access status property
      const existingPhotoAny = /** @type {any} */ (existingPhoto);

      // If status is being changed, handle it properly
      if (data.status && data.status !== existingPhotoAny.status) {
        console.log(`🔄 Status change from ${existingPhotoAny.status} to ${data.status}`);
        
        // Set appropriate timestamps based on status
        if (data.status === 'approved') {
          data.approved_at = new Date();
          data.rejected_at = null;
          data.rejection_reason = null;
          console.log(`✅ Photo approved at ${data.approved_at}`);
        } else if (data.status === 'rejected') {
          data.rejected_at = new Date();
          data.approved_at = null;
          console.log(`❌ Photo rejected at ${data.rejected_at}`);
        } else if (data.status === 'pending') {
          data.approved_at = null;
          data.rejected_at = null;
          data.rejection_reason = null;
          console.log(`⏳ Photo reset to pending`);
        }
      }

      // Update the photo
      // @ts-ignore
      const updatedPhoto = await strapi.entityService.update('api::photo.photo', id, {
        data,
        populate: ['author', 'hashtags', 'image']
      });

      console.log('✅ Photo updated successfully');
      return { data: updatedPhoto };
    } catch (error) {
      console.error('❌ Error updating photo:', error);
      console.error('❌ Error stack:', error.stack);
      return ctx.badRequest('Failed to update photo: ' + error.message);
    }
  },

  async like(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to like photos');
    }

    try {
      // @ts-ignore
      const photo = await strapi.entityService.findOne('api::photo.photo', id);
      
      if (!photo) {
        return ctx.notFound('Photo not found');
      }

      // TODO: Implement like tracking to prevent duplicate likes
      // For now, just increment the like count
      // @ts-ignore
      const updatedPhoto = await strapi.entityService.update('api::photo.photo', id, {
        // @ts-ignore
        data: { likes: (photo.likes || 0) + 1 }
      });

      return { data: updatedPhoto };
    } catch (error) {
      console.error('Error liking photo:', error);
      return ctx.badRequest('Failed to like photo');
    }
  },

  async approve(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    console.log('📸 ===== PHOTO APPROVAL REQUEST =====');
    console.log('📸 Photo ID:', id);
    console.log('👤 User:', user ? `ID: ${user.id}, Username: ${user.username}, Role: ${user.role?.name || user.role?.type || 'unknown'}` : 'No user');
    console.log('🔐 Auth header present:', !!ctx.request.header.authorization);
    console.log('📋 Request body:', JSON.stringify(ctx.request.body, null, 2));

    if (!user) {
      console.log('❌ No authenticated user found');
      return ctx.forbidden('Authentication required');
    }
    
    // For now, allow any authenticated user from Strapi dashboard to approve photos
    // TODO: Implement proper admin role checking later
    console.log('🔐 User check:', { 
      roleName: user.role?.name, 
      roleType: user.role?.type, 
      role: user.role, 
      userId: user.id,
      username: user.username
    });
    
    // Allow any authenticated user to approve photos for now
    console.log('✅ Allowing user to approve photos:', user.username);

    try {
      console.log('🔍 Fetching existing photo...');
      // First check if photo exists
      // @ts-ignore
      const existingPhoto = await strapi.entityService.findOne('api::photo.photo', id, {
        populate: ['author', 'image']
      });
      
      if (!existingPhoto) {
        console.log('❌ Photo not found:', id);
        return ctx.notFound('Photo not found');
      }

      // Cast for logging to satisfy type checker
      const existingPhotoAny = /** @type {any} */ (existingPhoto);
      // @ts-ignore
      const existingDetails = {
        id: existingPhotoAny.id,
        status: existingPhotoAny.status,
        caption: existingPhotoAny.caption,
        author: existingPhotoAny.author?.username || existingPhotoAny.author,
        uploaded_at: existingPhotoAny.uploaded_at
      };
      console.log('📸 Current photo details:', existingDetails);

      console.log('🔄 Updating photo status to approved...');
      // @ts-ignore
      const photo = await strapi.entityService.update('api::photo.photo', id, {
        data: { 
          // @ts-ignore
          status: 'approved',
          approved_at: new Date(),
          rejected_at: null,
          rejection_reason: null
        },
        populate: ['author', 'image', 'hashtags']
      });

      console.log('✅ Photo approved successfully!');
      const approvedPhotoAny = /** @type {any} */ (photo);
      // @ts-ignore
      const approvedDetails = {
        id: approvedPhotoAny.id,
        status: approvedPhotoAny.status
      };
      console.log('📸 Updated photo details:', approvedDetails);
      console.log('📸 ===== APPROVAL COMPLETE =====');
      
      return { data: photo };
    } catch (error) {
      console.error('❌ Error approving photo:', error);
      console.error('❌ Error stack:', error.stack);
      return ctx.badRequest('Failed to approve photo: ' + error.message);
    }
  },

  async reject(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    const { reason, moderation_notes } = ctx.request.body;

    console.log('📸 ===== PHOTO REJECTION REQUEST =====');
    console.log('📸 Photo ID:', id);
    console.log('👤 User:', user ? `ID: ${user.id}, Username: ${user.username}` : 'No user');
    console.log('📋 Rejection reason:', reason);
    console.log('📋 Moderation notes:', moderation_notes);

    if (!user) {
      console.log('❌ No authenticated user found');
      return ctx.forbidden('Authentication required');
    }
    
    // For now, allow any authenticated user from Strapi dashboard to reject photos
    // TODO: Implement proper admin role checking later
    console.log('🔐 User check for rejection:', { 
      roleName: user.role?.name, 
      roleType: user.role?.type, 
      role: user.role, 
      userId: user.id,
      username: user.username
    });
    
    // Allow any authenticated user to reject photos for now
    console.log('✅ Allowing user to reject photos:', user.username);

    try {
      // First check if photo exists
      // @ts-ignore
      const existingPhoto = await strapi.entityService.findOne('api::photo.photo', id);
      
      if (!existingPhoto) {
        console.log('❌ Photo not found:', id);
        return ctx.notFound('Photo not found');
      }

      console.log('🔄 Updating photo status to rejected...');
      // @ts-ignore
      const photo = await strapi.entityService.update('api::photo.photo', id, {
        data: { 
          // @ts-ignore
          status: 'rejected',
          rejected_at: new Date(),
          approved_at: null,
          rejection_reason: reason || 'No reason provided',
          moderation_notes: moderation_notes || null
        },
        populate: ['author', 'image', 'hashtags']
      });

      console.log('✅ Photo rejected successfully!');
      console.log('📸 ===== REJECTION COMPLETE =====');
      return { data: photo };
    } catch (error) {
      console.error('❌ Error rejecting photo:', error);
      console.error('❌ Error stack:', error.stack);
      return ctx.badRequest('Failed to reject photo: ' + error.message);
    }
  },

  async getLatest(ctx) {
    const { limit = 1 } = ctx.query;
    
    try {
      // @ts-ignore
      const photos = await strapi.entityService.findMany('api::photo.photo', {
        filters: { status: { $eq: 'approved' } },
        sort: { uploaded_at: 'desc' },
        limit: parseInt(String(limit)),
        populate: ['author', 'hashtags', 'image']
      });

      return { data: photos };
    } catch (error) {
      console.error('Error in getLatest:', error);
      return { data: [] };
    }
  },

  async getTrending(ctx) {
    const { limit = 10 } = ctx.query;
    
    // @ts-ignore
    const photos = await strapi.entityService.findMany('api::photo.photo', {
      filters: { status: { $eq: 'approved' } },
      sort: { likes: 'desc' },
      limit: parseInt(String(limit)),
      populate: ['author', 'hashtags', 'image']
    });

    return { data: photos };
  },

  async getPending(ctx) {
    const { limit = 20, page = 1 } = ctx.query;
    const user = ctx.state.user;

    // For now, allow any authenticated user to view pending photos
    // TODO: Implement proper admin role checking later
    if (!user) {
      return ctx.forbidden('Authentication required to view pending photos');
    }
    
    console.log('✅ Allowing user to view pending photos:', user.username);
    
    try {
      console.log('📸 Getting pending photos...');
      
      // @ts-ignore
      const photos = await strapi.entityService.findMany('api::photo.photo', {
        filters: { status: { $eq: 'pending' } },
        sort: { uploaded_at: 'desc' },
        limit: parseInt(String(limit)),
        start: (parseInt(String(page)) - 1) * parseInt(String(limit)),
        populate: ['author', 'hashtags', 'image']
      });

      // Get total count for pagination
      // @ts-ignore
      const total = await strapi.entityService.count('api::photo.photo', {
        filters: { status: { $eq: 'pending' } }
      });

      const pendingCount = Array.isArray(photos) ? photos.length : 0;
      console.log(`📸 Found ${pendingCount} pending photos (${total} total)`);
      return { 
        data: photos,
        meta: {
          pagination: {
            page: parseInt(String(page)),
            pageSize: parseInt(String(limit)),
            pageCount: Math.ceil(total / parseInt(String(limit))),
            total: total
          }
        }
      };
    } catch (error) {
      console.error('❌ Error in getPending:', error);
      return ctx.badRequest('Failed to get pending photos: ' + error.message);
    }
  },

  async debugPhoto(ctx) {
    const { id } = ctx.params;
    
    console.log('🔍 ===== PHOTO DEBUG REQUEST =====');
    console.log('🔍 Photo ID:', id);
    
    try {
      // @ts-ignore
      const photo = await strapi.entityService.findOne('api::photo.photo', id, {
        populate: ['author', 'hashtags', 'image']
      });

      if (!photo) {
        console.log('❌ Photo not found:', id);
        return ctx.notFound('Photo not found');
      }

      const debugPhotoAny = /** @type {any} */ (photo);
      // @ts-ignore
      const debugDetails = {
        id: debugPhotoAny.id,
        status: debugPhotoAny.status,
        caption: debugPhotoAny.caption,
        author: debugPhotoAny.author?.username || debugPhotoAny.author,
        uploaded_at: debugPhotoAny.uploaded_at,
        approved_at: debugPhotoAny.approved_at,
        rejected_at: debugPhotoAny.rejected_at,
        rejection_reason: debugPhotoAny.rejection_reason,
        likes: debugPhotoAny.likes,
        views: debugPhotoAny.views,
        featured: debugPhotoAny.featured,
        image: debugPhotoAny.image ? 'Present' : 'Missing'
      };
      console.log('📸 Photo found:', debugDetails);

      // @ts-ignore
      const responseData = /** @type {any} */ ({
        id: debugPhotoAny.id,
        status: debugPhotoAny.status,
        caption: debugPhotoAny.caption,
        uploaded_at: debugPhotoAny.uploaded_at,
        approved_at: debugPhotoAny.approved_at,
        rejected_at: debugPhotoAny.rejected_at,
        rejection_reason: debugPhotoAny.rejection_reason,
        author: debugPhotoAny.author?.username || debugPhotoAny.author,
        likes: debugPhotoAny.likes,
        views: debugPhotoAny.views,
        featured: debugPhotoAny.featured
      });
      return { data: responseData };
    } catch (error) {
      console.error('❌ Error in debugPhoto:', error);
      console.error('❌ Error stack:', error.stack);
      return ctx.badRequest('Failed to get photo debug info: ' + error.message);
    }
  }
}));
