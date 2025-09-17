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
  /**
   * @param {{ lat: number, lon: number, units?: 'metric'|'imperial'|string }} params
   * @returns {Promise<any>}
   */
  async getWeather({ lat, lon, units = 'metric' }) {
    try {
      // Round coordinates for caching
      const latRounded = this.roundCoord(lat);
      const lonRounded = this.roundCoord(lon);

      // Normalize units
      const unitsNormalized = units === 'imperial' ? 'imperial' : 'metric';

      // Check cache first
      const cachedData = await this.getCachedWeather(latRounded, lonRounded, unitsNormalized);
      if (cachedData) {
        console.log(`Weather cache hit for ${latRounded}, ${lonRounded} (${units})`);
        return cachedData;
      }

      console.log(`Weather cache miss for ${latRounded}, ${lonRounded} (${units}), fetching from API`);
      
      // Fetch fresh data from OpenWeatherMap
      const weatherData = await this.fetchWeatherFromAPI(lat, lon, unitsNormalized);
      
      // Cache the data
      await this.cacheWeatherData(latRounded, lonRounded, unitsNormalized, weatherData);
      
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
   * @param {'metric'|'imperial'} units - Units (metric or imperial)
   * @returns {Promise<any|null>} Cached weather data or null if expired/not found
   */
  async getCachedWeather(latRounded, lonRounded, units) {
    try {
      const cacheEntry = await strapi.entityService.findMany('api::weather-cache.weather-cache', {
        filters: {
          latRounded,
          lonRounded,
          units: /** @type {any} */ (units),
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
   * @param {number} latRounded
   * @param {number} lonRounded
   * @param {'metric'|'imperial'} units
   * @param {any} data
   * @returns {Promise<void>}
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
          units: /** @type {any} */ (units)
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
            units: /** @type {any} */ (units),
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
  /**
   * @param {number} lat
   * @param {number} lon
   * @param {'metric'|'imperial'} units
   * @returns {Promise<any>}
   */
  async fetchWeatherFromAPI(lat, lon, units) {
    const apiKey = process.env.OWM_API_KEY;
    console.log('🔑 API Key check:', apiKey ? 'Present' : 'Missing');
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    const unitsParam = units === 'imperial' ? 'imperial' : 'metric';
    
    try {
      // Fetch current weather, forecast, and air quality (free tier)
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

      // Optionally fetch tide times
      let tidesData = null;
      try {
        tidesData = await this.fetchTides(lat, lon);
      } catch (tideErr) {
        console.warn('Tide data unavailable:', tideErr.message || tideErr);
      }
      
      // Fetch marine wave data from Open-Meteo (free, no key)
      let waveHeightM = null;
      try {
        waveHeightM = await this.fetchOpenMeteoWaveHeight(lat, lon);
      } catch (waveErr) {
        console.warn('Marine wave data unavailable:', waveErr.message || waveErr);
      }

      // Try One Call (alerts + UV); if it fails, proceed without it
      let oneCallData = null;
      try {
        const oc = await axios.get(`https://api.openweathermap.org/data/3.0/onecall`, {
          params: { lat, lon, appid: apiKey, units: unitsParam, exclude: 'minutely,hourly,daily' }
        });
        oneCallData = oc.data;
      } catch (ocErr) {
        const status = ocErr?.response?.status;
        if (status === 401) {
          strapi.log.warn('OpenWeather One Call 3.0 unauthorized; proceeding without alerts/UV');
        } else {
          strapi.log.warn(`OpenWeather One Call fetch failed (${status || 'n/a'}): ${ocErr?.message || ocErr}`);
        }
      }

      // Process the data
      const weatherData = this.processWeatherData(
        currentResponse.data,
        forecastResponse.data,
        airQualityResponse.data,
        oneCallData,
        tidesData,
        waveHeightM,
        units
      );

      // Add location name and suggestions
      weatherData.location.name = await this.getLocationName(lat, lon);
      weatherData.suggestions = await this.getWeatherSuggestions(weatherData.current);
      // UV fallback if missing
      if (weatherData.current.uvIndex == null) {
        try {
          const uv = await this.fetchOpenMeteoUVIndex(lat, lon);
          if (uv != null) weatherData.current.uvIndex = uv;
        } catch (_) {}
      }
      
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
  /**
   * @param {any} currentData
   * @param {any} forecastData
   * @param {any} airQualityData
   * @param {any} oneCallData
   * @param {any} tidesData
   * @param {number|null} waveHeightM
   * @param {'metric'|'imperial'} units
   */
  processWeatherData(currentData, forecastData, airQualityData, oneCallData, tidesData, waveHeightM, units) {
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
      uvIndex: oneCallData?.current?.uvi ?? null,
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

    // Process alerts (if any) from One Call API
    const alerts = (oneCallData && Array.isArray(oneCallData.alerts))
      ? oneCallData.alerts.map(alert => ({
          event: alert.event,
          severity: alert.tags && alert.tags.length > 0 ? alert.tags[0] : 'info',
          start: new Date(alert.start * 1000).toISOString(),
          end: new Date(alert.end * 1000).toISOString(),
          description: alert.description
        }))
      : [];

    // Process marine/tide data if available
    let marine = null;
    if (tidesData && tidesData.data && Array.isArray(tidesData.data.weather) && tidesData.data.weather.length > 0) {
      const todayWeather = tidesData.data.weather[0];
      const tideArray = todayWeather.tides && Array.isArray(todayWeather.tides) && todayWeather.tides.length > 0
        ? todayWeather.tides[0].tide
        : [];
      if (Array.isArray(tideArray) && tideArray.length > 0) {
        const tideTimes = tideArray.map((t) => ({
          type: (t.tide_type && String(t.tide_type).toLowerCase().includes('high')) ? 'High' : 'Low',
          time: new Date(t.tideDateTime).toISOString()
        }));
        marine = /** @type {any} */ ({
          tideTimes,
          seaState: null,
          waveHeightM: null
        });
      }
    }

    // Map wave height to sea state if available
    if (typeof waveHeightM === 'number') {
      const seaState = waveHeightM < 0.5 ? 'Calm' : waveHeightM <= 1.5 ? 'Moderate' : 'Rough';
      marine = /** @type {any} */ (marine || {});
      /** @type {any} */ (marine).seaState = seaState;
      /** @type {any} */ (marine).waveHeightM = Number(waveHeightM.toFixed(2));
    }

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
   * Fetch today's tide extremes using World Weather Online Marine API
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<any|null>}
   */
  async fetchTides(lat, lon) {
    const apiKey = process.env.WWO_API_KEY;
    if (!apiKey) return null;
    const url = 'https://api.worldweatheronline.com/premium/v1/marine.ashx';
    const params = { key: apiKey, q: `${lat},${lon}`, format: 'json', tide: 'yes' };
    const res = await axios.get(url, { params });
    return res.data;
  },

  /**
   * Fetch current wave height (meters) from Open-Meteo Marine API (no key required)
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<number|null>}
   */
  async fetchOpenMeteoWaveHeight(lat, lon) {
    const url = 'https://marine-api.open-meteo.com/v1/marine';
    const params = {
      latitude: lat,
      longitude: lon,
      hourly: 'wave_height',
      timezone: 'auto'
    };
    const res = await axios.get(url, { params });
    const times = res.data?.hourly?.time;
    const heights = res.data?.hourly?.wave_height;
    if (!Array.isArray(times) || !Array.isArray(heights) || heights.length === 0) {
      return null;
    }
    // Pick the entry closest to now (local time per API)
    const now = new Date();
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]).getTime();
      const diff = Math.abs(t - now.getTime());
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    const val = heights[bestIdx];
    return typeof val === 'number' ? val : null;
  },

  /**
   * Fetch current UV index via Open-Meteo (fallback when OWM One Call is unavailable)
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<number|null>}
   */
  async fetchOpenMeteoUVIndex(lat, lon) {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude: lat,
      longitude: lon,
      hourly: 'uv_index',
      timezone: 'auto'
    };
    const res = await axios.get(url, { params });
    const times = res.data?.hourly?.time;
    const uvs = res.data?.hourly?.uv_index;
    if (!Array.isArray(times) || !Array.isArray(uvs) || uvs.length === 0) return null;
    const now = new Date();
    let bestIdx = 0, bestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]).getTime();
      const d = Math.abs(t - now.getTime());
      if (d < bestDiff) { bestDiff = d; bestIdx = i; }
    }
    const val = uvs[bestIdx];
    return typeof val === 'number' ? Math.round(val) : null;
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
  /**
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<string>}
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
  /**
   * @param {any} currentWeather
   * @returns {Promise<any[]>}
   */
  async getWeatherSuggestions(currentWeather) {
    try {
      const mapCondition = (cond) => {
        const c = String(cond || '').toLowerCase();
        if (c === 'clear') return 'sunny';
        if (c === 'clouds' || c === 'cloudy') return 'cloudy';
        if (c === 'rain') return 'rainy';
        if (c === 'thunderstorm') return 'thunderstorm';
        if (c === 'drizzle') return 'drizzle';
        return c;
      };
      const normalized = mapCondition(currentWeather.condition);
      const suggestions = await strapi.entityService.findMany('api::weather-activity-suggestion.weather-activity-suggestion', {
        filters: {
          isActive: true,
          weatherCondition: /** @type {any} */ (normalized)
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
  /**
   * @returns {Promise<any>}
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
