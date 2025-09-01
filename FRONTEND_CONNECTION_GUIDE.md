# 🔧 Frontend Connection Fix Guide

## Current Issue
Your frontend shows "No news available" because:
- Backend endpoints return 404/403 errors
- Content types need admin setup
- Permissions need configuration

## Quick Fix Steps

### 1. Access Strapi Admin
Open: http://localhost:1337/admin
- Create admin user if needed
- Login to admin panel

### 2. Set Up Content Types
In admin panel, go to:
- **Content-Type Builder** → Verify these exist:
  - Breaking News ✓
  - News Sources ✓ 
  - News Settings ✓

### 3. Configure Permissions
Go to **Settings** → **Users & Permissions** → **Roles** → **Public**:

Enable these permissions:
```
Breaking News:
✓ find (GET /api/breaking-news)
✓ findOne (GET /api/breaking-news/:id)

News Articles: 
✓ find (GET /api/news-articles)
✓ findOne (GET /api/news-articles/:id)

News Sources:
✓ find (GET /api/news-sources)

News Settings:
✓ find (GET /api/news-settings)
```

### 4. Add Sample Data
In admin panel:
- **Content Manager** → **Breaking News** → **Create New Entry**
- Use data from `data/test-news-data.json`

### 5. Test Connection
```bash
# Test in terminal
curl "http://localhost:1337/api/breaking-news"

# Should return JSON data instead of 404
```

### 6. Frontend API Call
In your frontend, use:
```javascript
// Replace your current API call with:
const response = await fetch('http://localhost:1337/api/breaking-news');
const data = await response.json();
console.log('News data:', data.data);
```

## Alternative: Manual News Fetch
If no data exists, trigger manual fetch:
```bash
curl -X POST "http://localhost:1337/api/breaking-news/fetch-news"
```

## Debug Your Frontend
Add this to your frontend component:
```javascript
useEffect(() => {
  fetch('http://localhost:1337/api/breaking-news')
    .then(res => {
      console.log('Response status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('API Response:', data);
      if (data.data) {
        setNews(data.data);
      }
    })
    .catch(err => console.error('API Error:', err));
}, []);
```
