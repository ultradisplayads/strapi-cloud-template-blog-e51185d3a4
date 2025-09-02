# 🎯 Complete Frontend Changes Required - Sponsored Content Integration

## 📋 Overview
Here's everything you need to change in your frontend to support the new sponsored content system.

## 🔄 1. Update Existing News Feed Component

### Current Implementation (Before):
```javascript
// Your existing news feed probably looks like this
function NewsFeed() {
  const [news, setNews] = useState([]);
  
  useEffect(() => {
    fetch('/api/breaking-news/live')
      .then(res => res.json())
      .then(data => setNews(data.data));
  }, []);

  return (
    <div className="news-feed">
      {news.map(article => (
        <NewsArticle key={article.id} article={article} />
      ))}
    </div>
  );
}
```

### New Implementation (After):
```javascript
function NewsFeed() {
  const [feedData, setFeedData] = useState([]);
  const [meta, setMeta] = useState({});
  
  useEffect(() => {
    fetch('/api/breaking-news/live')
      .then(res => res.json())
      .then(data => {
        setFeedData(data.data);
        setMeta(data.meta); // Now includes newsCount, sponsoredCount
      });
  }, []);

  return (
    <div className="news-feed">
      {/* Optional: Show feed stats */}
      <div className="feed-stats">
        {meta.newsCount} News • {meta.sponsoredCount} Sponsored
      </div>
      
      {feedData.map(item => (
        <div key={item.id}>
          {item.type === 'news' ? (
            <NewsArticle article={item} />
          ) : item.type === 'sponsored' ? (
            <SponsoredPost post={item} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
```

## 🆕 2. Create New SponsoredPost Component

```javascript
function SponsoredPost({ post }) {
  const handleClick = () => {
    // Track click for analytics
    trackSponsoredClick(post.id, post.sponsorName);
    // Open sponsor URL
    window.open(post.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="sponsored-post" onClick={handleClick}>
      {/* Sponsored Badge */}
      <div className="sponsored-badge">
        <span className="badge-icon">📢</span>
        <span className="badge-text">Sponsored</span>
        {post.sponsorName && (
          <span className="sponsor-name">by {post.sponsorName}</span>
        )}
      </div>

      {/* Main Content */}
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-summary">{post.summary}</p>
        
        {/* Main Image */}
        {post.image && (
          <div className="main-image-container">
            <img src={post.image} alt={post.title} className="main-image" />
          </div>
        )}
        
        {/* Logos Section */}
        <div className="logos-section">
          {post.sponsorLogo && (
            <img 
              src={post.sponsorLogo} 
              alt={`${post.sponsorName} logo`} 
              className="sponsor-logo" 
            />
          )}
          {post.logo && (
            <img 
              src={post.logo} 
              alt="Campaign logo" 
              className="campaign-logo" 
            />
          )}
        </div>
        
        {/* Call to Action */}
        <div className="cta-section">
          <button className="cta-button">
            Learn More →
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 3. Add New CSS Styles

```css
/* Sponsored Post Styles */
.sponsored-post {
  border: 2px solid #e6f3ff;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.sponsored-post:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 102, 204, 0.15);
  border-color: #0066cc;
}

/* Sponsored Badge */
.sponsored-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  color: #666;
}

.badge-icon {
  font-size: 16px;
}

.badge-text {
  background: #ff6b35;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.sponsor-name {
  color: #0066cc;
  font-weight: 600;
}

/* Content Styles */
.post-title {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.main-image-container {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* Logos Section */
.logos-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.sponsor-logo,
.campaign-logo {
  max-height: 40px;
  max-width: 120px;
  object-fit: contain;
  filter: grayscale(20%);
  transition: filter 0.3s ease;
}

.sponsored-post:hover .sponsor-logo,
.sponsored-post:hover .campaign-logo {
  filter: grayscale(0%);
}

/* Call to Action */
.cta-section {
  margin-top: 16px;
}

.cta-button {
  background: #0066cc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background: #0052a3;
}

/* Feed Stats */
.feed-stats {
  font-size: 12px;
  color: #666;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  display: inline-block;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sponsored-post {
    padding: 16px;
    margin: 12px 0;
  }
  
  .logos-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .main-image {
    height: 150px;
  }
}
```

## 🏠 4. Widget Sponsorship (Homepage Editor)

### Add to your existing widget component:
```javascript
function BreakingNewsWidget({ widgetId, isEditable = false }) {
  const [widgetConfig, setWidgetConfig] = useState({
    isSponsoredWidget: false,
    sponsorName: '',
    sponsorBanner: ''
  });
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    // Load widget sponsorship config
    if (widgetId) {
      fetch(`/api/breaking-news/widget-config/${widgetId}`)
        .then(res => res.json())
        .then(data => setWidgetConfig(data.data))
        .catch(() => {}); // Handle if endpoint doesn't exist yet
    }
    
    // Load news data
    fetch('/api/breaking-news/live')
      .then(res => res.json())
      .then(data => setNewsData(data.data.slice(0, 5))); // Top 5 items
  }, [widgetId]);

  const updateSponsorship = async (config) => {
    try {
      await fetch(`/api/breaking-news/widget-config/${widgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setWidgetConfig(prev => ({ ...prev, ...config }));
    } catch (error) {
      console.error('Failed to update widget sponsorship:', error);
    }
  };

  return (
    <div className="breaking-news-widget">
      {/* Sponsor Banner */}
      {widgetConfig.isSponsoredWidget && widgetConfig.sponsorBanner && (
        <div className="sponsor-banner">
          {widgetConfig.sponsorBanner}
        </div>
      )}
      
      {/* Widget Header */}
      <div className="widget-header">
        <h2>🚨 Breaking News</h2>
        
        {/* Editor Controls (only show in edit mode) */}
        {isEditable && (
          <div className="sponsorship-controls">
            <label className="sponsor-checkbox">
              <input
                type="checkbox"
                checked={widgetConfig.isSponsoredWidget}
                onChange={(e) => {
                  const isSponsoredWidget = e.target.checked;
                  updateSponsorship({ 
                    isSponsoredWidget,
                    sponsorName: isSponsoredWidget ? widgetConfig.sponsorName : ''
                  });
                }}
              />
              Mark as Sponsored
            </label>
            
            {widgetConfig.isSponsoredWidget && (
              <input
                type="text"
                placeholder="Sponsor Name (e.g., Singha Beer)"
                value={widgetConfig.sponsorName}
                onChange={(e) => {
                  const sponsorName = e.target.value;
                  setWidgetConfig(prev => ({ ...prev, sponsorName }));
                }}
                onBlur={(e) => {
                  updateSponsorship({
                    isSponsoredWidget: true,
                    sponsorName: e.target.value
                  });
                }}
                className="sponsor-input"
              />
            )}
          </div>
        )}
      </div>
      
      {/* News Items */}
      <div className="widget-content">
        {newsData.map(item => (
          <div key={item.id} className="widget-news-item">
            {item.type === 'sponsored' ? (
              <div className="widget-sponsored-item">
                <span className="sponsored-label">Sponsored</span>
                <h4>{item.title}</h4>
                <p>{item.summary}</p>
              </div>
            ) : (
              <div className="widget-news-item">
                <h4>{item.title}</h4>
                <p>{item.summary}</p>
                {item.isBreaking && <span className="breaking-badge">BREAKING</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Widget CSS:
```css
/* Widget Sponsor Banner */
.sponsor-banner {
  background: linear-gradient(135deg, #0066cc, #004499);
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
  border-radius: 6px;
}

/* Sponsorship Controls */
.sponsorship-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.sponsor-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.sponsor-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.widget-sponsored-item {
  border-left: 3px solid #ff6b35;
  padding-left: 12px;
}

.sponsored-label {
  background: #ff6b35;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}
```

## 📊 5. Add Analytics Tracking

```javascript
// Add to your analytics utility file
function trackSponsoredClick(postId, sponsorName) {
  // Internal tracking
  fetch('/api/sponsored-posts/track-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      postId, 
      event: 'click',
      timestamp: new Date().toISOString()
    })
  }).catch(console.error);
  
  // Google Analytics (if you use it)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'sponsored_click', {
      'sponsor_name': sponsorName,
      'post_id': postId,
      'event_category': 'sponsored_content'
    });
  }
}

function trackSponsoredImpression(postId, sponsorName) {
  fetch('/api/sponsored-posts/track-impression', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      postId, 
      event: 'impression',
      timestamp: new Date().toISOString()
    })
  }).catch(console.error);
}
```

## ✅ 6. Testing Checklist

After implementing these changes, test:

- [ ] News feed displays both news and sponsored content
- [ ] Sponsored posts have clear "Sponsored" labels
- [ ] All three image types display correctly (image, sponsorLogo, logo)
- [ ] Sponsored posts appear in correct positions (3rd position by default)
- [ ] Widget sponsorship checkbox works in edit mode
- [ ] Sponsor banners appear when widgets are marked as sponsored
- [ ] Click tracking works for sponsored content
- [ ] Mobile responsive design works
- [ ] Hover effects and animations work smoothly

## 🚀 Summary

**Files to Modify:**
1. **News Feed Component** - Add type checking and SponsoredPost component
2. **CSS/Styles** - Add sponsored post styling
3. **Widget Component** - Add sponsorship controls and banner display
4. **Analytics** - Add tracking functions

**New Components to Create:**
1. **SponsoredPost** - Display sponsored content with proper styling
2. **Sponsorship Controls** - Checkbox and input for widget sponsorship

**Key Features Added:**
- Mixed news/sponsored feed
- Clear sponsored labeling
- Multiple logo support
- Widget sponsorship banners
- Click/impression tracking
- Mobile responsive design

Your frontend will now seamlessly display sponsored content integrated with your breaking news system!
