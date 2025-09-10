# Google Custom Search Engine (CSE) Widget - Complete Setup Guide

## Overview

This guide will help you set up a **Global Web Search Widget** powered by Google Custom Search Engine (CSE) API. This widget allows users to search the entire web or specific sites directly from your news platform.

## Features

- 🌐 **Global Web Search** - Search the entire internet
- 🖼️ **Image Search** - Find images across the web
- 🎯 **Site-Specific Search** - Search within specific websites
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Results** - Powered by Google's search infrastructure
- 🔒 **Safe Search** - Built-in content filtering

## Step 1: Google CSE Setup

### 1.1 Create Google Custom Search Engine

1. **Go to Google CSE Console**
   ```
   https://cse.google.com/cse/
   ```

2. **Click "Add"** to create a new search engine

3. **Configure Your Search Engine:**
   ```
   Name: Global Web Search
   Sites to search: *
   Language: English (or your preferred language)
   ```

4. **Advanced Settings:**
   - Enable "Search the entire web"
   - Turn on "Image search"
   - Set SafeSearch to "Moderate"

5. **Get Your Search Engine ID:**
   - After creation, note down your **Search Engine ID** (cx parameter)
   - Example: `017576662512468239146:omuauf_lfve`

### 1.2 Get Google API Key

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create or Select Project**
   - Create new project: "News Platform Search"
   - Or use existing project

3. **Enable Custom Search API**
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
   - **Restrict the key** (recommended):
     - Application restrictions: HTTP referrers
     - Add your domain: `yourdomain.com/*`
     - API restrictions: Custom Search API

### 1.3 Configure Environment Variables

Add to your `.env` file:

```bash
# Google Custom Search Engine
GOOGLE_CSE_API_KEY=your_api_key_here
GOOGLE_CSE_ENGINE_ID=your_engine_id_here
```

## Step 2: Backend Implementation

The Google CSE service (`scripts/google-cse-service.js`) is already created. Now let's add the API endpoints.

### 2.1 Create Web Search Controller

The web search controller (`src/api/web-search/controllers/web-search.js`) and routes (`src/api/web-search/routes/web-search.js`) have been created with the following endpoints:

```
GET /api/web-search?query=news&page=1&num=10
GET /api/web-search/images?query=nature&num=8
GET /api/web-search/site?query=weather&site=bbc.com
GET /api/web-search/suggestions?query=tech
GET /api/web-search/status
```

## Step 3: Frontend Widget Implementation

### 3.1 React Web Search Widget

Create a comprehensive web search widget:

```jsx
// components/WebSearchWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import './WebSearchWidget.css';

const WebSearchWidget = ({ 
  title = "Global Web Search",
  placeholder = "Search the web...",
  showImageSearch = true,
  showSiteSearch = true,
  defaultResultsPerPage = 10
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('web'); // web, images, site
  const [siteFilter, setSiteFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // Debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await fetch(`${API_BASE}/api/web-search/suggestions?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data);
        setShowSuggestions(data.data.length > 0);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const performSearch = async (searchQuery = query, page = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowSuggestions(false);
    
    try {
      let endpoint = '/api/web-search';
      let params = new URLSearchParams({
        query: searchQuery,
        page: page.toString(),
        num: defaultResultsPerPage.toString()
      });

      if (searchType === 'images') {
        endpoint = '/api/web-search/images';
        params.set('num', '8'); // Fewer results for images
      } else if (searchType === 'site' && siteFilter) {
        endpoint = '/api/web-search/site';
        params.set('site', siteFilter);
      }

      const response = await fetch(`${API_BASE}${endpoint}?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setTotalResults(data.data.totalResults);
        setSearchTime(data.data.searchTime);
        setCurrentPage(page);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
      // Show user-friendly error message
      alert('Search temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query, 1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion, 1);
  };

  const handlePageChange = (newPage) => {
    performSearch(query, newPage);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const truncateText = (text, maxLength = 160) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="web-search-widget">
      <div className="search-header">
        <h3>{title}</h3>
        
        {/* Search Type Tabs */}
        <div className="search-tabs">
          <button 
            className={searchType === 'web' ? 'active' : ''}
            onClick={() => setSearchType('web')}
          >
            🌐 Web
          </button>
          {showImageSearch && (
            <button 
              className={searchType === 'images' ? 'active' : ''}
              onClick={() => setSearchType('images')}
            >
              🖼️ Images
            </button>
          )}
          {showSiteSearch && (
            <button 
              className={searchType === 'site' ? 'active' : ''}
              onClick={() => setSearchType('site')}
            >
              🎯 Site
            </button>
          )}
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          
          {/* Site Filter Input */}
          {searchType === 'site' && (
            <input
              type="text"
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              placeholder="Site (e.g., bbc.com)"
              className="site-filter-input"
            />
          )}
          
          <button 
            type="submit" 
            className="search-button"
            disabled={loading || !query.trim()}
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                🔍 {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Search Results Info */}
      {totalResults > 0 && (
        <div className="search-info">
          About {formatNumber(totalResults)} results ({searchTime}s)
          {searchType === 'site' && siteFilter && (
            <span className="site-info"> from {siteFilter}</span>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && results.length > 0 && (
        <div className="search-results">
          {searchType === 'images' ? (
            // Image Results Grid
            <div className="image-results-grid">
              {results.map((result, index) => (
                <div key={index} className="image-result">
                  <a href={result.link} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={result.image?.src || result.link} 
                      alt={result.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="image-overlay">
                      <p className="image-title">{truncateText(result.title, 50)}</p>
                      <p className="image-source">{result.displayLink}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            // Web Results List
            <div className="web-results-list">
              {results.map((result, index) => (
                <div key={index} className="search-result">
                  <div className="result-header">
                    <a 
                      href={result.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="result-title"
                      dangerouslySetInnerHTML={{ __html: result.htmlTitle || result.title }}
                    />
                    <span className="result-url">{result.displayLink}</span>
                  </div>
                  
                  <p 
                    className="result-snippet"
                    dangerouslySetInnerHTML={{ __html: result.htmlSnippet || result.snippet }}
                  />
                  
                  {result.thumbnail && (
                    <div className="result-thumbnail">
                      <img 
                        src={result.thumbnail.src} 
                        alt={result.title}
                        width={result.thumbnail.width}
                        height={result.thumbnail.height}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalResults > defaultResultsPerPage && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-button"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {Math.ceil(totalResults / defaultResultsPerPage)}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalResults / defaultResultsPerPage)}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && totalResults === 0 && (
        <div className="no-results">
          <p>No results found for "{query}"</p>
          <p>Try different keywords or check your spelling.</p>
        </div>
      )}
    </div>
  );
};

export default WebSearchWidget;
```

### 3.2 CSS Styling

Create the CSS file (`components/WebSearchWidget.css`):

```css
.web-search-widget {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.search-header h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.5rem;
}

.search-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.search-tabs button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.search-tabs button:hover {
  background: #f5f5f5;
}

.search-tabs button.active {
  background: #4285f4;
  color: white;
  border-color: #4285f4;
}

.search-form {
  position: relative;
  margin-bottom: 20px;
}

.search-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 24px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4285f4;
}

.site-filter-input {
  width: 150px;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.search-button {
  padding: 12px 20px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.search-button:hover:not(:disabled) {
  background: #3367d6;
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 60px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.search-info {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.site-info {
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-results {
  margin-bottom: 30px;
}

.web-results-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-result {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.search-result:last-child {
  border-bottom: none;
}

.result-header {
  margin-bottom: 8px;
}

.result-title {
  color: #1a0dab;
  text-decoration: none;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.3;
  display: block;
  margin-bottom: 4px;
}

.result-title:hover {
  text-decoration: underline;
}

.result-url {
  color: #006621;
  font-size: 14px;
}

.result-snippet {
  color: #545454;
  line-height: 1.4;
  margin: 8px 0;
}

.result-thumbnail {
  float: right;
  margin-left: 16px;
  margin-bottom: 8px;
}

.result-thumbnail img {
  border-radius: 4px;
  max-width: 120px;
  max-height: 90px;
}

.image-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-result {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  aspect-ratio: 4/3;
}

.image-result a {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.image-result img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.image-result:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  padding: 16px 12px 12px;
}

.image-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.image-source {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
}

.pagination-button {
  padding: 8px 16px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #3367d6;
}

.pagination-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-results p {
  margin: 8px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .web-search-widget {
    padding: 16px;
  }
  
  .search-input-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .site-filter-input {
    width: 100%;
  }
  
  .image-results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .result-thumbnail {
    float: none;
    margin: 8px 0 0 0;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
```

## Step 4: Usage Examples

### 4.1 Basic Implementation

```jsx
// In your homepage or search page
import WebSearchWidget from './components/WebSearchWidget';

function SearchPage() {
  return (
    <div className="search-page">
      <WebSearchWidget 
        title="Global Web Search"
        placeholder="Search anything on the web..."
        showImageSearch={true}
        showSiteSearch={true}
        defaultResultsPerPage={10}
      />
    </div>
  );
}
```

### 4.2 Customized Widget

```jsx
// News-focused search widget
<WebSearchWidget 
  title="News Search"
  placeholder="Search news worldwide..."
  showImageSearch={false}
  showSiteSearch={true}
  defaultResultsPerPage={8}
/>

// Image-only search widget
<WebSearchWidget 
  title="Image Search"
  placeholder="Find images..."
  showImageSearch={true}
  showSiteSearch={false}
  defaultResultsPerPage={12}
/>
```

### 4.3 API Usage Examples

```javascript
// Direct API calls
const searchAPI = {
  // Web search
  async searchWeb(query, page = 1) {
    const response = await fetch(`/api/web-search?query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
  },

  // Image search
  async searchImages(query, page = 1) {
    const response = await fetch(`/api/web-search/images?query=${encodeURIComponent(query)}&page=${page}`);
    return response.json();
  },

  // Site search
  async searchSite(query, site, page = 1) {
    const response = await fetch(`/api/web-search/site?query=${encodeURIComponent(query)}&site=${site}&page=${page}`);
    return response.json();
  },

  // Get suggestions
  async getSuggestions(query) {
    const response = await fetch(`/api/web-search/suggestions?query=${encodeURIComponent(query)}`);
    return response.json();
  }
};

// Usage
const results = await searchAPI.searchWeb('climate change');
const images = await searchAPI.searchImages('nature photography');
const siteResults = await searchAPI.searchSite('weather', 'bbc.com');
```

## Step 5: Configuration & Limits

### 5.1 Google CSE Quotas

**Free Tier Limits:**
- 100 search queries per day
- 10 results per query maximum
- No commercial usage

**Paid Tier:**
- $5 per 1,000 queries (after free tier)
- Up to 10,000 queries per day
- Commercial usage allowed

### 5.2 Environment Configuration

Update your `.env` file:

```bash
# Google Custom Search Engine
GOOGLE_CSE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ENGINE_ID=your_search_engine_id_here

# Optional: Customize search behavior
GOOGLE_CSE_SAFE_SEARCH=medium
GOOGLE_CSE_DEFAULT_COUNTRY=us
GOOGLE_CSE_DEFAULT_LANGUAGE=lang_en
```

### 5.3 Rate Limiting & Caching

Consider implementing caching to reduce API calls:

```javascript
// Simple in-memory cache
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedResult = (key) => {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedResult = (key, data) => {
  searchCache.set(key, {
    data,
    timestamp: Date.now()
  });
};
```

## Step 6: Testing & Deployment

### 6.1 Test the Setup

```bash
# Test API endpoints
curl "http://localhost:1337/api/web-search/status"
curl "http://localhost:1337/api/web-search?query=test"
curl "http://localhost:1337/api/web-search/images?query=nature"
```

### 6.2 Production Considerations

1. **API Key Security**
   - Restrict API key to your domain
   - Use environment variables
   - Monitor usage in Google Cloud Console

2. **Performance Optimization**
   - Implement result caching
   - Add request debouncing
   - Optimize image loading

3. **User Experience**
   - Add loading states
   - Handle errors gracefully
   - Implement responsive design

4. **Analytics**
   - Track search queries
   - Monitor popular searches
   - Analyze user behavior

## Troubleshooting

### Common Issues

1. **"Invalid API key" Error**
   - Verify API key in Google Cloud Console
   - Check API restrictions
   - Ensure Custom Search API is enabled

2. **"Search engine not found" Error**
   - Verify Search Engine ID
   - Check CSE configuration
   - Ensure search engine is active

3. **Quota Exceeded**
   - Monitor usage in Google Cloud Console
   - Implement caching to reduce calls
   - Consider upgrading to paid tier

4. **No Results Returned**
   - Check search query formatting
   - Verify CSE is set to search entire web
   - Test with different queries

### Debug Commands

```bash
# Test Google CSE service
node -e "
const GoogleCSEService = require('./scripts/google-cse-service');
const service = new GoogleCSEService();
service.search('test').then(r => console.log('✅ Results:', r.totalResults)).catch(e => console.log('❌ Error:', e.message));
"

# Check API status
curl "http://localhost:1337/api/web-search/status"
```

## Summary

You now have a complete Google Custom Search Engine widget that provides:

✅ **Global web search** with pagination and filtering
✅ **Image search** with grid layout
✅ **Site-specific search** for targeted results  
✅ **Search suggestions** with autocomplete
✅ **Responsive design** for all devices
✅ **Production-ready** with error handling and caching

The widget integrates seamlessly with your existing Strapi news platform and provides users with powerful web search capabilities directly from your site.
