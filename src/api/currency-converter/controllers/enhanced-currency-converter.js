'use strict';

const axios = require('axios');

/**
 * Enhanced Currency converter controller with real-time data
 */

// Cache for exchange rates (2 minutes for more real-time updates)
let ratesCache = {
  data: null,
  timestamp: null,
  ttl: 2 * 60 * 1000 // 2 minutes
};

// Enhanced supported currencies with more details
const supportedCurrencies = [
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', region: 'Asia', isPopular: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', region: 'North America', isPopular: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', region: 'Europe', isPopular: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', region: 'Europe', isPopular: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', region: 'Asia', isPopular: true },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', region: 'Asia', isPopular: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', region: 'Asia', isPopular: true },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', region: 'Asia', isPopular: true },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', region: 'Asia', isPopular: true },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', region: 'Asia', isPopular: true },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', region: 'Asia', isPopular: true },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', region: 'Asia', isPopular: true },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', region: 'Asia', isPopular: true },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', region: 'Asia', isPopular: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', region: 'Oceania', isPopular: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', region: 'North America', isPopular: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', region: 'Europe', isPopular: true },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', region: 'Oceania', isPopular: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', region: 'Asia', isPopular: true },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', region: 'Europe', isPopular: true },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', region: 'South America', isPopular: true },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', region: 'North America', isPopular: true },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', region: 'Africa', isPopular: true },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', region: 'Europe', isPopular: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', region: 'Middle East', isPopular: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', region: 'Middle East', isPopular: true },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦', region: 'Middle East', isPopular: true },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', region: 'Middle East', isPopular: true },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', flag: '🇧🇭', region: 'Middle East', isPopular: true },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲', region: 'Middle East', isPopular: true },
];

// Fallback rates (updated periodically)
const fallbackRates = {
  'USD': 36.50,
  'EUR': 39.80,
  'GBP': 46.20,
  'JPY': 0.24,
  'KRW': 0.027,
  'SGD': 27.10,
  'MYR': 7.80,
  'IDR': 0.0023,
  'PHP': 0.65,
  'VND': 0.0015,
  'CNY': 5.10,
  'HKD': 4.65,
  'TWD': 1.15,
  'AUD': 24.20,
  'CAD': 27.10,
  'CHF': 40.50,
  'NZD': 22.80,
  'INR': 0.44,
  'RUB': 0.38,
  'BRL': 7.20,
  'MXN': 2.10,
  'ZAR': 2.05,
  'TRY': 1.20,
  'AED': 9.95,
  'SAR': 9.75,
  'QAR': 10.05,
  'KWD': 118.50,
  'BHD': 96.80,
  'OMR': 94.90,
};

// Multiple API sources for better reliability
const API_SOURCES = [
  {
    name: 'ExchangeRate-API',
    url: 'https://api.exchangerate-api.com/v4/latest/THB',
    parseResponse: (data) => data.rates
  },
  {
    name: 'Fixer.io',
    url: 'https://api.fixer.io/latest?base=THB',
    parseResponse: (data) => data.rates
  },
  {
    name: 'CurrencyAPI',
    url: 'https://api.currencyapi.com/v3/latest?base_currency=THB',
    parseResponse: (data) => data.data
  }
];

/**
 * Fetch exchange rates from multiple sources
 */
async function getExchangeRates() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (ratesCache.data && ratesCache.timestamp && (now - ratesCache.timestamp) < ratesCache.ttl) {
    return ratesCache.data;
  }

  let ratesData = null;
  let source = 'fallback';

  // Try each API source
  for (const apiSource of API_SOURCES) {
    try {
      console.log(`Fetching rates from ${apiSource.name}...`);
      
      const response = await axios.get(apiSource.url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Pattaya1-Currency-Converter/1.0'
        }
      });

      if (response.data && response.status === 200) {
        const rates = apiSource.parseResponse(response.data);
        
        if (rates && Object.keys(rates).length > 0) {
          ratesData = {
            rates: rates,
            timestamp: new Date().toISOString(),
            source: apiSource.name,
            baseCurrency: 'THB'
          };
          source = apiSource.name;
          console.log(`Successfully fetched rates from ${apiSource.name}`);
          break;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${apiSource.name}:`, error.message);
      continue;
    }
  }

  // Fallback to cached data or default rates
  if (!ratesData) {
    console.log('Using fallback rates');
    ratesData = {
      rates: fallbackRates,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      baseCurrency: 'THB'
    };
  }

  // Cache the result
  ratesCache.data = ratesData;
  ratesCache.timestamp = now;
  
  return ratesData;
}

/**
 * Get exchange rates with enhanced data
 */
module.exports.getRates = async (ctx) => {
  try {
    const ratesData = await getExchangeRates();
    
    // Add trending information
    const trendingCurrencies = generateTrendingCurrencies(ratesData.rates);
    
    ctx.body = {
      success: true,
      data: {
        rates: ratesData.rates,
        timestamp: ratesData.timestamp,
        source: ratesData.source,
        baseCurrency: 'THB',
        trending: trendingCurrencies,
        lastUpdated: ratesData.timestamp
      }
    };
  } catch (error) {
    console.error('Error in getRates:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to fetch exchange rates',
      message: error.message
    };
  }
};

/**
 * Convert currency with enhanced result
 */
module.exports.convert = async (ctx) => {
  try {
    const { from, to, amount } = ctx.query;
    
    if (!from || !to || !amount) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Missing required parameters: from, to, amount'
      };
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Invalid amount. Must be a positive number.'
      };
      return;
    }

    const ratesData = await getExchangeRates();
    const rates = ratesData.rates;

    let result;
    let rate;
    
    if (from === 'THB' && to !== 'THB') {
      // Converting from THB to another currency
      // rates[to] gives us "units of 'to' currency per 1 THB"
      // So to convert from THB to 'to', we multiply by the rate
      rate = rates[to] || 1;
      result = {
        from: {
          currency: from,
          amount: numAmount,
          symbol: getCurrencySymbol(from)
        },
        to: {
          currency: to,
          amount: numAmount * rate,
          symbol: getCurrencySymbol(to)
        },
        rate: rate,
        timestamp: ratesData.timestamp,
        source: ratesData.source,
        change24h: generateMockChange24h(),
        trend: generateMockTrend()
      };
    } else if (from !== 'THB' && to === 'THB') {
      // Converting from another currency to THB
      // rates[from] gives us "units of 'from' currency per 1 THB"
      // So to convert from 'from' to THB, we divide by the rate
      rate = 1 / (rates[from] || 1);
      result = {
        from: {
          currency: from,
          amount: numAmount,
          symbol: getCurrencySymbol(from)
        },
        to: {
          currency: to,
          amount: numAmount * rate,
          symbol: getCurrencySymbol(to)
        },
        rate: rate,
        timestamp: ratesData.timestamp,
        source: ratesData.source,
        change24h: generateMockChange24h(),
        trend: generateMockTrend()
      };
    } else if (from !== 'THB' && to !== 'THB') {
      // Converting between two non-THB currencies via THB
      // First convert 'from' to THB, then THB to 'to'
      const fromToTHB = 1 / (rates[from] || 1);  // THB per unit of 'from'
      const thbToTo = rates[to] || 1;  // 'to' per THB
      rate = fromToTHB * thbToTo;
      
      result = {
        from: {
          currency: from,
          amount: numAmount,
          symbol: getCurrencySymbol(from)
        },
        to: {
          currency: to,
          amount: numAmount * rate,
          symbol: getCurrencySymbol(to)
        },
        rate: rate,
        timestamp: ratesData.timestamp,
        source: ratesData.source,
        change24h: generateMockChange24h(),
        trend: generateMockTrend()
      };
    } else {
      // Same currency
      result = {
        from: {
          currency: from,
          amount: numAmount,
          symbol: getCurrencySymbol(from)
        },
        to: {
          currency: to,
          amount: numAmount,
          symbol: getCurrencySymbol(to)
        },
        rate: 1,
        timestamp: ratesData.timestamp,
        source: ratesData.source,
        change24h: 0,
        trend: 'stable'
      };
    }

    ctx.body = {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error in convert:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to convert currency',
      message: error.message
    };
  }
};

/**
 * Get supported currencies with enhanced data
 */
module.exports.getCurrencies = async (ctx) => {
  try {
    const { search, region, popular } = ctx.query;
    
    let filteredCurrencies = [...supportedCurrencies];
    
    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCurrencies = filteredCurrencies.filter(currency =>
        currency.name.toLowerCase().includes(searchLower) ||
        currency.code.toLowerCase().includes(searchLower) ||
        currency.region.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by region
    if (region) {
      filteredCurrencies = filteredCurrencies.filter(currency =>
        currency.region.toLowerCase() === region.toLowerCase()
      );
    }
    
    // Filter by popular
    if (popular === 'true') {
      filteredCurrencies = filteredCurrencies.filter(currency => currency.isPopular);
    }
    
    ctx.body = {
      success: true,
      data: {
        currencies: filteredCurrencies,
        total: filteredCurrencies.length,
        baseCurrency: 'THB',
        lastUpdated: new Date().toISOString(),
        regions: [...new Set(supportedCurrencies.map(c => c.region))]
      }
    };
  } catch (error) {
    console.error('Error in getCurrencies:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to get currencies',
      message: error.message
    };
  }
};

/**
 * Get trending currencies
 */
module.exports.getTrending = async (ctx) => {
  try {
    const ratesData = await getExchangeRates();
    const trendingCurrencies = generateTrendingCurrencies(ratesData.rates);
    
    ctx.body = {
      success: true,
      data: {
        trending: trendingCurrencies,
        timestamp: ratesData.timestamp,
        source: ratesData.source
      }
    };
  } catch (error) {
    console.error('Error in getTrending:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to get trending currencies',
      message: error.message
    };
  }
};

/**
 * Get historical rates with enhanced data
 */
module.exports.getHistory = async (ctx) => {
  try {
    const { currency, days = 7 } = ctx.query;
    
    if (!currency) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Currency parameter is required'
      };
      return;
    }

    const ratesData = await getExchangeRates();
    const currentRate = ratesData.rates[currency];
    
    if (!currentRate) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Exchange rate not available for ${currency}`
      };
      return;
    }

    // Generate enhanced historical data
    const history = [];
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add realistic variation to simulate historical data
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const historicalRate = currentRate * (1 + variation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        rate: Math.round(historicalRate * 10000) / 10000,
        timestamp: date.toISOString(),
        change: i === 0 ? 0 : ((historicalRate - currentRate) / currentRate) * 100
      });
    }

    ctx.body = {
      success: true,
      data: {
        currency: currency,
        baseCurrency: 'THB',
        history: history,
        currentRate: currentRate,
        period: `${days} days`,
        symbol: getCurrencySymbol(currency),
        flag: getCurrencyFlag(currency)
      }
    };
  } catch (error) {
    console.error('Error in getHistory:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to fetch historical rates',
      message: error.message
    };
  }
};

/**
 * Get widget settings
 */
module.exports.getSettings = async (ctx) => {
  try {
    ctx.body = {
      success: true,
      data: {
        enabled: true,
        defaultFromCurrency: 'USD',
        defaultToCurrency: 'THB',
        updateFrequencyMinutes: 2, // More frequent updates
        supportedCurrencies: supportedCurrencies.map(c => c.code),
        sponsoredEnabled: false,
        regions: [...new Set(supportedCurrencies.map(c => c.region))],
        popularCurrencies: supportedCurrencies.filter(c => c.isPopular).map(c => c.code),
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in getSettings:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to get settings',
      message: error.message
    };
  }
};

// Helper functions
function getCurrencySymbol(code) {
  const currency = supportedCurrencies.find(c => c.code === code);
  return currency ? currency.symbol : code;
}

function getCurrencyFlag(code) {
  const currency = supportedCurrencies.find(c => c.code === code);
  return currency ? currency.flag : '🌍';
}

function generateMockChange24h() {
  return (Math.random() - 0.5) * 4; // -2% to +2%
}

function generateMockTrend() {
  const rand = Math.random();
  if (rand > 0.6) return 'up';
  if (rand < 0.4) return 'down';
  return 'stable';
}

function generateTrendingCurrencies(rates) {
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'SGD', 'AUD', 'CAD', 'KRW', 'INR'];
  
  return popularCurrencies.map((code, index) => {
    const currency = supportedCurrencies.find(c => c.code === code);
    const rate = rates[code] || 1;
    const change24h = generateMockChange24h();
    
    return {
      code,
      name: currency ? currency.name : code,
      flag: currency ? currency.flag : '🌍',
      symbol: currency ? currency.symbol : code,
      rate,
      change24h,
      changePercent24h: change24h, // Add the field the frontend expects
      trend: change24h > 0 ? 'up' : change24h < 0 ? 'down' : 'stable',
      volume: Math.random() * 1000000,
      rank: index + 1
    };
  });
}
