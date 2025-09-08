# Frontend-Backend Connection Setup

## Step 1: Configure Your Frontend Environment

### Add to your frontend `.env` file:
```env
# React/Next.js
REACT_APP_API_URL=https://api.pattaya1.com/api
NEXT_PUBLIC_API_URL=https://api.pattaya1.com/api

# Vue/Nuxt
VUE_APP_API_URL=https://api.pattaya1.com/api
NUXT_PUBLIC_API_URL=https://api.pattaya1.com/api

# Vite
VITE_API_URL=https://api.pattaya1.com/api

# Angular
NG_APP_API_URL=https://api.pattaya1.com/api
```

## Step 2: Install HTTP Client (if needed)
```bash
# For React/Vue
npm install axios

# For Angular (already has HttpClient)
# No additional installation needed
```

## Step 3: Create API Service

### React/Next.js Implementation:
```javascript
// services/newsService.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://api.pattaya1.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const newsService = {
  // Get live breaking news (approved articles)
  getLiveNews: () => api.get('/breaking-news/live'),
  
  // Get all breaking news for admin dashboard
  getDashboard: () => api.get('/breaking-news/dashboard'),
  
  // Get specific article
  getArticle: (id) => api.get(`/breaking-news/${id}`),
  
  // Admin actions
  pinArticle: (id) => api.post(`/breaking-news/${id}/pin`),
  unpinArticle: (id) => api.post(`/breaking-news/${id}/unpin`),
  upvoteArticle: (id) => api.post(`/breaking-news/${id}/upvote`),
  downvoteArticle: (id) => api.post(`/breaking-news/${id}/downvote`),
  approveArticle: (id) => api.post(`/breaking-news/${id}/approve`),
  rejectArticle: (id) => api.post(`/breaking-news/${id}/reject`),
  hideArticle: (id) => api.post(`/breaking-news/${id}/hide`),
  
  // Manual news fetch
  fetchNews: () => api.post('/breaking-news/fetch-news'),
  
  // News sources management
  getNewsSources: () => api.get('/news-sources'),
  createNewsSource: (data) => api.post('/news-sources', { data }),
  updateNewsSource: (id, data) => api.put(`/news-sources/${id}`, { data }),
  deleteNewsSource: (id) => api.delete(`/news-sources/${id}`),
  
  // Global settings
  getSettings: () => api.get('/news-settings'),
  updateSettings: (data) => api.put('/news-settings', { data }),
};
```

### Vue.js Composable:
```javascript
// composables/useNews.js
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.pattaya1.com/api'

export function useNews() {
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)

  const pinnedArticles = computed(() => 
    articles.value.filter(article => article.isPinned)
  )

  const approvedArticles = computed(() =>
    articles.value.filter(article => article.moderationStatus === 'approved')
  )

  const fetchLiveNews = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_BASE}/breaking-news/live`)
      articles.value = response.data.data || []
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch news:', err)
    } finally {
      loading.value = false
    }
  }

  const pinArticle = async (id) => {
    try {
      await axios.post(`${API_BASE}/breaking-news/${id}/pin`)
      await fetchLiveNews() // Refresh data
    } catch (err) {
      error.value = err.message
    }
  }

  const voteArticle = async (id, type) => {
    try {
      await axios.post(`${API_BASE}/breaking-news/${id}/${type}`)
      await fetchLiveNews() // Refresh data
    } catch (err) {
      error.value = err.message
    }
  }

  return {
    articles,
    loading,
    error,
    pinnedArticles,
    approvedArticles,
    fetchLiveNews,
    pinArticle,
    voteArticle
  }
}
```

## Step 4: Component Examples

### React Component:
```jsx
// components/BreakingNews.jsx
import React, { useState, useEffect } from 'react';
import { newsService } from '../services/newsService';

const BreakingNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
    try {
      const response = await newsService.getLiveNews();
      setArticles(response.data.data || []);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (id) => {
    try {
      await newsService.pinArticle(id);
      loadNews(); // Refresh
    } catch (error) {
      console.error('Failed to pin article:', error);
    }
  };

  if (loading) return <div>Loading breaking news...</div>;

  return (
    <div className="breaking-news">
      <h2>Breaking News</h2>
      {articles.map(article => (
        <div key={article.id} className={`article ${article.isPinned ? 'pinned' : ''}`}>
          <h3>{article.Title}</h3>
          <p>{article.Description}</p>
          <div className="meta">
            <span>Source: {article.apiSource}</span>
            <span>Votes: ↑{article.upvotes} ↓{article.downvotes}</span>
            {article.isPinned && <span className="pin-badge">📌 Pinned</span>}
          </div>
          <div className="actions">
            <button onClick={() => handlePin(article.id)}>
              {article.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <a href={article.URL} target="_blank" rel="noopener noreferrer">
              Read More
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BreakingNews;
```

## Step 5: Test Connection
Run this in your frontend project:

```javascript
// Quick connection test
fetch('https://api.pattaya1.com/api/breaking-news/live')
  .then(response => response.json())
  .then(data => console.log('Backend connected:', data))
  .catch(error => console.error('Connection failed:', error));
```

## Backend URLs Available:
- **Strapi Admin**: https://api.pattaya1.com/admin
- **API Base**: https://api.pattaya1.com/api
- **Breaking News**: https://api.pattaya1.com/api/breaking-news
- **Live Feed**: https://api.pattaya1.com/api/breaking-news/live
- **Dashboard**: https://api.pattaya1.com/api/breaking-news/dashboard

## Next Steps:
1. Start your frontend development server
2. Add the API service to your frontend
3. Create components to display breaking news
4. Test the connection using the examples above
5. Implement real-time polling or WebSocket for live updates
