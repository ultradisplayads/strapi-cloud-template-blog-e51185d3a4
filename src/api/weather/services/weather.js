'use strict';

/**
 * Enhanced weather service with geolocation, caching, and comprehensive data
 */

const axios = require('axios');

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::weather.weather', ({ strapi }) => ({
  /**
   * Round coordinates to reduce cache fragmentation
   * @param {number} value - Coordinate value
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {number} Rounded coordinate
   */
  roundCoord(value, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Get weather data for specific coordinates
   * @param {Object} params - Parameters object
   * @param {number} params.lat - Latitude
   * @param {number} params.lon - Longitude
   * @param {string} params.units - Units (metric or imperial)
   * @returns {Object} Weather data
   */
  async getWeather({ lat, lon, units = 'metric' }) {
    try {
      // Round coordinates for caching
      const latRounded = this.roundCoord(lat);
      const lonRounded = this.roundCoord(lon);

      // Check cache first
      const cachedData = await this.getCachedWeather(latRounded, lonRounded, units);
      if (cachedData) {
        console.log(`Weather cache hit for ${latRounded}, ${lonRounded} (${units})`);
        return cachedData;
      }

      console.log(`Weather cache miss for ${latRounded}, ${lonRounded} (${units}), fetching from API`);
      
      // Fetch fresh data from OpenWeatherMap
      const weatherData = await this.fetchWeatherFromAPI(lat, lon, units);
      
      // Cache the data
      await this.cacheWeatherData(latRounded, lonRounded, units, weatherData);
      
      return weatherData;
    } catch (error) {
      console.error('Error in getWeather:', error);
      throw error;
    }
  },

  /**
   * Get cached weather data
   * @param {number} latRounded - Rounded latitude
   * @param {number} lonRounded - Rounded longitude
   * @param {string} units - Units (metric or imperial)
   * @returns {Object|null} Cached weather data or null if expired/not found
   */
  async getCachedWeather(latRounded, lonRounded, units) {
    try {
      const cacheEntry = await strapi.entityService.findMany('api::weather-cache.weather-cache', {
        filters: {
          latRounded,
          lonRounded,
          units,
          expiresAt: {
            $gt: new Date().toISOString()
          }
        },
        limit: 1
      });

      if (cacheEntry && cacheEntry.length > 0) {
        return cacheEntry[0].payload;
      }

      return null;
    } catch (error) {
      console.error('Error getting cached weather:', error);
      return null;
    }
  },

  /**
   * Cache weather data
   * @param {number} latRounded - Rounded latitude
   * @param {number} lonRounded - Rounded longitude
   * @param {string} units - Units (metric or imperial)
   * @param {Object} data - Weather data to cache
   */
  async cacheWeatherData(latRounded, lonRounded, units, data) {
    try {
      // Get update frequency from settings
      const settings = await this.getWeatherSettings();
      const updateFrequencyMs = (settings.updateFrequencyMinutes || 30) * 60 * 1000;
      
      const expiresAt = new Date(Date.now() + updateFrequencyMs);

      // Check if cache entry already exists
      const existingCache = await strapi.entityService.findMany('api::weather-cache.weather-cache', {
        filters: {
          latRounded,
          lonRounded,
          units
        },
        limit: 1
      });

      if (existingCache && existingCache.length > 0) {
        // Update existing cache entry
        await strapi.entityService.update('api::weather-cache.weather-cache', existingCache[0].id, {
          data: {
            payload: data,
            expiresAt: expiresAt.toISOString()
          }
        });
      } else {
        // Create new cache entry
        await strapi.entityService.create('api::weather-cache.weather-cache', {
          data: {
            latRounded,
            lonRounded,
            units,
            payload: data,
            expiresAt: expiresAt.toISOString()
          }
        });
      }

      console.log(`Weather data cached for ${latRounded}, ${lonRounded} (${units}) until ${expiresAt}`);
    } catch (error) {
      console.error('Error caching weather data:', error);
    }
  },

  /**
   * Fetch weather data from OpenWeatherMap API
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Units (metric or imperial)
   * @returns {Object} Weather data
   */
  async fetchWeatherFromAPI(lat, lon, units) {
    const apiKey = process.env.OWM_API_KEY;
    console.log('🔑 API Key check:', apiKey ? 'Present' : 'Missing');
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    const unitsParam = units === 'imperial' ? 'imperial' : 'metric';
    
    try {
      // Fetch current weather, forecast, and air quality
      const [currentResponse, forecastResponse, airQualityResponse] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
          params: {
            lat,
            lon,
            appid: apiKey,
            units: unitsParam
          }
        }),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
          params: {
            lat,
            lon,
            appid: apiKey,
            units: unitsParam
          }
        }),
        axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
          params: {
            lat,
            lon,
            appid: apiKey
          }
        })
      ]);

      // Process the data
      const weatherData = this.processWeatherData(
        currentResponse.data,
        forecastResponse.data,
        airQualityResponse.data,
        units
      );

      // Add location name and suggestions
      weatherData.location.name = await this.getLocationName(lat, lon);
      weatherData.suggestions = await this.getWeatherSuggestions(weatherData.current);
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather from API:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather data from OpenWeatherMap');
    }
  },

  /**
   * Process raw weather API data into unified format
   * @param {Object} currentData - Current weather data
   * @param {Object} forecastData - Forecast data
   * @param {Object} airQualityData - Air quality data
   * @param {string} units - Units (metric or imperial)
   * @returns {Object} Processed weather data
   */
  processWeatherData(currentData, forecastData, airQualityData, units) {
    // Process current weather
    const current = {
      temperature: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      condition: currentData.weather[0].main,
      description: currentData.weather[0].description,
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed,
      pressure: currentData.main.pressure,
      visibility: currentData.visibility / 1000, // Convert to km
      uvIndex: 7, // Default value, can be enhanced later
      icon: currentData.weather[0].icon,
      sunrise: new Date(currentData.sys.sunrise * 1000).toISOString(),
      sunset: new Date(currentData.sys.sunset * 1000).toISOString()
    };

    // Process hourly forecast (next 12 hours)
    const hourly = forecastData.list.slice(0, 4).map(item => ({
      time: new Date(item.dt * 1000).toISOString(),
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon
    }));

    // Process daily forecast (next 5 days)
    const daily = this.processDailyForecast(forecastData.list);

    // Process air quality
    const airQuality = airQualityData ? {
      index: airQualityData.list[0].main.aqi,
      level: this.getAirQualityLevel(airQualityData.list[0].main.aqi),
      pm25: airQualityData.list[0].components.pm2_5,
      pm10: airQualityData.list[0].components.pm10,
      o3: airQualityData.list[0].components.o3,
      no2: airQualityData.list[0].components.no2
    } : null;

    // Process alerts (if any)
    const alerts = currentData.alerts || [];

    // Process marine data (placeholder for now)
    const marine = {
      tideTimes: [
        { type: 'High', time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() },
        { type: 'Low', time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() }
      ],
      seaState: 'Moderate',
      waveHeightM: 0.8
    };

    return {
      location: {
        lat: currentData.coord.lat,
        lon: currentData.coord.lon
      },
      current,
      hourly,
      daily,
      airQuality,
      alerts,
      marine,
      units,
      lastUpdated: new Date().toISOString(),
      source: 'OpenWeatherMap'
    };
  },

  /**
   * Process daily forecast data
   * @param {Array} forecastList - Raw forecast list
   * @returns {Array} Processed daily forecast
   */
  processDailyForecast(forecastList) {
    const dailyData = new Map();

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date: new Date(item.dt * 1000).toISOString(),
          high: item.main.temp_max,
          low: item.main.temp_min,
          condition: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        });
      } else {
        const existing = dailyData.get(date);
        existing.high = Math.max(existing.high, item.main.temp_max);
        existing.low = Math.min(existing.low, item.main.temp_min);
      }
    });

    return Array.from(dailyData.values())
      .slice(0, 5)
      .map(day => ({
        ...day,
        high: Math.round(day.high),
        low: Math.round(day.low)
      }));
  },

  /**
   * Get air quality level description
   * @param {number} aqi - Air quality index
   * @returns {string} Air quality level
   */
  getAirQualityLevel(aqi) {
    switch (aqi) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  },

  /**
   * Get location name from coordinates (reverse geocoding)
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {string} Location name
   */
  async getLocationName(lat, lon) {
    try {
      const apiKey = process.env.OWM_API_KEY;
      const response = await axios.get(`http://api.openweathermap.org/geo/1.0/reverse`, {
        params: {
          lat,
          lon,
          limit: 1,
          appid: apiKey
        }
      });

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        return `${location.name}, ${location.country}`;
      }
    } catch (error) {
      console.error('Error getting location name:', error);
    }

    // Fallback to coordinates
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  },

  /**
   * Get weather-based activity suggestions
   * @param {Object} currentWeather - Current weather data
   * @returns {Array} Activity suggestions
   */
  async getWeatherSuggestions(currentWeather) {
    try {
      const suggestions = await strapi.entityService.findMany('api::weather-activity-suggestion.weather-activity-suggestion', {
        filters: {
          isActive: true,
          weatherCondition: currentWeather.condition.toLowerCase()
        },
        sort: { priority: 'asc' }
      });

      return suggestions.slice(0, 3).map(suggestion => ({
        title: suggestion.title,
        description: suggestion.description,
        link: suggestion.link,
        icon: suggestion.icon,
        priority: suggestion.priority
      }));
    } catch (error) {
      console.error('Error getting weather suggestions:', error);
      return [];
    }
  },

  /**
   * Get weather settings
   * @returns {Object} Weather settings
   */
  async getWeatherSettings() {
    try {
      const settings = await strapi.entityService.findMany('api::weather-setting.weather-setting', {
        limit: 1
      });

      if (settings && settings.length > 0) {
        return settings[0];
      }

      // Return default settings if none found
      return {
        defaultCityName: 'Pattaya City',
        defaultLatitude: 12.9236,
        defaultLongitude: 100.8825,
        units: 'metric',
        updateFrequencyMinutes: 30,
        widgetEnabled: true,
        sponsoredEnabled: false
      };
    } catch (error) {
      console.error('Error getting weather settings:', error);
      return {
        defaultCityName: 'Pattaya City',
        defaultLatitude: 12.9236,
        defaultLongitude: 100.8825,
        units: 'metric',
        updateFrequencyMinutes: 30,
        widgetEnabled: true,
        sponsoredEnabled: false
      };
    }
  }
}));
