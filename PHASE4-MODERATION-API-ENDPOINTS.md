# Phase 4: Moderation & Workflow API Endpoints

## 🎯 **Phase 4 Complete: Admin Video Moderation System**

The moderation and workflow system is now fully operational with comprehensive API endpoints for admin video curation.

---

## 📊 **Moderation Dashboard Endpoints**

### 1. Get Moderation Statistics
```http
GET /api/featured-videos/moderation/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "pending": 0,
    "active": 3,
    "rejected": 1,
    "total": 4,
    "approval_rate": "75.0"
  },
  "recent_activity": [
    {
      "id": 3,
      "video_id": "HtbeuimTI6U",
      "title": "12 things to do in Bangkok, Thailand",
      "status": "active",
      "moderated_at": "2025-09-13T18:31:27.619Z",
      "moderated_by": "admin"
    }
  ]
}
```

### 2. Get Pending Videos for Review
```http
GET /api/featured-videos/moderation/pending?page=1&pageSize=25&sort=createdAt:desc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "video_id": "YIbbFLRd3cY",
      "title": "Places to visit in Thailand | Ultimate 10 Day Itinerary",
      "thumbnail_url": "https://i.ytimg.com/vi/YIbbFLRd3cY/hqdefault.jpg",
      "channel_name": "Apoorva Rao",
      "status": "pending",
      "description": "",
      "duration": "PT35S",
      "view_count": 808141,
      "like_count": 14254,
      "category": "Travel",
      "video_published_at": "2024-11-04T11:40:49.000Z",
      "createdAt": "2025-09-13T15:21:30.896Z",
      "moderation_reason": null,
      "moderated_at": null,
      "moderated_by": null
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "total": 4,
      "pageCount": 1
    }
  }
}
```

---

## ✅ **Video Approval/Rejection Endpoints**

### 3. Update Single Video Status
```http
PUT /api/featured-videos/moderation/status/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "active",  // or "rejected"
  "reason": "High quality Thailand travel content with good engagement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "video_id": "YIbbFLRd3cY",
    "status": "active",
    "moderation_reason": "High quality Thailand travel content with good engagement",
    "moderated_at": "2025-09-13T18:30:58.921Z",
    "moderated_by": "admin"
  },
  "message": "Video approved successfully"
}
```

### 4. Bulk Update Video Statuses
```http
PUT /api/featured-videos/moderation/bulk-status
Content-Type: application/json
```

**Request Body:**
```json
{
  "videoIds": [5, 3, 8],
  "status": "active",  // or "rejected"
  "reason": "Bulk approval - quality Thailand content"
}
```

**Response:**
```json
{
  "success": true,
  "updated": 3,
  "message": "3 videos approved successfully"
}
```

---

## 🌐 **Frontend Public Endpoints**

### 5. Get Approved Videos (Frontend Safe)
```http
GET /api/featured-videos/approved?page=1&pageSize=12&sort=createdAt:desc&category=Travel&search=thailand
```

**Features:**
- ✅ **Excludes rejected videos** - Only returns `status: 'active'` videos
- ✅ **Category filtering** - Filter by Travel, Food, Nightlife, etc.
- ✅ **Search functionality** - Search in title, description, channel name
- ✅ **Pagination support** - Standard pagination with meta info
- ✅ **Optimized fields** - Returns only frontend-needed fields

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "video_id": "YIbbFLRd3cY",
      "title": "Places to visit in Thailand | Ultimate 10 Day Itinerary",
      "description": "",
      "thumbnail_url": "https://i.ytimg.com/vi/YIbbFLRd3cY/hqdefault.jpg",
      "channel_name": "Apoorva Rao",
      "video_published_at": "2024-11-04T11:40:49.000Z",
      "duration": "PT35S",
      "view_count": 808141,
      "like_count": 14254,
      "category": "Travel",
      "createdAt": "2025-09-13T15:21:30.896Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 3,
      "pageCount": 1
    }
  }
}
```

---

## 🔧 **Video Status Workflow**

### Status Flow:
1. **`pending`** - Newly fetched videos awaiting admin review
2. **`active`** - Approved videos visible on frontend
3. **`rejected`** - Rejected videos excluded from all frontend queries
4. **`archived`** - Archived videos (optional status)

### Moderation Fields:
- `moderation_reason` - Admin's reason for approval/rejection
- `moderated_at` - Timestamp when video was moderated
- `moderated_by` - Admin user who performed the moderation

---

## 🎯 **Integration Examples**

### Admin Dashboard Integration:
```javascript
// Get pending videos for review
const pendingVideos = await fetch('/api/featured-videos/moderation/pending');

// Approve a video
await fetch(`/api/featured-videos/moderation/status/${videoId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'active',
    reason: 'Quality content approved'
  })
});

// Bulk approve multiple videos
await fetch('/api/featured-videos/moderation/bulk-status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoIds: [1, 2, 3],
    status: 'active',
    reason: 'Bulk approval'
  })
});
```

### Frontend Widget Integration:
```javascript
// Get approved videos for frontend display
const approvedVideos = await fetch('/api/featured-videos/approved?pageSize=6&category=Travel');

// Search approved videos
const searchResults = await fetch('/api/featured-videos/approved?search=bangkok&pageSize=10');
```

---

## ✅ **Phase 4 Deliverable Complete**

**Admin can now curate videos easily with:**
- ✅ Comprehensive moderation dashboard endpoints
- ✅ Single and bulk video approval/rejection
- ✅ Detailed moderation statistics and activity tracking
- ✅ Frontend-safe approved videos endpoint
- ✅ Automatic exclusion of rejected videos from public queries
- ✅ Complete audit trail with moderation timestamps and reasons

**Current System Status:**
- **Pending:** 0 videos
- **Active:** 3 videos (visible on frontend)
- **Rejected:** 1 video (excluded from frontend)
- **Approval Rate:** 75.0%

The moderation system is production-ready and fully integrated with the automated video fetching pipeline!
