# Widget Selection Guide for Global Sponsorship

## How to Select Multiple Widgets

The `sponsoredWidgets` field is now a JSON field that accepts an array of widget types. Here's how to use it:

### Available Widget Types:
- `radio` - Radio widget
- `weather` - Weather widget  
- `news` - News hero widget
- `events` - Events calendar widget
- `deals` - Deals widget
- `business` - Business widget
- `social` - Social feed widget
- `traffic` - Traffic widget
- `youtube` - YouTube widget
- `photos` - Photo gallery widget
- `quick-links` - Quick links widget
- `trending` - Trending widget
- `breaking-news` - Breaking news widget
- `live-events` - Live events widget
- `business-spotlight` - Business spotlight widget
- `hot-deals` - Hot deals widget

### How to Enter Widget Selection:

In the Strapi admin panel, in the `sponsoredWidgets` field, enter a JSON array like this:

#### Select All Widgets:
```json
["radio", "weather", "news", "events", "deals", "business", "social", "traffic", "youtube", "photos", "quick-links", "trending", "breaking-news", "live-events", "business-spotlight", "hot-deals"]
```

#### Select Specific Widgets:
```json
["radio", "news", "events", "social"]
```

#### Select Just One Widget:
```json
["radio"]
```

#### Select No Widgets (empty array):
```json
[]
```

### Examples:

1. **Show sponsorship on all widgets:**
   ```json
   ["radio", "weather", "news", "events", "deals", "business", "social", "traffic", "youtube", "photos", "quick-links", "trending", "breaking-news", "live-events", "business-spotlight", "hot-deals"]
   ```

2. **Show sponsorship only on news and events:**
   ```json
   ["news", "events"]
   ```

3. **Show sponsorship on radio and social widgets:**
   ```json
   ["radio", "social"]
   ```

### Important Notes:

- Make sure to use double quotes around each widget type
- Separate multiple widgets with commas
- The array must be valid JSON format
- Widget types are case-sensitive
- If you make a typo in a widget name, that widget won't show the sponsorship

### Testing:

After saving your sponsorship entry:
1. Go to http://localhost:3000/test-all-widgets
2. Check which widgets show the sponsorship banner
3. Verify the marquee animation works for multiple titles
4. Verify static text shows for single titles

### Troubleshooting:

- If no widgets show sponsorship: Check that `isActive` is set to `true`
- If some widgets don't show: Check the widget names in the JSON array
- If JSON is invalid: Strapi will show an error - fix the syntax
- If sponsorship doesn't appear: Check the date range (start/end dates)
