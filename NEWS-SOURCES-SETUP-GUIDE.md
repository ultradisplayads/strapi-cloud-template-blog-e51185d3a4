# 📰 News Sources Setup Guide

This guide will help you set up all the news sources for the Pattaya1 news widget.

## 🎯 Overview

The news widget now fetches from **12 comprehensive sources**:

### 📡 RSS Feeds (10 sources)
1. **Pattaya Mail** - Premier English-language newspaper
2. **The Pattaya News** - Breaking news and crime updates
3. **The Thaiger** - National context for Pattaya stories
4. **The Thaiger Pattaya** - Dedicated Pattaya section
5. **Bangkok Post** - Thailand's leading English newspaper
6. **The Nation Thailand** - Breaking news from Thailand
7. **Thai PBS World** - Public broadcasting news
8. **Khaosod English** - Independent Thai news
9. **ASEAN NOW Forum** - Expat community discussions
10. **Pattaya People** - Lifestyle and community news

### 🔌 API Sources (2 sources)
11. **NewsAPI.org** - Global news API
12. **GNews.io** - Alternative news API

## 🚀 Quick Setup

### Step 1: Test All Sources
```bash
cd strapi-cloud-template-blog-e51185d3a4
node test-all-news-sources.js
```

### Step 2: Get API Keys (Optional but Recommended)

#### NewsAPI.org
1. Go to [https://newsapi.org/](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key
4. Free tier: 1000 requests/day

#### GNews.io
1. Go to [https://gnews.io/](https://gnews.io/)
2. Sign up for a free account
3. Get your API key
4. Free tier: 100 requests/day

### Step 3: Update API Keys
Edit the news sources configuration:

```bash
# Update the sample configuration
nano data/sample-news-sources.json
```

Replace:
- `"YOUR_NEWSAPI_KEY_HERE"` with your NewsAPI.org key
- `"YOUR_GNEWS_KEY_HERE"` with your GNews.io key

### Step 4: Populate News Sources
```bash
node scripts/populate-news-sources.js
```

### Step 5: Start the News System
```bash
# Start Strapi (this will also start the cron scheduler)
npm run develop
```

## 📊 Source Details

### RSS Feeds (No API Key Required)

| Source | Priority | Fetch Interval | Key Value |
|--------|----------|----------------|-----------|
| Pattaya Mail | 1 | 30 min | Longest-running local news |
| The Pattaya News | 2 | 15 min | Fastest breaking news |
| The Thaiger | 3 | 30 min | Expat-friendly national context |
| The Thaiger Pattaya | 4 | 30 min | Dedicated Pattaya section |
| Bangkok Post | 5 | 60 min | Leading English newspaper |
| The Nation Thailand | 6 | 45 min | Breaking news |
| Thai PBS World | 7 | 60 min | Public broadcasting |
| Khaosod English | 8 | 45 min | Independent news |
| ASEAN NOW Forum | 9 | 60 min | Expat community |
| Pattaya People | 10 | 60 min | Lifestyle & community |

### API Sources (Require API Keys)

| Source | Priority | Fetch Interval | Free Tier |
|--------|----------|----------------|-----------|
| NewsAPI.org | 11 | 120 min | 1000 requests/day |
| GNews.io | 12 | 120 min | 100 requests/day |

## 🔧 Configuration

### Cron Scheduler
The system runs a cron job every minute that:
- Fetches from all active sources
- Limits to 3 articles per source per run
- Automatically handles duplicates
- Updates vote counts and user tracking

### Fetch Intervals
- **Breaking News**: 15 minutes (The Pattaya News)
- **Local News**: 30 minutes (Pattaya Mail, The Thaiger)
- **National News**: 45-60 minutes (Bangkok Post, etc.)
- **API Sources**: 120 minutes (to respect rate limits)

## 🧪 Testing

### Test Individual Sources
```bash
# Test RSS feeds
node test-all-news-sources.js

# Test specific RSS feed
curl "https://www.pattayamail.com/feed"

# Test NewsAPI (replace YOUR_KEY)
curl "https://newsapi.org/v2/top-headlines?country=th&apiKey=YOUR_KEY"

# Test GNews (replace YOUR_KEY)
curl "https://gnews.io/api/v4/top-headlines?country=th&apikey=YOUR_KEY"
```

### Test News Fetching
```bash
# Test the cron job manually
node scripts/alternative-scheduler.js

# Check breaking news endpoint
curl "https://api.pattaya1.com/api/breaking-news/live"
```

## 📈 Monitoring

### Check News Sources Status
```bash
# View all sources in Strapi admin
# Go to: https://api.pattaya1.com/admin/content-manager/collection-types/api::news-source.news-source
```

### Monitor Cron Logs
The cron job logs all activities:
- ✅ Successful fetches
- ❌ Failed sources
- 📊 Article counts
- 🔄 Fetch intervals

## 🚨 Troubleshooting

### Common Issues

1. **RSS Feed Not Working**
   - Check if the URL is accessible
   - Verify the feed format
   - Some feeds may be temporarily down

2. **API Rate Limits**
   - NewsAPI.org: 1000 requests/day
   - GNews.io: 100 requests/day
   - Increase fetch intervals if needed

3. **Duplicate Articles**
   - The system automatically handles duplicates
   - Articles are identified by title + source

4. **No Articles Showing**
   - Check if sources are active in Strapi admin
   - Verify cron job is running
   - Check server logs for errors

### Debug Commands
```bash
# Check cron job status
node scripts/check-scheduler.js

# Debug news fetch
node scripts/debug-news-fetch.js

# Check actual article count
node scripts/check-actual-count.js
```

## 🎯 Expected Results

With all sources configured, you should see:
- **10-30 new articles** every hour
- **Mix of local and national news**
- **Breaking news within 15 minutes**
- **Comprehensive coverage** of Pattaya and Thailand

## 📞 Support

If you encounter issues:
1. Check the test script results
2. Verify API keys are correct
3. Check Strapi admin for source status
4. Review server logs for errors

The system is designed to be robust and will continue working even if some sources fail.
