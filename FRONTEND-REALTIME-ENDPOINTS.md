# 🔄 Real-Time Frontend Endpoints for Updated News

## 🎯 Primary Real-Time Endpoints

### 1. Live News Feed (Recommended for Real-Time Updates)
```javascript
GET /api/breaking-news/live
```
**Features:**
- ✅ Mixed content (news + sponsored posts)
- ✅ Auto-refreshes with latest articles
- ✅ Respects article limits (currently 5 news + 2 sponsored = 7 total)
- ✅ Optimized for frontend consumption

**Usage:**
```javascript
// Fetch every 30 seconds for real-time updates
const fetchLiveNews = async () => {
  const response = await fetch('/api/breaking-news/live');
  return await response.json();
};

// Auto-refresh implementation
setInterval(fetchLiveNews, 30000); // 30 seconds
```

### 2. Pure Breaking News (News Only)
```javascript
GET /api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=20
```
**Features:**
- ✅ Only breaking news articles (no sponsored content)
- ✅ Sorted by creation date (newest first)
- ✅ Configurable pagination
- ✅ Real-time article count updates

**Usage:**
```javascript
// For news-only sections
const fetchPureNews = async (limit = 10) => {
  const response = await fetch(`/api/breaking-news-plural?sort=createdAt:desc&pagination[limit]=${limit}`);
  return await response.json();
};
```

## 🚀 Real-Time Update Strategies

### Strategy 1: Polling (Recommended)
```javascript
class NewsUpdater {
  constructor(endpoint = '/api/breaking-news/live', interval = 30000) {
    this.endpoint = endpoint;
    this.interval = interval;
    this.lastUpdate = null;
    this.articles = [];
  }

  async fetchNews() {
    try {
      const response = await fetch(this.endpoint);
      const data = await response.json();
      
      // Check if content has changed
      const currentUpdate = new Date(data.data[0]?.createdAt || 0);
      if (!this.lastUpdate || currentUpdate > this.lastUpdate) {
        this.articles = data.data;
        this.lastUpdate = currentUpdate;
        this.onUpdate(this.articles);
      }
      
      return data.data;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return this.articles; // Return cached articles on error
    }
  }

  start(callback) {
    this.onUpdate = callback;
    this.fetchNews(); // Initial fetch
    this.intervalId = setInterval(() => this.fetchNews(), this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Usage
const newsUpdater = new NewsUpdater('/api/breaking-news/live', 30000);
newsUpdater.start((articles) => {
  console.log('News updated:', articles.length, 'articles');
  updateUI(articles);
});
```

### Strategy 2: Smart Polling with Timestamps
```javascript
class SmartNewsUpdater {
  constructor() {
    this.lastFetch = localStorage.getItem('lastNewsFetch') || '0';
    this.cache = JSON.parse(localStorage.getItem('newsCache') || '[]');
  }

  async fetchUpdates() {
    try {
      // Fetch only if enough time has passed or cache is empty
      const now = Date.now();
      const timeSinceLastFetch = now - parseInt(this.lastFetch);
      
      if (timeSinceLastFetch < 30000 && this.cache.length > 0) {
        return this.cache; // Use cached data
      }

      const response = await fetch('/api/breaking-news/live');
      const data = await response.json();
      
      // Update cache and timestamp
      this.cache = data.data;
      this.lastFetch = now.toString();
      localStorage.setItem('newsCache', JSON.stringify(this.cache));
      localStorage.setItem('lastNewsFetch', this.lastFetch);
      
      return this.cache;
    } catch (error) {
      console.error('Fetch failed:', error);
      return this.cache; // Fallback to cache
    }
  }
}
```

### Strategy 3: React Hook for Real-Time News
```javascript
import { useState, useEffect, useCallback } from 'react';

export const useRealTimeNews = (interval = 30000) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/breaking-news/live');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setNews(data.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(); // Initial fetch
    
    const intervalId = setInterval(fetchNews, interval);
    
    return () => clearInterval(intervalId);
  }, [fetchNews, interval]);

  return { 
    news, 
    loading, 
    error, 
    lastUpdate, 
    refetch: fetchNews 
  };
};

// Usage in component
function NewsComponent() {
  const { news, loading, error, lastUpdate } = useRealTimeNews(30000);
  
  if (loading) return <div>Loading news...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Last updated: {lastUpdate?.toLocaleTimeString()}</p>
      {news.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}
```

## 📊 System Configuration Endpoints

### Get Current Article Limit
```javascript
GET /api/news-settings
```
**Use for:** Displaying system limits, configuring pagination

```javascript
const getSystemLimits = async () => {
  const response = await fetch('/api/news-settings');
  const data = await response.json();
  return data.data.maxArticleLimit; // Currently 12
};
```

### Check System Status
```javascript
// Combined status check
const getSystemStatus = async () => {
  const [settings, news] = await Promise.all([
    fetch('/api/news-settings').then(r => r.json()),
    fetch('/api/breaking-news-plural').then(r => r.json())
  ]);
  
  return {
    maxLimit: settings.data.maxArticleLimit,
    currentCount: news.data.length,
    availableSlots: settings.data.maxArticleLimit - news.data.length
  };
};
```

## ⚡ Performance Optimizations

### 1. Conditional Requests
```javascript
class OptimizedNewsUpdater {
  constructor() {
    this.etag = null;
    this.lastModified = null;
  }

  async fetchNews() {
    const headers = {};
    if (this.etag) headers['If-None-Match'] = this.etag;
    if (this.lastModified) headers['If-Modified-Since'] = this.lastModified;

    const response = await fetch('/api/breaking-news/live', { headers });
    
    if (response.status === 304) {
      return null; // No changes
    }
    
    this.etag = response.headers.get('ETag');
    this.lastModified = response.headers.get('Last-Modified');
    
    return await response.json();
  }
}
```

### 2. Background Sync with Service Worker
```javascript
// service-worker.js
self.addEventListener('sync', event => {
  if (event.tag === 'news-sync') {
    event.waitUntil(syncNews());
  }
});

async function syncNews() {
  try {
    const response = await fetch('/api/breaking-news/live');
    const data = await response.json();
    
    // Store in IndexedDB for offline access
    const db = await openDB('news-cache');
    await db.put('news', data.data, 'latest');
    
    // Notify main thread
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'NEWS_UPDATED', data: data.data });
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
```

## 🎯 Recommended Implementation

**For Homepage/Main Feed:**
```javascript
// Use live endpoint with 30-second polling
const newsUpdater = new NewsUpdater('/api/breaking-news/live', 30000);
```

**For News-Only Sections:**
```javascript
// Use pure news endpoint with 60-second polling
const newsUpdater = new NewsUpdater('/api/breaking-news-plural?sort=createdAt:desc', 60000);
```

**For Mobile Apps:**
```javascript
// Use smart caching with longer intervals
const newsUpdater = new SmartNewsUpdater();
setInterval(() => newsUpdater.fetchUpdates(), 60000); // 1 minute
```

## 📱 Current System Behavior

- **News Scheduler**: Fetches new articles every 5 minutes
- **Article Limit**: 12 articles maximum (currently 5 active)
- **Auto-Cleanup**: Triggers when limits are exceeded
- **Live Endpoint**: Returns 5 news + 2 sponsored = 7 total items
- **Update Frequency**: New articles appear within 5-10 minutes of publication

## 🔄 Real-Time Update Timeline

1. **RSS Sources**: Checked every 5 minutes by scheduler
2. **New Articles**: Created immediately when found
3. **API Updates**: Available instantly after creation
4. **Frontend Polling**: Recommended every 30-60 seconds
5. **User Sees Updates**: Within 30-60 seconds of polling

This setup ensures your frontend always displays the most current news while maintaining optimal performance and respecting system limits.
