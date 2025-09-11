'use strict';

/**
 * Foursquare Places API Service
 * Handles fetching reviews/tips from Foursquare Places API
 */

class FoursquareService {
  constructor() {
    this.clientId = process.env.FOURSQUARE_CLIENT_ID;
    this.clientSecret = process.env.FOURSQUARE_CLIENT_SECRET;
    this.serviceKey = process.env.FOURSQUARE_SERVICE_KEY;
    this.bearerToken = process.env.FOURSQUARE_BEARER_TOKEN || 'JDTVJUMH3ROSDLC5ATBI3WV0XIBDUV0F2WAHVI0SBGNDIV04';
    this.baseUrl = 'https://places-api.foursquare.com';
    this.apiVersion = '2025-06-17';
    this.rateLimit = {
      daily: 1000,
      perMinute: 10
    };
  }

  /**
   * Check if Foursquare API is configured
   */
  isConfigured() {
    return !!(this.bearerToken || this.serviceKey || (this.clientId && this.clientSecret));
  }

  /**
   * Get authentication headers for Foursquare API
   */
  getAuthHeaders() {
    if (!this.isConfigured()) {
      throw new Error('Foursquare API credentials not configured');
    }
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Places-Api-Version': this.apiVersion
    };
    
    // Try different authentication methods in order of preference
    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    } else if (this.serviceKey) {
      headers['Authorization'] = this.serviceKey;
    } else if (this.clientId) {
      headers['Authorization'] = this.clientId;
    }
    
    return headers;
  }

  /**
   * Find Pattaya's fsq_id
   */
  async findPattayaId() {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Foursquare API not configured, skipping Pattaya search');
        return null;
      }

      const url = `${this.baseUrl}/places/search`;
      const params = new URLSearchParams({
        query: 'Pattaya',
        near: 'Pattaya, TH',
        limit: '1',
        fields: 'name,location'
      });

      strapi.log.info('🔍 Finding Pattaya fsq_id...');

      const response = await fetch(`${url}?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Foursquare API error: ${response.status} - ${errorText}`);
        throw new Error(`Foursquare API error: ${response.status}`);
      }

      const data = await response.json();
      const pattaya = data.results?.[0];
      
      if (pattaya && pattaya.fsq_place_id) {
        strapi.log.info(`✅ Found Pattaya fsq_place_id: ${pattaya.fsq_place_id}`);
        return pattaya.fsq_place_id;
      }
      
      strapi.log.warn('No Pattaya fsq_id found');
      return null;
    } catch (error) {
      strapi.log.error('Error finding Pattaya fsq_id:', error);
      return null;
    }
  }

  /**
   * Search for places in Pattaya
   */
  async searchPlaces(query = 'restaurants', location = 'Pattaya, Thailand', limit = 20) {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Foursquare API not configured, skipping place search');
        return [];
      }

      const url = `${this.baseUrl}/places/search`;
      const params = new URLSearchParams({
        query,
        near: location,
        limit: limit.toString(),
        fields: 'name,location,categories,rating,tips'
      });

      strapi.log.info(`🔍 Searching Foursquare places: ${query} in ${location}`);

      const response = await fetch(`${url}?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Foursquare API error: ${response.status} - ${errorText}`);
        throw new Error(`Foursquare API error: ${response.status}`);
      }

      const data = await response.json();
      strapi.log.info(`✅ Found ${data.results?.length || 0} Foursquare places`);

      return data.results || [];
    } catch (error) {
      strapi.log.error('Error searching Foursquare places:', error);
      return [];
    }
  }

  /**
   * Get place details including tips (reviews)
   */
  async getPlaceDetails(fsqId) {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Foursquare API not configured, skipping place details');
        return null;
      }

      const url = `${this.baseUrl}/places/${fsqId}`;
      const params = new URLSearchParams({
        fields: 'name,location,categories,rating,tips,price,rating_signals'
      });

      strapi.log.info(`🔍 Getting Foursquare place details: ${fsqId}`);

      const response = await fetch(`${url}?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Foursquare API error: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      strapi.log.info(`✅ Retrieved Foursquare place details for: ${data.name}`);

      return data;
    } catch (error) {
      strapi.log.error(`Error getting Foursquare place details for ${fsqId}:`, error);
      return null;
    }
  }

  /**
   * Get tips (reviews) for a place
   */
  async getPlaceTips(fsqId, limit = 10) {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Foursquare API not configured, skipping place tips');
        return [];
      }

      const url = `${this.baseUrl}/places/${fsqId}`;
      const params = new URLSearchParams({
        fields: 'tips',
        limit: limit.toString()
      });

      strapi.log.info(`🔍 Getting Foursquare tips for place: ${fsqId}`);

      const response = await fetch(`${url}?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Foursquare API error: ${response.status} - ${errorText}`);
        return [];
      }

      const data = await response.json();
      const tips = data.tips || [];
      strapi.log.info(`✅ Retrieved ${tips.length} Foursquare tips`);

      return tips;
    } catch (error) {
      strapi.log.error(`Error getting Foursquare tips for ${fsqId}:`, error);
      return [];
    }
  }

  /**
   * Transform Foursquare tip to review format
   */
  transformTipToReview(tip, place) {
    try {
      // Foursquare tips don't have ratings, so we'll use the place's overall rating
      const rating = place.rating || 3; // Default to 3 if no rating
      
      return {
        source_platform: 'Foursquare',
        source_review_id: `foursquare_${tip.id}`,
        AuthorName: tip.user?.first_name || 'Anonymous',
        AuthorProfilePhotoUrl: tip.user?.photo?.prefix ? 
          `${tip.user.photo.prefix}100x100${tip.user.photo.suffix}` : null,
        AuthorProfileUrl: tip.user?.canonical_url || null,
        Rating: Math.round(rating), // Convert to 1-5 scale
        ReviewText: tip.text || '',
        ReviewTime: new Date(tip.created_at),
        RelativeTimeDescription: this.getRelativeTime(tip.created_at),
        BusinessName: place.name || '',
        BusinessAddress: this.formatAddress(place.location),
        BusinessType: place.categories?.[0]?.name || '',
        BusinessUrl: place.website || null,
        Verified: false, // Foursquare doesn't have verification status
        IsActive: true,
        Featured: false,
        Category: this.mapCategory(place.categories?.[0]?.name),
        Location: place.location?.formatted_address || '',
        Language: tip.lang || 'en',
        LastUpdated: new Date()
      };
    } catch (error) {
      strapi.log.error('Error transforming Foursquare tip to review:', error);
      return null;
    }
  }

  /**
   * Get relative time descriptiond
   */
  getRelativeTime(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      return 'Recently';
    }
  }

  /**
   * Format address from Foursquare location data
   */
  formatAddress(location) {
    if (!location) return '';
    
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.locality) parts.push(location.locality);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ');
  }

  /**
   * Map Foursquare category to our category enum
   */
  mapCategory(categoryName) {
    if (!categoryName) return 'Other';
    
    const categoryMap = {
      'Restaurant': 'Restaurant',
      'Food': 'Restaurant',
      'Cafe': 'Restaurant',
      'Bar': 'Nightlife',
      'Nightclub': 'Nightlife',
      'Hotel': 'Hotel',
      'Spa': 'Spa',
      'Shopping': 'Shopping',
      'Entertainment': 'Entertainment',
      'Tourism': 'Tourism',
      'Transportation': 'Transportation',
      'Health': 'Health'
    };

    return categoryMap[categoryName] || 'Other';
  }

  /**
   * Fetch reviews for multiple places
   */
  async fetchReviewsForPlaces(places, maxReviewsPerPlace = 5) {
    try {
      const allReviews = [];
      
      for (const place of places) {
        try {
          // Get tips for this place
          const tips = await this.getPlaceTips(place.fsq_id, maxReviewsPerPlace);
          
          // Transform tips to reviews
          for (const tip of tips) {
            const review = this.transformTipToReview(tip, place);
            if (review) {
              allReviews.push(review);
            }
          }
          
          // Add a small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          strapi.log.error(`Error fetching reviews for place ${place.fsq_id}:`, error);
        }
      }
      
      strapi.log.info(`✅ Fetched ${allReviews.length} Foursquare reviews from ${places.length} places`);
      return allReviews;
    } catch (error) {
      strapi.log.error('Error fetching Foursquare reviews:', error);
      return [];
    }
  }

  /**
   * Fetch tips directly from Pattaya location
   */
  async fetchPattayaTips(limit = 50) {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Foursquare API not configured, skipping Pattaya tips fetch');
        return [];
      }

      strapi.log.info('🔄 Fetching tips from Pattaya...');
      
      // First, find Pattaya's fsq_id
      const pattayaId = await this.findPattayaId();
      if (!pattayaId) {
        strapi.log.error('Could not find Pattaya fsq_id');
        return [];
      }
      
      // Fetch tips from Pattaya
      const url = `${this.baseUrl}/places/${pattayaId}`;
      const params = new URLSearchParams({
        fields: 'tips',
        limit: limit.toString()
      });

      strapi.log.info(`🔍 Fetching tips for Pattaya (${pattayaId})...`);

      const response = await fetch(`${url}?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Foursquare API error: ${response.status} - ${errorText}`);
        return [];
      }

      const data = await response.json();
      const tips = data.tips || [];
      
      strapi.log.info(`✅ Retrieved ${tips.length} tips from Pattaya`);
      
      // Transform tips to reviews
      const reviews = [];
      for (const tip of tips) {
        const review = this.transformTipToReview(tip, { 
          name: 'Pattaya City', 
          fsq_id: pattayaId,
          location: { formatted_address: 'Pattaya City, Chon Buri, Thailand' }
        });
        if (review) {
          reviews.push(review);
        }
      }
      
      strapi.log.info(`✅ Transformed ${reviews.length} tips to reviews`);
      return reviews;
    } catch (error) {
      strapi.log.error('Error fetching Pattaya tips:', error);
      return [];
    }
  }

  /**
   * Main method to fetch reviews from Foursquare
   */
  async fetchReviews(searchTerms = ['restaurants', 'hotels', 'bars'], location = 'Pattaya, Thailand') {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Foursquare API not configured, skipping review fetch');
        return [];
      }

      strapi.log.info('🔄 Starting Foursquare review fetch...');
      
      // Try to fetch tips directly from Pattaya first
      const pattayaReviews = await this.fetchPattayaTips(50);
      
      if (pattayaReviews.length > 0) {
        strapi.log.info(`✅ Foursquare review fetch completed: ${pattayaReviews.length} reviews from Pattaya`);
        return pattayaReviews;
      }
      
      // Fallback to searching for places if direct tips don't work
      strapi.log.info('No direct tips found, falling back to place search...');
      
      const allPlaces = [];
      
      // Search for different types of places
      for (const term of searchTerms) {
        try {
          const places = await this.searchPlaces(term, location, 10);
          allPlaces.push(...places);
          
          // Add delay between searches
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          strapi.log.error(`Error searching for ${term}:`, error);
        }
      }
      
      // Remove duplicates based on fsq_id
      const uniquePlaces = allPlaces.filter((place, index, self) => 
        index === self.findIndex(p => p.fsq_id === place.fsq_id)
      );
      
      strapi.log.info(`Found ${uniquePlaces.length} unique Foursquare places`);
      
      // Fetch reviews for all places
      const reviews = await this.fetchReviewsForPlaces(uniquePlaces, 3);
      
      strapi.log.info(`✅ Foursquare review fetch completed: ${reviews.length} reviews`);
      return reviews;
    } catch (error) {
      strapi.log.error('Error in Foursquare review fetch:', error);
      return [];
    }
  }
}

module.exports = FoursquareService;
