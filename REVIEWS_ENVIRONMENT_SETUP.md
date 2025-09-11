# Reviews System Environment Configuration

## Required Environment Variables

Add the following environment variables to your `.env` file in the `strapi_backend` directory:

### Google Places API
```env
# Google Places API Key (Required for Google reviews)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Optional: Google Maps API restrictions
GOOGLE_MAPS_API_RESTRICTIONS=your_restrictions_here
```

### Yelp Fusion API
```env
# Yelp Fusion API Key (Required for Yelp reviews)
YELP_API_KEY=your_yelp_api_key_here
```

### Foursquare Places API
```env
# Foursquare API Credentials (Required for Foursquare reviews)
FOURSQUARE_CLIENT_ID=your_foursquare_client_id_here
FOURSQUARE_CLIENT_SECRET=your_foursquare_client_secret_here
```

### Facebook Graph API (Optional - for future Facebook reviews)
```env
# Facebook Graph API (Optional)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
```

## API Setup Instructions

### 1. Google Places API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Places API" and "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Copy the API key to `GOOGLE_PLACES_API_KEY`

**Rate Limits:**
- Free tier: $200/month credit
- Places API: $17 per 1000 requests
- Recommended: Limit to 20 businesses per day to stay within free tier

### 2. Yelp Fusion API Setup
1. Go to [Yelp for Developers](https://www.yelp.com/developers)
2. Create a new app
3. Get your API key from the app dashboard
4. Copy the API key to `YELP_API_KEY`

**Rate Limits:**
- Free tier: 500 requests per day
- Business search: 1 request per business
- Business details: 1 request per business

### 3. Foursquare Places API Setup
1. Go to [Foursquare for Developers](https://developer.foursquare.com/)
2. Create a new app
3. Get your Client ID and Client Secret
4. Copy credentials to `FOURSQUARE_CLIENT_ID` and `FOURSQUARE_CLIENT_SECRET`

**Rate Limits:**
- Free tier: 1000 requests per day
- Places search: 1 request per search
- Place details: 1 request per place

## Environment File Example

Create a `.env` file in your `strapi_backend` directory:

```env
# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Server
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified

# Reviews System API Keys
GOOGLE_PLACES_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YELP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FOURSQUARE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FOURSQUARE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Facebook API (for future use)
FACEBOOK_APP_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Restrict API keys to specific domains/IPs when possible**
4. **Monitor API usage regularly**
5. **Set up billing alerts for paid APIs**

## Testing API Keys

After setting up your environment variables, you can test the API connections:

```bash
# Test Google Places API
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Pattaya&key=${GOOGLE_PLACES_API_KEY}"

# Test Yelp API
curl -H "Authorization: Bearer ${YELP_API_KEY}" "https://api.yelp.com/v3/businesses/search?location=Pattaya&term=restaurants"

# Test Foursquare API
curl -H "Authorization: ${FOURSQUARE_CLIENT_ID}" "https://places-api.foursquare.com/places/search?query=restaurants&near=Pattaya"
```

## Troubleshooting

### Common Issues:

1. **API Key Invalid**: Check if the key is correctly copied and has no extra spaces
2. **Rate Limit Exceeded**: Wait for the rate limit to reset or upgrade your API plan
3. **CORS Issues**: Ensure your API keys allow requests from your domain
4. **Quota Exceeded**: Check your API usage in the respective developer consoles

### Logs to Check:

- Strapi logs: `strapi_backend/logs/`
- Review fetch logs: Look for "🔄 Running daily review fetch..." messages
- API error logs: Look for "❌ Error fetching" messages

## Support

For API-specific issues:
- Google Places API: [Google Cloud Support](https://cloud.google.com/support)
- Yelp Fusion API: [Yelp Developer Support](https://www.yelp.com/developers/documentation)
- Foursquare API: [Foursquare Developer Support](https://developer.foursquare.com/docs)
