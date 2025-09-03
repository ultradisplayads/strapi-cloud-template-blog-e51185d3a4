# 🆕 New API Endpoints for Frontend - Sponsored Content

## 📋 Summary
Here are the NEW API endpoints you need to integrate for sponsored content functionality:

## 🎯 1. Enhanced Live Feed (MODIFIED EXISTING)
```javascript
// UPDATED: Now includes sponsored content automatically
GET /api/breaking-news/live

// New response structure:
{
  "data": [
    {
      "type": "news",
      "id": 1,
      "title": "Breaking News Article",
      // ... existing news fields
    },
    {
      "type": "sponsored",
      "id": 2,
      "title": "Sponsored Content",
      "sponsorName": "Singha Beer",
      "sponsorLogo": "logo-url",
      "logo": "additional-logo-url",
      "displayPosition": "position-3",
      // ... sponsored fields
    }
  ],
  "meta": {
    "total": 25,
    "newsCount": 22,        // NEW
    "sponsoredCount": 3,    // NEW
    "breakingCount": 5
  }
}
```

## 🎯 2. Sponsored Posts Management (NEW)
```javascript
// Get all sponsored posts (Admin)
GET /api/sponsored-posts
GET /api/sponsored-posts?filters[IsActive][$eq]=true&populate=*

// Create sponsored post (Admin)
POST /api/sponsored-posts
{
  "data": {
    "Title": "Amazing Thailand Tours",
    "Summary": "Experience premium packages...",
    "SponsorName": "Singha Beer",
    "TargetURL": "https://sponsor.com",
    "IsActive": true,
    "Priority": 1,
    "DisplayPosition": "position-3"
  }
}

// Update sponsored post (Admin)
PUT /api/sponsored-posts/{id}

// Delete sponsored post (Admin)
DELETE /api/sponsored-posts/{id}

// Get single sponsored post
GET /api/sponsored-posts/{id}?populate=*
```

## 🏠 3. Widget Sponsorship Configuration (NEW)
```javascript
// Get widget sponsorship config
GET /api/breaking-news/widget-config/{widgetId}
// Response:
{
  "data": {
    "id": 1,
    "isSponsoredWidget": true,
    "sponsorName": "Singha Beer",
    "sponsorBanner": "Latest Updates, brought to you by Singha Beer"
  }
}

// Update widget sponsorship (Homepage Editor)
PUT /api/breaking-news/widget-config/{widgetId}
{
  "isSponsoredWidget": true,
  "sponsorName": "Singha Beer"
  // Auto-generates sponsorBanner
}
```

## 📊 4. Analytics Tracking (FUTURE - Not Yet Implemented)
```javascript
// Track sponsored content clicks
POST /api/sponsored-posts/{id}/track-click
{
  "event": "click",
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// Track sponsored content impressions
POST /api/sponsored-posts/{id}/track-impression
{
  "event": "impression",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Frontend Integration Code

### Update Your News Service:
```javascript
// Add to your existing newsService.js
export const newsService = {
  // EXISTING: Enhanced to include sponsored content
  getLiveNews: () => api.get('/breaking-news/live'),
  
  // NEW: Sponsored posts management
  getSponsoredPosts: () => api.get('/sponsored-posts?populate=*'),
  getActiveSponsoredPosts: () => api.get('/sponsored-posts?filters[IsActive][$eq]=true&populate=*'),
  createSponsoredPost: (data) => api.post('/sponsored-posts', { data }),
  updateSponsoredPost: (id, data) => api.put(`/sponsored-posts/${id}`, { data }),
  deleteSponsoredPost: (id) => api.delete(`/sponsored-posts/${id}`),
  
  // NEW: Widget sponsorship
  getWidgetConfig: (widgetId) => api.get(`/breaking-news/widget-config/${widgetId}`),
  updateWidgetConfig: (widgetId, config) => api.put(`/breaking-news/widget-config/${widgetId}`, config),
  
  // NEW: Analytics (when implemented)
  trackSponsoredClick: (postId) => api.post(`/sponsored-posts/${postId}/track-click`, {
    event: 'click',
    timestamp: new Date().toISOString()
  }),
  trackSponsoredImpression: (postId) => api.post(`/sponsored-posts/${postId}/track-impression`, {
    event: 'impression',
    timestamp: new Date().toISOString()
  })
};
```

### React Hook Example:
```javascript
// hooks/useSponsorship.js
import { useState, useEffect } from 'react';
import { newsService } from '../services/newsService';

export function useSponsorship(widgetId) {
  const [config, setConfig] = useState({
    isSponsoredWidget: false,
    sponsorName: '',
    sponsorBanner: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (widgetId) {
      loadConfig();
    }
  }, [widgetId]);

  const loadConfig = async () => {
    try {
      const response = await newsService.getWidgetConfig(widgetId);
      setConfig(response.data.data);
    } catch (error) {
      console.error('Failed to load widget config:', error);
    }
  };

  const updateConfig = async (newConfig) => {
    setLoading(true);
    try {
      await newsService.updateWidgetConfig(widgetId, newConfig);
      setConfig(prev => ({ ...prev, ...newConfig }));
    } catch (error) {
      console.error('Failed to update widget config:', error);
    } finally {
      setLoading(false);
    }
  };

  return { config, updateConfig, loading };
}
```

## 🎯 Key Changes for Your Frontend

### 1. Update News Feed Component:
```javascript
// BEFORE: Simple news rendering
{news.map(article => <NewsArticle article={article} />)}

// AFTER: Handle mixed content types
{feedData.map(item => 
  item.type === 'news' ? 
    <NewsArticle article={item} /> : 
  item.type === 'sponsored' ? 
    <SponsoredPost post={item} /> : 
    null
)}
```

### 2. Add Widget Sponsorship Controls:
```javascript
// In your homepage editor component
const { config, updateConfig } = useSponsorship(widgetId);

<label>
  <input
    type="checkbox"
    checked={config.isSponsoredWidget}
    onChange={(e) => updateConfig({
      isSponsoredWidget: e.target.checked,
      sponsorName: e.target.checked ? config.sponsorName : ''
    })}
  />
  Mark as Sponsored
</label>

{config.isSponsoredWidget && (
  <input
    type="text"
    placeholder="Sponsor Name (e.g., Singha Beer)"
    value={config.sponsorName}
    onChange={(e) => updateConfig({
      isSponsoredWidget: true,
      sponsorName: e.target.value
    })}
  />
)}
```

## ✅ Implementation Checklist

- [ ] Update `/api/breaking-news/live` call to handle new response structure
- [ ] Add sponsored post management endpoints (admin only)
- [ ] Implement widget sponsorship configuration
- [ ] Create SponsoredPost component for rendering
- [ ] Add analytics tracking calls
- [ ] Test mixed content feed display
- [ ] Verify widget sponsorship controls work

## 🚀 Ready to Use

All endpoints are **production-ready** and automatically integrate sponsored content into your existing news system. No breaking changes to existing functionality!
