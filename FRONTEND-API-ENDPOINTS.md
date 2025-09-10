# 📡 Breaking News API Endpoints for Frontend

## 🔥 Primary Endpoints

### Get All Breaking News
```javascript
// Basic fetch
GET /api/breaking-news-plural

// With pagination and sorting
GET /api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=20&pagination[start]=0

// With full data population
GET /api/breaking-news-plural?populate=*&sort=voteScore:desc
```

### Get Single Breaking News Article
```javascript
GET /api/breaking-news-plural/{documentId}
GET /api/breaking-news-plural/{documentId}?populate=*
```

## 🎯 Frontend-Optimized Endpoints

### Live News Feed (Frontend Consumption) - WITH SPONSORED CONTENT
```javascript
// Optimized for frontend display - includes sponsored posts automatically inserted
GET /api/breaking-news/live

// Response includes both news and sponsored content:
{
  "data": [
    {
      "id": 1,
      "title": "Breaking News Article",
      "type": "news",
      "isBreaking": true,
      // ... news fields
    },
    {
      "id": 2,
      "title": "Sponsored Content",
      "type": "sponsored",
      "sponsorName": "Singha Beer",
      "sponsorLogo": "sponsor-logo-url",
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

### Dashboard View (Admin/Moderation)
```javascript
// All articles with moderation info
GET /api/breaking-news/dashboard

// Filter by status
GET /api/breaking-news/dashboard?status=pending
GET /api/breaking-news/dashboard?status=approved&sort=voteScore:desc
```

## 🎯 Sponsored Content Endpoints

### Sponsored Posts Management
```javascript
// Get all active sponsored posts
GET /api/sponsored-posts?filters[IsActive][$eq]=true

// Create new sponsored post (Admin only)
POST /api/sponsored-posts
{
  "data": {
    "Title": "Sponsored Content Title",
    "Summary": "Brief description",
    "SponsorName": "Singha Beer",
    "TargetURL": "https://sponsor.com",
    "IsActive": true,
    "Priority": 1,
    "DisplayPosition": "position-3", // top, position-3, position-5, bottom
    "CampaignStartDate": "2024-01-01T00:00:00.000Z",
    "CampaignEndDate": "2024-02-01T00:00:00.000Z"
  }
}
```

### Breaking News Widget Sponsorship
```javascript
// Get widget sponsorship config
GET /api/breaking-news/widget-config/{id}

// Update widget sponsorship (Admin only)
PUT /api/breaking-news/widget-config/{id}
{
  "isSponsoredWidget": true,
  "sponsorName": "Singha Beer"
  // Auto-generates banner: "Latest Updates, brought to you by Singha Beer"
}
```

## 🗳️ Interactive Endpoints

### Voting System
```javascript
// Upvote an article
POST /api/breaking-news/{documentId}/upvote

// Downvote an article  
POST /api/breaking-news/{documentId}/downvote
```

### Pinning System
```javascript
// Pin article (admin/editor)
POST /api/breaking-news/{documentId}/pin

// Unpin article
POST /api/breaking-news/{documentId}/unpin
```

## 🛠️ Moderation Endpoints

### Article Management
```javascript
// Hide article from public view
POST /api/breaking-news/{documentId}/hide

// Approve pending article
POST /api/breaking-news/{documentId}/approve

// Reject article
POST /api/breaking-news/{documentId}/reject
```

## 📊 Supporting Content Types

### News Sources
```javascript
// Get all news sources
GET /api/news-sources

// Get active sources only
GET /api/news-sources?filters[isActive][$eq]=true
```

### Widget Control (Frontend Customization)
```javascript
// Get widget settings
GET /api/widget-controls

// Update widget settings (admin)
PUT /api/widget-controls/{id}
```

### Sponsored Posts (Monetization)
```javascript
// Get active sponsored posts
GET /api/sponsored-posts?filters[isActive][$eq]=true

// Get by placement
GET /api/sponsored-posts?filters[placement][$eq]=top
```

## 🚀 Frontend Integration Examples

### React/Next.js Example
```javascript
// Fetch breaking news for homepage
const fetchBreakingNews = async () => {
  try {
    const response = await fetch('https://api.pattaya1.com/api/breaking-news/live?limit=10');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Vote on article
const voteOnArticle = async (articleId, voteType) => {
  try {
    const response = await fetch(`https://api.pattaya1.com/api/breaking-news/${articleId}/${voteType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error voting:', error);
    return false;
  }
};
```

### Vue.js Example
```javascript
// Composable for breaking news
export const useBreakingNews = () => {
  const news = ref([]);
  const loading = ref(false);

  const fetchNews = async (filters = {}) => {
    loading.value = true;
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`https://api.pattaya1.com/api/breaking-news/live?${params}`);
      const data = await response.json();
      news.value = data.data;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loading.value = false;
    }
  };

  return { news, loading, fetchNews };
};
```

## 🔒 Authentication Notes

- **Public endpoints**: `/live`, `/breaking-news-plural` (read-only)
- **Voting**: No auth required (anonymous voting allowed)
- **Moderation**: Requires admin/editor authentication
- **Widget/Sponsored**: Admin authentication required

## 📱 Response Format

All endpoints return data in this format:
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "attributes": {
        "Title": "Breaking News Title",
        "Summary": "News summary...",
        "Category": "Technology",
        "Source": "TechCrunch",
        "URL": "https://...",
        "IsBreaking": true,
        "isPinned": false,
        "voteScore": 15,
        "upvotes": 18,
        "downvotes": 3,
        "moderationStatus": "approved",
        "isHidden": false,
        "PublishedTimestamp": "2024-01-01T12:00:00.000Z",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:05:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 8
    }
  }
}
```

## 🎯 Recommended Frontend Usage

1. **Homepage**: Use `/api/breaking-news/live?limit=5&sort=voteScore:desc`
2. **News Feed**: Use `/api/breaking-news/live` with pagination
3. **Breaking News Banner**: Filter by `isBreaking=true` and `isPinned=true`
4. **Admin Dashboard**: Use `/api/breaking-news/dashboard`
5. **Article Detail**: Use `/api/breaking-news-plural/{documentId}?populate=*`
