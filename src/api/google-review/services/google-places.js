'use strict';

/**
 * Google Places API Service
 * Handles fetching reviews from Google Places API
 */

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyCKY3PBPFHN5AKC4vcytYyo8O6LKXqY5OY';
    this.baseUrl = 'https://places.googleapis.com/v1';
    this.rateLimit = {
      daily: 100000,
      perMinute: 1000
    };
  }

  /**
   * Check if Google Places API is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Get authentication headers for Google Places API
   */
  getAuthHeaders() {
    if (!this.isConfigured()) {
      throw new Error('Google Places API key not configured');
    }
    
    return {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey
    };
  }

  /**
   * Search for places in Pattaya
   */
  async searchPlaces(query = 'Pattaya Beach Thailand', limit = 10) {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Google Places API not configured, skipping place search');
        return [];
      }

      const url = `${this.baseUrl}/places:searchText`;
      const body = {
        textQuery: query,
        maxResultCount: limit
      };

      strapi.log.info(`🔍 Searching Google Places: ${query}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.rating,places.userRatingCount'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Google Places API error: ${response.status} - ${errorText}`);
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      strapi.log.info(`✅ Found ${data.places?.length || 0} Google Places`);

      return data.places || [];
    } catch (error) {
      strapi.log.error('Error searching Google Places:', error);
      return [];
    }
  }

  /**
   * Get place details including reviews
   */
  async getPlaceDetails(placeId) {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Google Places API not configured, skipping place details');
        return null;
      }

      const url = `${this.baseUrl}/places/${placeId}`;

      strapi.log.info(`🔍 Getting Google Places details: ${placeId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'X-Goog-FieldMask': 'id,displayName,location,rating,userRatingCount,reviews,formattedAddress'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Google Places API error: ${response.status} - ${errorText}`);
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      strapi.log.info(`✅ Retrieved Google Places details for: ${data.displayName?.text}`);

      return data;
    } catch (error) {
      strapi.log.error(`Error getting Google Places details for ${placeId}:`, error);
      return null;
    }
  }

  /**
   * Transform Google Places review to our format
   */
  transformGoogleReview(review, placeData) {
    return {
      source_platform: 'Google',
      source_review_id: review.name,
      AuthorName: review.authorAttribution?.displayName || 'Anonymous',
      Rating: review.rating || 0,
      ReviewText: review.text?.text || '',
      ReviewTime: review.publishTime || new Date().toISOString(),
      RelativeTimeDescription: review.relativePublishTimeDescription || 'Recently',
      BusinessName: placeData.displayName?.text || 'Unknown Business',
      BusinessAddress: placeData.formattedAddress || 'Unknown Address',
      AuthorProfileUrl: review.authorAttribution?.uri || null,
      AuthorProfilePhotoUrl: review.authorAttribution?.photoUri || null,
      Language: review.text?.languageCode || 'en',
      Verified: true,
      GoogleMapsUri: review.googleMapsUri || null
    };
  }

  /**
   * Fetch reviews for Pattaya places
   */
  async fetchReviews(searchTerms = ['Pattaya Beach Thailand', 'restaurants Pattaya', 'hotels Pattaya'], limit = 10) {
    try {
      if (!this.isConfigured()) {
        strapi.log.warn('Google Places API not configured, skipping review fetch');
        return [];
      }

      strapi.log.info('🔄 Starting Google Places review fetch...');
      
      let allReviews = [];

      for (const searchTerm of searchTerms) {
        try {
          // Search for places
          const places = await this.searchPlaces(searchTerm, 3);
          
          for (const place of places) {
            // Get place details with reviews
            const placeDetails = await this.getPlaceDetails(place.id);
            
            if (placeDetails && placeDetails.reviews) {
              const transformedReviews = placeDetails.reviews.map(review => 
                this.transformGoogleReview(review, placeDetails)
              );
              
              allReviews = allReviews.concat(transformedReviews);
              strapi.log.info(`✅ Fetched ${transformedReviews.length} reviews from ${placeDetails.displayName?.text}`);
            }
          }
        } catch (error) {
          strapi.log.error(`Error fetching reviews for ${searchTerm}:`, error);
        }
      }

      // Remove duplicates based on source_review_id
      const uniqueReviews = allReviews.filter((review, index, self) => 
        index === self.findIndex(r => r.source_review_id === review.source_review_id)
      );

      strapi.log.info(`✅ Google Places review fetch completed: ${uniqueReviews.length} unique reviews`);
      
      return uniqueReviews.slice(0, limit);
    } catch (error) {
      strapi.log.error('Error in Google Places review fetch:', error);
      return [];
    }
  }
}

module.exports = GooglePlacesService;
