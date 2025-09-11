'use strict';

/**
 * social-feed service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::social-media-post.social-media-post', ({ strapi }) => ({
  // Fetch posts from external APIs (Twitter, Instagram, etc.) - Direct API call, no caching
  async fetchFromTwitter(keywords = ['Pattaya']) {
    try {
      strapi.log.info('Fetching directly from Twitter API (no caching)...');
      
      // Real Twitter API v2 integration
      const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
      
      if (!twitterBearerToken) {
        strapi.log.warn('Twitter Bearer Token not configured, using fallback data');
        const fallbackPosts = this.getFallbackTwitterPosts(keywords);
        strapi.log.info(`Using fallback Twitter posts: ${fallbackPosts.length} posts`);
        return fallbackPosts;
      }
      
      strapi.log.info('Twitter Bearer Token found, making direct API call...');
      
      // Search for tweets with Pattaya-related keywords - limit to 1 result
      const query = keywords.map(k => `"${k}"`).join(' OR ');
      const twitterUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=1&tweet.fields=created_at,public_metrics,author_id,context_annotations&user.fields=username,name,verified&expansions=author_id`;
      
      strapi.log.info(`Twitter API URL: ${twitterUrl}`);
      
      const response = await fetch(twitterUrl, {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Twitter API error: ${response.status} - ${errorText}`);
        throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      strapi.log.info('Twitter API response:', JSON.stringify(data, null, 2));
      
      if (!data.data || data.data.length === 0) {
        strapi.log.warn('No tweets found, using fallback data');
        const fallbackPosts = this.getFallbackTwitterPosts(keywords);
        strapi.log.info(`Using fallback Twitter posts (no data): ${fallbackPosts.length} posts`);
        return fallbackPosts;
      }
      
      // Transform Twitter API response to our format
      const tweets = data.data.map(tweet => {
        const author = data.includes?.users?.find(u => u.id === tweet.author_id);
        return {
          id: 'twitter_' + tweet.id,
          Platform: 'twitter',
          Author: author?.name || 'Unknown User',
          Handle: '@' + (author?.username || 'unknown'),
          Content: tweet.text,
          Timestamp: new Date(tweet.created_at),
          Likes: tweet.public_metrics?.like_count || 0,
          Comments: tweet.public_metrics?.reply_count || 0,
          Shares: tweet.public_metrics?.retweet_count || 0,
          Location: this.extractLocation(tweet.text),
          Verified: author?.verified || false,
          Hashtags: this.extractHashtags(tweet.text),
          URL: `https://twitter.com/${author?.username}/status/${tweet.id}`,
          Category: this.categorizeContent(tweet.text)
        };
      });
      
      strapi.log.info(`Successfully fetched ${tweets.length} tweets from Twitter API`);
      return tweets;
      
    } catch (error) {
      strapi.log.error('Failed to fetch from Twitter:', error.message);
      strapi.log.error('Error details:', error);
      const fallbackPosts = this.getFallbackTwitterPosts(keywords);
      strapi.log.info(`Using fallback Twitter posts due to error: ${fallbackPosts.length} posts`);
      return fallbackPosts;
    }
  },

  // Fallback Twitter posts when API is not available
  getFallbackTwitterPosts(keywords = ['Pattaya']) {
    const mockTweets = [
      {
        id: 'tweet_' + Date.now(),
        Platform: 'twitter',
        Author: 'Pattaya Explorer',
        Handle: '@pattaya_explorer',
        Content: `Just discovered an amazing hidden beach in Pattaya! The water is crystal clear and perfect for snorkeling 🏖️ #Pattaya #Thailand #Beach`,
        Timestamp: new Date(),
        Likes: Math.floor(Math.random() * 100),
        Comments: Math.floor(Math.random() * 20),
        Shares: Math.floor(Math.random() * 15),
        Location: 'Pattaya, Thailand',
        Verified: true,
        Hashtags: ['Pattaya', 'Thailand', 'Beach', 'Snorkeling'],
        URL: 'https://twitter.com/pattaya_explorer/status/1234567890',
        Category: 'Tourism'
      }
    ];

    return mockTweets;
  },

  // Fetch posts from Reddit
  async fetchFromReddit(keywords = ['Pattaya']) {
    try {
      strapi.log.info('Fetching from Reddit API...');
      
      const redditClientId = process.env.REDDIT_CLIENT_ID;
      const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
      
      if (!redditClientId || !redditClientSecret) {
        strapi.log.warn('Reddit API credentials not configured, using fallback data');
        return this.getFallbackRedditPosts(keywords);
      }
      
      // Get Reddit access token
      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${redditClientId}:${redditClientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PattayaSocialFeed/1.0'
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Reddit token error: ${tokenResponse.status}`);
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      // Search Reddit for Pattaya-related posts
      const query = keywords.join(' OR ');
      const redditUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=new&limit=10&raw_json=1`;
      
      const response = await fetch(redditUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'PattayaSocialFeed/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data?.children) {
        strapi.log.warn('No Reddit posts found, using fallback data');
        return this.getFallbackRedditPosts(keywords);
      }
      
      // Transform Reddit posts to our format
      const posts = data.data.children.map(post => {
        const postData = post.data;
        return {
          id: 'reddit_' + postData.id,
          Platform: 'reddit',
          Author: postData.author,
          Handle: `u/${postData.author}`,
          Content: postData.selftext || postData.title,
          Timestamp: new Date(postData.created_utc * 1000),
          Likes: postData.ups || 0,
          Comments: postData.num_comments || 0,
          Shares: 0, // Reddit doesn't have shares
          Location: this.extractLocation(postData.selftext || postData.title),
          Verified: false,
          Hashtags: this.extractHashtags(postData.selftext || postData.title),
          URL: `https://reddit.com${postData.permalink}`,
          Category: this.categorizeContent(postData.selftext || postData.title)
        };
      });
      
      return posts;
      
    } catch (error) {
      strapi.log.error('Failed to fetch from Reddit:', error.message);
      return this.getFallbackRedditPosts(keywords);
    }
  },

  // Fallback Reddit posts
  getFallbackRedditPosts(keywords = ['Pattaya']) {
    return [
      {
        id: 'reddit_' + Date.now(),
        Platform: 'reddit',
        Author: 'PattayaTraveler',
        Handle: 'u/PattayaTraveler',
        Content: 'Just spent an amazing week in Pattaya! The beaches are incredible and the nightlife is exactly what I expected. Any recommendations for hidden gems?',
        Timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        Likes: 12,
        Comments: 8,
        Shares: 0,
        Location: 'Pattaya, Thailand',
        Verified: false,
        Hashtags: ['Pattaya', 'Travel', 'Thailand'],
        URL: 'https://reddit.com/r/Thailand/comments/example',
        Category: 'Tourism'
      }
    ];
  },

  // Fetch news articles related to Pattaya
  async fetchFromNews(keywords = ['Pattaya']) {
    try {
      strapi.log.info('Fetching from News API...');
      
      const newsApiKey = process.env.NEWS_API_KEY;
      
      if (!newsApiKey) {
        strapi.log.warn('News API key not configured, using fallback data');
        return this.getFallbackNewsPosts(keywords);
      }
      
      // Search for news articles about Pattaya
      const query = keywords.join(' OR ');
      const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en`;
      
      const response = await fetch(newsUrl, {
        headers: {
          'X-API-Key': newsApiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        strapi.log.warn('No news articles found, using fallback data');
        return this.getFallbackNewsPosts(keywords);
      }
      
      // Transform news articles to our format
      const posts = data.articles.map(article => ({
        id: 'news_' + Date.now() + Math.random(),
        Platform: 'news',
        Author: article.source?.name || 'News Source',
        Handle: `@${article.source?.name?.toLowerCase().replace(/\s+/g, '') || 'news'}`,
        Content: article.title + (article.description ? '\n\n' + article.description : ''),
        Timestamp: new Date(article.publishedAt),
        Likes: Math.floor(Math.random() * 50), // Simulated engagement
        Comments: Math.floor(Math.random() * 10),
        Shares: Math.floor(Math.random() * 20),
        Location: this.extractLocation(article.title + ' ' + (article.description || '')),
        Verified: true,
        Hashtags: this.extractHashtags(article.title + ' ' + (article.description || '')),
        URL: article.url,
        Category: 'News'
      }));
      
      return posts;
      
    } catch (error) {
      strapi.log.error('Failed to fetch from News API:', error.message);
      return this.getFallbackNewsPosts(keywords);
    }
  },

  // Fallback news posts
  getFallbackNewsPosts(keywords = ['Pattaya']) {
    return [
      {
        id: 'news_' + Date.now(),
        Platform: 'news',
        Author: 'Pattaya News',
        Handle: '@pattayanews',
        Content: 'Pattaya welcomes new tourism initiatives to boost local economy and sustainable travel practices.',
        Timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        Likes: 25,
        Comments: 5,
        Shares: 12,
        Location: 'Pattaya, Thailand',
        Verified: true,
        Hashtags: ['Pattaya', 'Tourism', 'News'],
        URL: 'https://example.com/pattaya-news',
        Category: 'News'
      }
    ];
  },

  // Fetch posts from Instagram (keeping as fallback for now)
  async fetchFromInstagram(keywords = ['Pattaya']) {
    try {
      strapi.log.info('Fetching from Instagram API...');
      
      // Instagram API requires more complex authentication
      // For now, return fallback data
      return this.getFallbackInstagramPosts(keywords);
      
    } catch (error) {
      strapi.log.error('Failed to fetch from Instagram:', error.message);
      return this.getFallbackInstagramPosts(keywords);
    }
  },

  // Fallback Instagram posts
  getFallbackInstagramPosts(keywords = ['Pattaya']) {
    const mockPosts = [
      {
        id: 'ig_' + Date.now(),
        Platform: 'instagram',
        Author: 'Pattaya Nightlife',
        Handle: '@pattaya_nightlife',
        Content: `The nightlife scene in Pattaya is absolutely incredible! From rooftop bars to beach clubs, there's something for everyone 🌃 #Pattaya #Nightlife #Thailand`,
        Timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        Likes: Math.floor(Math.random() * 200),
        Comments: Math.floor(Math.random() * 30),
        Shares: Math.floor(Math.random() * 25),
        Location: 'Pattaya, Thailand',
        Verified: true,
        Hashtags: ['Pattaya', 'Nightlife', 'Thailand', 'BeachClubs'],
        URL: 'https://instagram.com/p/abc123',
        Category: 'Nightlife'
      },
      {
        id: 'ig_' + (Date.now() + 1),
        Platform: 'instagram',
        Author: 'Pattaya Beach Life',
        Handle: '@pattaya_beach_life',
        Content: `Sunset vibes at Jomtien Beach, Pattaya! The golden hour here is absolutely magical ✨ Perfect for a romantic dinner or just relaxing with friends 🏖️ #Pattaya #JomtienBeach #Sunset #Thailand`,
        Timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
        Likes: Math.floor(Math.random() * 150),
        Comments: Math.floor(Math.random() * 20),
        Shares: Math.floor(Math.random() * 15),
        Location: 'Jomtien Beach, Pattaya, Thailand',
        Verified: false,
        Hashtags: ['Pattaya', 'JomtienBeach', 'Sunset', 'Thailand', 'BeachLife'],
        URL: 'https://instagram.com/p/def456',
        Category: 'Tourism'
      }
    ];

    return mockPosts;
  },

  // Cache for memoization
  _cache: {
    posts: null,
    lastFetch: null,
    cacheDuration: 5 * 60 * 1000 // 5 minutes cache
  },

  // Aggregate posts from Twitter only with memoization
  // @ts-ignore
  async aggregatePosts(keywords = ['Pattaya'], forceRefresh = false) {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && this._cache.posts && this._cache.lastFetch) {
        const now = Date.now();
        const timeSinceLastFetch = now - this._cache.lastFetch;
        
        strapi.log.info(`Cache check: posts=${this._cache.posts.length}, lastFetch=${new Date(this._cache.lastFetch).toISOString()}, timeSince=${timeSinceLastFetch}ms, duration=${this._cache.cacheDuration}ms`);
        
        if (timeSinceLastFetch < this._cache.cacheDuration) {
          strapi.log.info(`Returning cached Twitter posts (${this._cache.posts.length} posts)`);
          return this._cache.posts;
        } else {
          strapi.log.info('Cache expired, fetching fresh data');
        }
      } else {
        strapi.log.info(`No cache found: posts=${!!this._cache.posts}, lastFetch=${!!this._cache.lastFetch}`);
      }

      strapi.log.info('Fetching fresh Twitter posts...');
      
      // Only fetch from Twitter
      const twitterPosts = await this.fetchFromTwitter(keywords);
      strapi.log.info(`Fetched ${twitterPosts.length} Twitter posts`);
      const allPosts = [...twitterPosts];
      
      // Save new posts to database
      const savedPosts = [];
      strapi.log.info(`Attempting to save ${allPosts.length} posts to database`);
      
      for (const post of allPosts) {
        try {
          strapi.log.info(`Processing post: ${post.id} - ${post.Content.substring(0, 50)}...`);
          
          // Check if post already exists
          const existing = await strapi.entityService.findMany('api::social-media-post.social-media-post', {
            filters: { URL: post.URL }
          });

          if (existing.length === 0) {
            const postData = {
              ...post,
              IsActive: true,
              Featured: Math.random() > 0.8 // 20% chance of being featured
            };
            
            strapi.log.info(`Saving new post: ${postData.id}`);
            
            // @ts-ignore
            const savedPost = await strapi.entityService.create('api::social-media-post.social-media-post', {
              data: postData
            });
            savedPosts.push(savedPost);
            strapi.log.info(`Successfully saved post: ${savedPost.id}`);
          } else {
            strapi.log.info(`Post already exists: ${post.id}`);
          }
        } catch (error) {
          strapi.log.error('Failed to save post:', error.message);
          strapi.log.error('Error details:', error);
          strapi.log.error('Post data:', JSON.stringify(post, null, 2));
        }
      }

      // Update cache
      this._cache.posts = savedPosts;
      this._cache.lastFetch = Date.now();

      return savedPosts;
    } catch (error) {
      strapi.log.error('Failed to aggregate posts:', error.message);
      return [];
    }
  },

  // Get live feed with real-time updates
  async getLiveFeed(options = {}) {
    try {
      const {
        keywords = ['Pattaya'],
        limit = 20,
        platform = 'all',
        category = 'all',
        featured = false
      } = options;

      // Build filters
      const filters = {
        IsActive: true,
        $or: keywords.map(keyword => ({
          $or: [
            { Content: { $containsi: keyword } },
            { Hashtags: { $containsi: keyword } },
            { Location: { $containsi: keyword } }
          ]
        }))
      };

      if (platform !== 'all') {
        filters.Platform = platform;
      }

      if (category !== 'all') {
        filters.Category = category;
      }

      if (featured) {
        filters.Featured = true;
      }

      const posts = await strapi.entityService.findMany('api::social-media-post.social-media-post', {
        filters,
        populate: ['Avatar', 'Image'],
        sort: [
          { Featured: 'desc' },
          { Timestamp: 'desc' }
        ],
        limit
      });

      return posts;
    } catch (error) {
      strapi.log.error('Failed to get live feed:', error.message);
      return [];
    }
  },

  // Helper function to extract hashtags from text
  extractHashtags(text) {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text.match(hashtagRegex) || [];
  },

  // Helper function to extract location from text
  extractLocation(text) {
    const locationKeywords = ['Pattaya', 'Thailand', 'Jomtien', 'Walking Street', 'Pattaya Beach'];
    const foundLocation = locationKeywords.find(loc => 
      text.toLowerCase().includes(loc.toLowerCase())
    );
    return foundLocation ? `${foundLocation}, Thailand` : 'Pattaya, Thailand';
  },

  // Helper function to categorize content
  categorizeContent(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('eat') || lowerText.includes('cuisine')) {
      return 'Food';
    } else if (lowerText.includes('nightlife') || lowerText.includes('bar') || lowerText.includes('club') || lowerText.includes('drink')) {
      return 'Nightlife';
    } else if (lowerText.includes('beach') || lowerText.includes('hotel') || lowerText.includes('resort') || lowerText.includes('travel')) {
      return 'Tourism';
    } else if (lowerText.includes('event') || lowerText.includes('festival') || lowerText.includes('concert')) {
      return 'Events';
    } else if (lowerText.includes('business') || lowerText.includes('shop') || lowerText.includes('market')) {
      return 'Business';
    } else {
      return 'Lifestyle';
    }
  },

  // Update post engagement metrics
  async updateEngagement(postId, metrics) {
    try {
      const { likes, comments, shares } = metrics;
      
      const updateData = {};
      if (likes !== undefined) updateData.Likes = likes;
      if (comments !== undefined) updateData.Comments = comments;
      if (shares !== undefined) updateData.Shares = shares;

      const updatedPost = await strapi.entityService.update('api::social-media-post.social-media-post', postId, {
        data: updateData
      });

      return updatedPost;
    } catch (error) {
      strapi.log.error('Failed to update engagement:', error.message);
      throw error;
    }
  }
}));