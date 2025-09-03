# 🆕 New API Endpoints - Sponsored Content System

## 📋 Overview
Here are all the NEW API endpoints added for the sponsored content system:

## 🎯 Sponsored Posts Management

### 1. Get All Sponsored Posts
```http
GET /api/sponsored-posts
```
**Query Parameters:**
- `filters[IsActive][$eq]=true` - Get only active sponsored posts
- `filters[DisplayPosition][$eq]=position-3` - Filter by position
- `sort=Priority:asc` - Sort by priority
- `populate=*` - Include all media fields

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "Title": "Sponsored Content Title",
      "Summary": "Brief description...",
      "SponsorName": "Singha Beer",
      "TargetURL": "https://sponsor.com",
      "IsActive": true,
      "Priority": 1,
      "DisplayPosition": "position-3",
      "CampaignStartDate": "2024-01-01T00:00:00.000Z",
      "CampaignEndDate": "2024-02-01T00:00:00.000Z",
      "ClickCount": 0,
      "ImpressionCount": 0,
      "Budget": 1000.00,
      "CostPerClick": 0.50,
      "Image": { "url": "image-url" },
      "SponsorLogo": { "url": "logo-url" },
      "Logo": { "url": "additional-logo-url" }
    }
  ]
}
```

### 2. Create Sponsored Post
```http
POST /api/sponsored-posts
```
**Request Body:**
```json
{
  "data": {
    "Title": "Amazing Thailand Tours",
    "Summary": "Experience premium tour packages...",
    "SponsorName": "Singha Beer",
    "TargetURL": "https://sponsor.com/tours",
    "IsActive": true,
    "Priority": 1,
    "DisplayPosition": "position-3",
    "CampaignStartDate": "2024-01-01T00:00:00.000Z",
    "CampaignEndDate": "2024-02-01T00:00:00.000Z",
    "Budget": 1000.00,
    "CostPerClick": 0.50,
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update Sponsored Post
```http
PUT /api/sponsored-posts/{id}
```

### 4. Delete Sponsored Post
```http
DELETE /api/sponsored-posts/{id}
```

### 5. Get Single Sponsored Post
```http
GET /api/sponsored-posts/{id}?populate=*
```

## 🏠 Widget Sponsorship Configuration

### 6. Get Widget Sponsorship Config
```http
GET /api/breaking-news/widget-config/{id}
```
**Response:**
```json
{
  "data": {
    "id": 1,
    "isSponsoredWidget": true,
    "sponsorName": "Singha Beer",
    "sponsorBanner": "Latest Updates, brought to you by Singha Beer"
  }
}
```

### 7. Update Widget Sponsorship Config
```http
PUT /api/breaking-news/widget-config/{id}
```
**Request Body:**
```json
{
  "isSponsoredWidget": true,
  "sponsorName": "Singha Beer"
}
```
**Auto-generates banner:** "Latest Updates, brought to you by {sponsorName}"

## 📊 Analytics & Tracking (Future Implementation)

### 8. Track Sponsored Click
```http
POST /api/sponsored-posts/{id}/track-click
```
**Request Body:**
```json
{
  "event": "click",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 9. Track Sponsored Impression
```http
POST /api/sponsored-posts/{id}/track-impression
```
**Request Body:**
```json
{
  "event": "impression",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔄 Modified Existing Endpoints

### Enhanced Live Feed (MODIFIED)
```http
GET /api/breaking-news/live
```
**NEW Response Structure:**
```json
{
  "data": [
    {
      "type": "news",
      "id": 1,
      "title": "Breaking News...",
      // ... existing news fields
    },
    {
      "type": "sponsored",
      "id": 2,
      "title": "Sponsored Content...",
      "sponsorName": "Singha Beer",
      "sponsorLogo": "logo-url",
      "logo": "additional-logo-url",
      "displayPosition": "position-3",
      // ... sponsored fields
    }
  ],
  "meta": {
    "total": 25,
    "newsCount": 22,
    "sponsoredCount": 3,
    "breakingCount": 5
  }
}
```

## 🔐 Permissions Required

### Public Access:
- `GET /api/breaking-news/live` (includes sponsored content)

### Admin/Editor Access:
- All `/api/sponsored-posts/*` endpoints
- `/api/breaking-news/widget-config/*` endpoints
- Analytics tracking endpoints

## 🎯 Key Features

### Automatic Integration:
- Sponsored posts automatically appear in `/api/breaking-news/live`
- No separate API calls needed for frontend
- Position-based insertion (top, position-3, position-5, bottom)

### Campaign Management:
- Start/end date filtering
- Active/inactive status control
- Priority-based ordering
- Budget and cost tracking

### Multi-Logo Support:
- **Image**: Main content image
- **SponsorLogo**: Primary sponsor branding
- **Logo**: Additional logo for campaigns

### Widget Sponsorship:
- Per-widget sponsorship configuration
- Auto-generated sponsor banners
- Homepage editor integration

## 🚀 Implementation Status

✅ **Ready for Production:**
- All sponsored post CRUD operations
- Widget sponsorship configuration
- Automatic feed integration
- Multi-logo support

🔄 **Future Enhancements:**
- Click/impression tracking endpoints
- Advanced analytics dashboard
- A/B testing for sponsored content
- Automated campaign optimization
