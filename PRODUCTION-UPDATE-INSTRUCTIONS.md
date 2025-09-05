# Production Image Support Update Instructions

## File 1: Schema Update
**Path:** `/src/api/breaking-news/content-types/breaking-news/schema.json`

**Find line 99-101:**
```json
    "SponsoredPost": {
      "type": "boolean",
      "default": false
    }
  }
}
```

**Replace with:**
```json
    "SponsoredPost": {
      "type": "boolean",
      "default": false
    },
    "FeaturedImage": {
      "type": "string"
    },
    "ImageAlt": {
      "type": "string"
    },
    "ImageCaption": {
      "type": "text"
    }
  }
}
```

## File 2: Controller Update
**Path:** `/src/api/breaking-news/controllers/breaking-news.js`

### Change 1 (Line ~210 - Sponsored Posts):
**Find:**
```javascript
            image: null,
```

**Replace with:**
```javascript
            image: entry.FeaturedImage,
            imageAlt: entry.ImageAlt,
            imageCaption: entry.ImageCaption,
```

### Change 2 (Line ~233 - Regular News):
**Find:**
```javascript
            image: null,
```

**Replace with:**
```javascript
            image: entry.FeaturedImage,
            imageAlt: entry.ImageAlt,
            imageCaption: entry.ImageCaption,
```

## Restart Production
```bash
pm2 restart strapi
# or
npm run start
```

## Verify Changes
```bash
curl -s "https://api.pattaya1.com/api/breaking-news/live" | jq '.data[0] | has("imageAlt")'
```
Should return `true` when working.

## Test Image Data
```bash
curl -s "https://api.pattaya1.com/api/breaking-news/live" | jq '.data | map(select(.image != null)) | length'
```
Should show count of articles with images after scheduler runs.
