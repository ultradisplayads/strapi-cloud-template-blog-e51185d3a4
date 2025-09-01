# Radio Station Display Order

## Overview
The radio station content type now includes a `DisplayOrder` field that controls the priority and display order of stations in the frontend.

## Field Details
- **Field Name**: `DisplayOrder`
- **Type**: Integer
- **Default Value**: 999
- **Range**: 1 - 999
- **Description**: Priority order for display (1 = highest priority, 999 = lowest priority)

## How It Works
1. **Lower numbers = Higher priority**: Stations with DisplayOrder = 1 will appear first
2. **Higher numbers = Lower priority**: Stations with DisplayOrder = 999 will appear last
3. **Default sorting**: Stations are automatically sorted by DisplayOrder in ascending order
4. **Fallback value**: If no DisplayOrder is set, it defaults to 999

## Usage Examples

### Setting Priority Levels
```
DisplayOrder: 1    → "Fabulas 103 FM" (Highest priority - appears first)
DisplayOrder: 2    → "Beach Radio" (Second priority)
DisplayOrder: 3    → "Thai Hits" (Third priority)
DisplayOrder: 999  → "Country Roads" (Lowest priority - appears last)
```

### Frontend Behavior
- Stations are automatically sorted by DisplayOrder when fetched from Strapi
- The frontend displays stations in the order specified by DisplayOrder
- Featured stations still take priority for default selection
- Fallback stations maintain their predefined order

## Updating Existing Stations

### Option 1: Manual Update via Strapi Admin
1. Go to Content Manager → Radio Station
2. Edit each station and set the DisplayOrder field
3. Save and publish

### Option 2: Use the Update Script
1. Run the provided script: `node scripts/update-radio-station-display-order.js`
2. This will automatically assign DisplayOrder values (1, 2, 3, etc.) to existing stations

### Option 3: API Update
```bash
curl -X PUT http://localhost:1337/api/radio-stations/1 \
  -H "Content-Type: application/json" \
  -d '{"data": {"DisplayOrder": 1}}'
```

## Best Practices
1. **Use sequential numbers**: 1, 2, 3, 4... for easy management
2. **Leave gaps**: Use 10, 20, 30... if you want to insert stations between existing ones later
3. **Featured stations**: Consider giving featured stations lower DisplayOrder numbers (1-5)
4. **Popular stations**: Give popular stations lower numbers for better visibility
5. **New stations**: Add new stations with appropriate DisplayOrder values

## Frontend Integration
The frontend automatically:
- Fetches stations sorted by DisplayOrder
- Displays stations in priority order
- Maintains fallback functionality for offline mode
- Shows stations in the correct order in all UI components

## Troubleshooting
- **Stations not in order**: Check that DisplayOrder values are set correctly
- **Default value issues**: Ensure DisplayOrder is not null or undefined
- **Sorting problems**: Verify the API call includes `sort=DisplayOrder:asc`
- **Fallback mode**: Offline mode uses predefined fallback stations with DisplayOrder

## Migration Notes
- Existing stations without DisplayOrder will default to 999
- The frontend will work with or without DisplayOrder values
- Fallback stations maintain their predefined order for offline functionality
