# 🎯 Frontend Integration Guide - Sponsored Content System

## 📋 Overview
Your Strapi backend now includes sponsored content that automatically integrates with the breaking news feed. Here's what you need to implement on the frontend.

## 🔄 API Response Changes

### Updated `/api/breaking-news/live` Response
```json
{
  "data": [
    {
      "id": 1,
      "type": "news",
      "title": "Breaking News Article",
      "summary": "News summary...",
      "isBreaking": true,
      "category": "Politics",
      "upvotes": 15,
      "downvotes": 2
    },
    {
      "id": 2,
      "type": "sponsored",
      "title": "Sponsored Content Title",
      "summary": "Sponsored content summary...",
      "url": "https://sponsor.com/landing",
      "sponsorName": "Singha Beer",
      "sponsorLogo": "https://strapi.com/uploads/sponsor_logo.jpg",
      "logo": "https://strapi.com/uploads/additional_logo.jpg",
      "image": "https://strapi.com/uploads/content_image.jpg",
      "displayPosition": "position-3",
      "category": "Sponsored",
      "isBreaking": false
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

## 🎨 Frontend Implementation

### 1. Update News Feed Component

```javascript
// Example React component
function NewsFeed() {
  const [newsData, setNewsData] = useState([]);
  
  useEffect(() => {
    fetch('/api/breaking-news/live')
      .then(res => res.json())
      .then(data => setNewsData(data.data));
  }, []);

  return (
    <div className="news-feed">
      {newsData.map(item => (
        <div key={item.id}>
          {item.type === 'news' ? (
            <NewsArticle article={item} />
          ) : (
            <SponsoredPost post={item} />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. Create Sponsored Post Component

```javascript
function SponsoredPost({ post }) {
  return (
    <div className="sponsored-post">
      {/* Sponsored Label */}
      <div className="sponsored-label">
        <span>Sponsored</span>
        {post.sponsorName && (
          <span className="sponsor-name">by {post.sponsorName}</span>
        )}
      </div>

      {/* Content */}
      <div className="post-content">
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
        
        {/* Images */}
        {post.image && (
          <img src={post.image} alt={post.title} className="main-image" />
        )}
        
        {/* Logos */}
        <div className="logos">
          {post.sponsorLogo && (
            <img src={post.sponsorLogo} alt={post.sponsorName} className="sponsor-logo" />
          )}
          {post.logo && (
            <img src={post.logo} alt="Additional logo" className="additional-logo" />
          )}
        </div>
        
        {/* Call to Action */}
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="cta-button">
          Learn More
        </a>
      </div>
    </div>
  );
}
```

### 3. Update CSS Styling

```css
/* Sponsored Post Styling */
.sponsored-post {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
  position: relative;
}

.sponsored-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: bold;
}

.sponsored-label::before {
  content: "📢";
  font-size: 14px;
}

.sponsor-name {
  color: #0066cc;
}

.post-content h3 {
  color: #333;
  margin-bottom: 8px;
}

.logos {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  align-items: center;
}

.sponsor-logo,
.additional-logo {
  max-height: 40px;
  max-width: 120px;
  object-fit: contain;
}

.cta-button {
  display: inline-block;
  background: #0066cc;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background 0.3s;
}

.cta-button:hover {
  background: #0052a3;
}
```

## 🏠 Widget Sponsorship Implementation

### 1. Widget Configuration API

```javascript
// Get widget sponsorship config
async function getWidgetConfig(widgetId) {
  const response = await fetch(`/api/breaking-news/widget-config/${widgetId}`);
  return response.json();
}

// Update widget sponsorship
async function updateWidgetConfig(widgetId, config) {
  const response = await fetch(`/api/breaking-news/widget-config/${widgetId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return response.json();
}
```

### 2. Sponsored Widget Component

```javascript
function BreakingNewsWidget({ widgetId }) {
  const [config, setConfig] = useState({});
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    // Load widget config
    getWidgetConfig(widgetId).then(data => setConfig(data.data));
    
    // Load news data
    fetch('/api/breaking-news/live').then(res => res.json())
      .then(data => setNewsData(data.data));
  }, [widgetId]);

  return (
    <div className="breaking-news-widget">
      {/* Sponsored Banner */}
      {config.isSponsoredWidget && (
        <div className="sponsor-banner">
          {config.sponsorBanner || `Latest Updates, brought to you by ${config.sponsorName}`}
        </div>
      )}
      
      {/* Widget Header */}
      <div className="widget-header">
        <h2>Breaking News</h2>
      </div>
      
      {/* News Items */}
      <div className="news-items">
        {newsData.slice(0, 5).map(item => (
          <NewsItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Admin Interface for Widget Sponsorship

```javascript
function WidgetSponsorshipEditor({ widgetId }) {
  const [config, setConfig] = useState({
    isSponsoredWidget: false,
    sponsorName: ''
  });

  const handleSave = async () => {
    await updateWidgetConfig(widgetId, config);
    alert('Widget sponsorship updated!');
  };

  return (
    <div className="sponsorship-editor">
      <label>
        <input
          type="checkbox"
          checked={config.isSponsoredWidget}
          onChange={(e) => setConfig({
            ...config,
            isSponsoredWidget: e.target.checked
          })}
        />
        Mark as Sponsored
      </label>
      
      {config.isSponsoredWidget && (
        <input
          type="text"
          placeholder="Sponsor Name (e.g., Singha Beer)"
          value={config.sponsorName}
          onChange={(e) => setConfig({
            ...config,
            sponsorName: e.target.value
          })}
        />
      )}
      
      <button onClick={handleSave}>Save Configuration</button>
    </div>
  );
}
```

## 📊 Analytics Integration

### Track Sponsored Content Performance

```javascript
function trackSponsoredClick(postId, sponsorName) {
  // Track click for analytics
  fetch('/api/sponsored-posts/track-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, event: 'click' })
  });
  
  // Google Analytics example
  if (typeof gtag !== 'undefined') {
    gtag('event', 'sponsored_click', {
      'sponsor_name': sponsorName,
      'post_id': postId
    });
  }
}

function trackSponsoredImpression(postId, sponsorName) {
  // Track impression
  fetch('/api/sponsored-posts/track-impression', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, event: 'impression' })
  });
}
```

## 🎯 Key Implementation Points

### 1. **Type Detection**
- Always check `item.type === 'sponsored'` to render sponsored content differently
- Use different styling and components for sponsored vs news content

### 2. **Sponsored Labeling**
- Clearly mark sponsored content with "Sponsored" labels
- Include sponsor name when available
- Use distinct visual styling (borders, backgrounds, icons)

### 3. **Image Handling**
- Support multiple image types: `image`, `sponsorLogo`, `logo`
- Handle missing images gracefully
- Optimize image loading and sizing

### 4. **Click Tracking**
- Track clicks on sponsored content for analytics
- Implement impression tracking when content is viewed
- Send data back to Strapi for campaign metrics

### 5. **Widget Sponsorship**
- Implement checkbox interface for marking widgets as sponsored
- Display sponsor banners at widget tops
- Auto-generate sponsor text or allow custom messages

## 🚀 Testing Checklist

- [ ] Sponsored posts appear in correct positions (3rd position by default)
- [ ] Sponsored content is clearly labeled
- [ ] All images (main, sponsor logo, additional logo) display correctly
- [ ] Click tracking works for sponsored links
- [ ] Widget sponsorship banners display properly
- [ ] Admin interface for widget sponsorship functions
- [ ] Responsive design works on mobile devices
- [ ] Analytics integration captures sponsored content interactions

Your frontend is now ready to display and manage sponsored content seamlessly integrated with your breaking news system!
