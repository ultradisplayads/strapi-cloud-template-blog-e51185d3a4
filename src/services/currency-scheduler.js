'use strict';

const cron = require('node-cron');

class CurrencyScheduler {
  constructor() {
    this.isRunning = false;
    this.lastUpdate = null;
    this.updateInterval = 5; // minutes
    this.exchangeRateApiKey = '0c5c6bd5a7c35064a089762e';
    this.exchangeRateBaseUrl = 'https://v6.exchangerate-api.com/v6';
  }

  async initialize() {
    if (this.isRunning) {
      console.log('Currency Scheduler already running');
      return;
    }

    console.log('🔄 Initializing Currency Scheduler...');
    
    // Run initial update
    await this.updateCurrencyData();
    
    // Schedule periodic updates every 5 minutes
    this.schedule = cron.schedule(`*/${this.updateInterval} * * * *`, async () => {
      console.log('⏰ Running scheduled currency data update...');
      await this.updateCurrencyData();
    }, {
      scheduled: false
    });

    this.schedule.start();
    this.isRunning = true;
    
    console.log(`✅ Currency Scheduler initialized - Updates every ${this.updateInterval} minutes`);
  }

  async updateCurrencyData() {
    try {
      console.log('📊 Fetching latest currency data...');
      
      // Fetch current rates from ExchangeRate-API
      const response = await fetch(`${this.exchangeRateBaseUrl}/${this.exchangeRateApiKey}/latest/THB`);
      
      if (!response.ok) {
        throw new Error(`ExchangeRate-API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result !== 'success') {
        throw new Error(data['error-type'] || 'API returned error');
      }

      // Get existing currency data for comparison
      const existingCurrencies = await strapi.entityService.findMany('api::currency-trending.currency-trending', {
        filters: { isActive: true },
        populate: []
      });

      const existingRates = {};
      existingCurrencies.forEach(currency => {
        existingRates[currency.currencyCode] = currency.rateToTHB;
      });

      // Currency metadata with flags and symbols
      const currencyMetadata = {
        'THB': { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
        'USD': { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
        'EUR': { name: 'Euro', symbol: '€', flag: '🇪🇺' },
        'GBP': { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
        'JPY': { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
        'KRW': { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
        'SGD': { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
        'MYR': { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
        'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
        'PHP': { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
        'VND': { name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
        'CNY': { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
        'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
        'TWD': { name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
        'AUD': { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
        'CAD': { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
        'CHF': { name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
        'NZD': { name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
        'INR': { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
        'RUB': { name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
        'BRL': { name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
        'MXN': { name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
        'ZAR': { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
        'TRY': { name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
        'PLN': { name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
        'CZK': { name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
        'HUF': { name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
        'SEK': { name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
        'NOK': { name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
        'DKK': { name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
        'ILS': { name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
        'AED': { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
        'SAR': { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
        'QAR': { name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦' },
        'KWD': { name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
        'BHD': { name: 'Bahraini Dinar', symbol: 'د.ب', flag: '🇧🇭' },
        'OMR': { name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲' },
        'JOD': { name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴' },
        'LBP': { name: 'Lebanese Pound', symbol: 'ل.ل', flag: '🇱🇧' },
        'EGP': { name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬' },
        'MAD': { name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦' },
        'TND': { name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳' },
        'DZD': { name: 'Algerian Dinar', symbol: 'د.ج', flag: '🇩🇿' },
        'LYD': { name: 'Libyan Dinar', symbol: 'ل.د', flag: '🇱🇾' },
        'ETB': { name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
        'KES': { name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
        'UGX': { name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
        'TZS': { name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
        'RWF': { name: 'Rwandan Franc', symbol: 'RF', flag: '🇷🇼' },
        'GHS': { name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
        'NGN': { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
        'XOF': { name: 'West African CFA Franc', symbol: 'CFA', flag: '🇸🇳' },
        'XAF': { name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇲' },
        'MUR': { name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺' },
        'SCR': { name: 'Seychellois Rupee', symbol: '₨', flag: '🇸🇨' },
        'MVR': { name: 'Maldivian Rufiyaa', symbol: 'Rf', flag: '🇲🇻' },
        'LKR': { name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰' },
        'NPR': { name: 'Nepalese Rupee', symbol: '₨', flag: '🇳🇵' },
        'BDT': { name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
        'PKR': { name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
        'AFN': { name: 'Afghan Afghani', symbol: '؋', flag: '🇦🇫' },
        'IRR': { name: 'Iranian Rial', symbol: '﷼', flag: '🇮🇷' },
        'IQD': { name: 'Iraqi Dinar', symbol: 'د.ع', flag: '🇮🇶' },
        'SYP': { name: 'Syrian Pound', symbol: '£', flag: '🇸🇾' },
        'YER': { name: 'Yemeni Rial', symbol: '﷼', flag: '🇾🇪' },
        'KZT': { name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿' },
        'UZS': { name: 'Uzbekistani Som', symbol: 'лв', flag: '🇺🇿' },
        'KGS': { name: 'Kyrgyzstani Som', symbol: 'лв', flag: '🇰🇬' },
        'TJS': { name: 'Tajikistani Somoni', symbol: 'SM', flag: '🇹🇯' },
        'TMT': { name: 'Turkmenistani Manat', symbol: 'T', flag: '🇹🇲' },
        'AZN': { name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿' },
        'AMD': { name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲' },
        'GEL': { name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪' },
        'MDL': { name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩' },
        'UAH': { name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
        'BYN': { name: 'Belarusian Ruble', symbol: 'Br', flag: '🇧🇾' },
        'RSD': { name: 'Serbian Dinar', symbol: 'дин', flag: '🇷🇸' },
        'BAM': { name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'КМ', flag: '🇧🇦' },
        'MKD': { name: 'Macedonian Denar', symbol: 'ден', flag: '🇲🇰' },
        'ALL': { name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱' },
        'BGN': { name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
        'RON': { name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
        'HRK': { name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
        'ISK': { name: 'Icelandic Krona', symbol: 'kr', flag: '🇮🇸' },
        'LTL': { name: 'Lithuanian Litas', symbol: 'Lt', flag: '🇱🇹' },
        'LVL': { name: 'Latvian Lats', symbol: 'Ls', flag: '🇱🇻' },
        'EEK': { name: 'Estonian Kroon', symbol: 'kr', flag: '🇪🇪' },
        'MTL': { name: 'Maltese Lira', symbol: '₤', flag: '🇲🇹' },
        'CYP': { name: 'Cypriot Pound', symbol: '£', flag: '🇨🇾' },
        'SIT': { name: 'Slovenian Tolar', symbol: 'SIT', flag: '🇸🇮' },
        'SKK': { name: 'Slovak Koruna', symbol: 'Sk', flag: '🇸🇰' },
        'BWP': { name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼' },
        'ZMW': { name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
        'ZWL': { name: 'Zimbabwean Dollar', symbol: '$', flag: '🇿🇼' },
        'NAD': { name: 'Namibian Dollar', symbol: '$', flag: '🇳🇦' },
        'SZL': { name: 'Swazi Lilangeni', symbol: 'L', flag: '🇸🇿' },
        'LSL': { name: 'Lesotho Loti', symbol: 'L', flag: '🇱🇸' },
        'AOA': { name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴' },
        'MZN': { name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿' },
        'MWK': { name: 'Malawian Kwacha', symbol: 'MK', flag: '🇲🇼' },
        'BIF': { name: 'Burundian Franc', symbol: 'FBu', flag: '🇧🇮' },
        'DJF': { name: 'Djiboutian Franc', symbol: 'Fdj', flag: '🇩🇯' },
        'ERN': { name: 'Eritrean Nakfa', symbol: 'Nfk', flag: '🇪🇷' },
        'SOS': { name: 'Somali Shilling', symbol: 'S', flag: '🇸🇴' },
        'SSP': { name: 'South Sudanese Pound', symbol: '£', flag: '🇸🇸' },
        'SDG': { name: 'Sudanese Pound', symbol: 'ج.س.', flag: '🇸🇩' },
        'CDF': { name: 'Congolese Franc', symbol: 'FC', flag: '🇨🇩' },
        'CVE': { name: 'Cape Verdean Escudo', symbol: '$', flag: '🇨🇻' },
        'STN': { name: 'São Tomé and Príncipe Dobra', symbol: 'Db', flag: '🇸🇹' },
        'GMD': { name: 'Gambian Dalasi', symbol: 'D', flag: '🇬🇲' },
        'GNF': { name: 'Guinean Franc', symbol: 'FG', flag: '🇬🇳' },
        'LRD': { name: 'Liberian Dollar', symbol: '$', flag: '🇱🇷' },
        'SLL': { name: 'Sierra Leonean Leone', symbol: 'Le', flag: '🇸🇱' }
      };

      // Process currency data
      const currencyData = [];
      let rank = 1;

      // Sort currencies by rate (highest to lowest for ranking)
      const sortedRates = Object.entries(data.conversion_rates)
        .filter(([code]) => code !== 'THB') // Exclude THB as it's the base
        .sort(([, a], [, b]) => b - a);

      for (const [currencyCode, rate] of sortedRates) {
        const metadata = currencyMetadata[currencyCode];
        if (!metadata) continue;

        const previousRate = existingRates[currencyCode];
        const change24h = previousRate ? rate - previousRate : 0;
        const changePercent24h = previousRate ? ((change24h / previousRate) * 100) : 0;
        const trend = changePercent24h > 0.5 ? 'up' : changePercent24h < -0.5 ? 'down' : 'stable';

        currencyData.push({
          currencyCode,
          currencyName: metadata.name,
          currencySymbol: metadata.symbol,
          currencyFlag: metadata.flag,
          rateToTHB: rate,
          previousRateToTHB: previousRate,
          change24h: parseFloat(change24h.toFixed(6)),
          changePercent24h: parseFloat(changePercent24h.toFixed(4)),
          trend,
          rank: rank++,
          volume24h: null, // Not available from this API
          marketCap: null, // Not available from this API
          dataSource: 'exchangerate-api'
        });
      }

      // Update database
      const updatePromises = currencyData.map(async (data) => {
        const existing = await strapi.entityService.findMany('api::currency-trending.currency-trending', {
          filters: { currencyCode: data.currencyCode }
        });

        const currencyDataToSave = {
          ...data,
          lastUpdated: new Date().toISOString(),
          isActive: true
        };

        if (existing.length > 0) {
          return strapi.entityService.update('api::currency-trending.currency-trending', existing[0].id, {
            data: currencyDataToSave
          });
        } else {
          return strapi.entityService.create('api::currency-trending.currency-trending', {
            data: currencyDataToSave
          });
        }
      });

      await Promise.all(updatePromises);

      this.lastUpdate = new Date();
      console.log(`✅ Currency data updated successfully - ${currencyData.length} currencies processed`);
      
    } catch (error) {
      console.error('❌ Failed to update currency data:', error.message);
    }
  }

  async stop() {
    if (this.schedule) {
      this.schedule.stop();
      this.schedule = null;
    }
    this.isRunning = false;
    console.log('🛑 Currency Scheduler stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.lastUpdate,
      updateInterval: this.updateInterval
    };
  }
}

module.exports = CurrencyScheduler;

