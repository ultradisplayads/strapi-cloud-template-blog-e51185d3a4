'use strict';

const axios = require('axios');

/**
 * Currency converter controller
 */

// Cache for exchange rates (5 minutes)
let ratesCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minutes
};

// Supported currencies with Thai Baht as primary
const supportedCurrencies = [
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' }
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
  'CNY': 5.05,
  'HKD': 4.67,
  'TWD': 1.14,
  'AUD': 24.20,
  'CAD': 26.80,
  'CHF': 40.50,
  'NZD': 22.40,
  'INR': 0.44,
  'RUB': 0.38
};

/**
 * Fetch exchange rates from external API
 */
async function fetchExchangeRates() {
  try {
    // Try multiple APIs for better reliability
    const apis = [
      {
        url: 'https://api.exchangerate-api.com/v4/latest/THB',
        parser: (data) => data.rates
      },
      {
        url: 'https://api.fxratesapi.com/latest?base=THB',
        parser: (data) => data.rates
      },
      {
        url: 'https://api.currencyapi.com/v3/latest?apikey=free&currencies=USD,EUR,GBP,JPY,KRW,SGD,MYR,IDR,PHP,VND,CNY,HKD,TWD,AUD,CAD,CHF,NZD,INR,RUB&base_currency=THB',
        parser: (data) => {
          const rates = {};
          Object.entries(data.data).forEach(([code, info]) => {
            rates[code] = info.value;
          });
          return rates;
        }
      }
    ];

    for (const api of apis) {
      try {
        console.log(`🔄 Fetching rates from: ${api.url}`);
        const response = await axios.get(api.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Pattaya1-Currency-Converter/1.0'
          }
        });

        if (response.status === 200 && response.data) {
          const rates = api.parser(response.data);
          console.log('✅ Successfully fetched exchange rates');
          return {
            rates,
            timestamp: new Date().toISOString(),
            source: api.url
          };
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch from ${api.url}:`, error.message);
        continue;
      }
    }

    // If all APIs fail, use fallback rates
    console.log('🔄 Using fallback exchange rates');
    return {
      rates: fallbackRates,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };

  } catch (error) {
    console.error('❌ Error fetching exchange rates:', error);
    throw new Error('Failed to fetch exchange rates');
  }
}

/**
 * Get cached or fresh exchange rates
 */
async function getExchangeRates() {
  const now = Date.now();
  
  // Check if cache is valid
  if (ratesCache.data && ratesCache.timestamp && 
      (now - ratesCache.timestamp) < ratesCache.ttl) {
    console.log('📦 Using cached exchange rates');
    return ratesCache.data;
  }

  // Fetch fresh rates
  console.log('🔄 Fetching fresh exchange rates');
  const ratesData = await fetchExchangeRates();
  
  // Update cache
  ratesCache.data = ratesData;
  ratesCache.timestamp = now;
  
  return ratesData;
}

/**
 * Get exchange rates
 */
module.exports.getRates = async (ctx) => {
  try {
    const ratesData = await getExchangeRates();
    
    ctx.body = {
      success: true,
      data: {
        rates: ratesData.rates,
        timestamp: ratesData.timestamp,
        source: ratesData.source,
        baseCurrency: 'THB'
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
 * Convert currency
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
    
    if (from === 'THB' && to !== 'THB') {
      // Convert from THB to another currency
      const rate = rates[to];
      if (!rate) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Exchange rate not available for ${to}`
        };
        return;
      }
      result = numAmount / rate;
    } else if (from !== 'THB' && to === 'THB') {
      // Convert from another currency to THB
      const rate = rates[from];
      if (!rate) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Exchange rate not available for ${from}`
        };
        return;
      }
      result = numAmount * rate;
    } else if (from !== 'THB' && to !== 'THB') {
      // Convert between two non-THB currencies via THB
      const fromRate = rates[from];
      const toRate = rates[to];
      
      if (!fromRate || !toRate) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Exchange rates not available for ${from} or ${to}`
        };
        return;
      }
      
      // Convert: from -> THB -> to
      const thbAmount = numAmount * fromRate;
      result = thbAmount / toRate;
    } else {
      // Same currency
      result = numAmount;
    }

    ctx.body = {
      success: true,
      data: {
        from: {
          currency: from,
          amount: numAmount
        },
        to: {
          currency: to,
          amount: Math.round(result * 100) / 100 // Round to 2 decimal places
        },
        rate: from === to ? 1 : (from === 'THB' ? (1 / rates[to]) : (to === 'THB' ? rates[from] : (rates[from] / rates[to]))),
        timestamp: ratesData.timestamp,
        source: ratesData.source
      }
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
 * Get supported currencies
 */
module.exports.getCurrencies = async (ctx) => {
  try {
    ctx.body = {
      success: true,
      data: {
        currencies: supportedCurrencies,
        baseCurrency: 'THB',
        lastUpdated: new Date().toISOString()
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
 * Get historical rates (simplified - returns current rates with timestamp)
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
    
    // For now, return current rate with historical timestamps
    // In a production app, you'd fetch real historical data
    const history = [];
    const currentRate = ratesData.rates[currency];
    
    if (!currentRate) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: `Exchange rate not available for ${currency}`
      };
      return;
    }

    // Generate mock historical data (in production, use real historical API)
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some variation to simulate historical data
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const historicalRate = currentRate * (1 + variation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        rate: Math.round(historicalRate * 10000) / 10000,
        timestamp: date.toISOString()
      });
    }

    ctx.body = {
      success: true,
      data: {
        currency,
        baseCurrency: 'THB',
        history,
        currentRate,
        period: `${days} days`
      }
    };

  } catch (error) {
    console.error('Error in getHistory:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to get historical rates',
      message: error.message
    };
  }
};

/**
 * Get widget settings
 */
module.exports.getSettings = async (ctx) => {
  try {
    const settings = {
      enabled: true,
      defaultFromCurrency: 'THB',
      defaultToCurrency: 'USD',
      updateFrequencyMinutes: 5,
      supportedCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD', 'MYR', 'IDR', 'PHP', 'VND', 'CNY', 'HKD', 'TWD', 'AUD', 'CAD', 'CHF', 'NZD', 'INR', 'RUB'],
      sponsoredEnabled: false,
      sponsorName: null,
      sponsorLogo: null
    };
    
    ctx.body = {
      success: true,
      data: settings
    };
  } catch (error) {
    console.error('Error in getSettings:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to get widget settings',
      message: error.message
    };
  }
};