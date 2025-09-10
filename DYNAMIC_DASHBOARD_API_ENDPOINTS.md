# Dynamic Dashboard API Endpoints

This document describes the new API endpoints created for the dynamic dashboard functionality.

## Overview

The dynamic dashboard system allows users to customize their widget layouts and admins to control widget permissions. The system consists of two main API modules:

1. **User Layout API** - For saving/loading user's custom widget layouts
2. **Admin Widget Configs API** - For admin control over widget permissions

## API Endpoints

### User Layout API

#### GET `/api/users/me/layout`
Retrieves the current user's saved widget layout.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "layout": [
    {
      "i": "weather",
      "x": 0,
      "y": 0,
      "w": 3,
      "h": 4
    },
    {
      "i": "breaking-news",
      "x": 3,
      "y": 0,
      "w": 6,
      "h": 3
    }
  ]
}
```

#### POST `/api/users/me/layout`
Saves the current user's widget layout.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "layout": [
    {
      "i": "weather",
      "x": 0,
      "y": 0,
      "w": 3,
      "h": 4
    },
    {
      "i": "breaking-news",
      "x": 3,
      "y": 0,
      "w": 6,
      "h": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "123",
    "layout": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Layout saved successfully"
}
```

#### DELETE `/api/users/me/layout`
Deletes the current user's saved layout.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "message": "Layout deleted successfully"
}
```

### Admin Widget Configs API

#### GET `/api/admin/widget-configs`
Retrieves all widget configurations for admin control.

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "weather": {
    "allowResize": true,
    "allowDrag": true,
    "allowDelete": false,
    "isLocked": false
  },
  "breaking-news": {
    "allowResize": true,
    "allowDrag": true,
    "allowDelete": false,
    "isLocked": false
  },
  "traffic": {
    "allowResize": false,
    "allowDrag": false,
    "allowDelete": false,
    "isLocked": true
  }
}
```

#### PUT `/api/admin/widget-configs`
Updates all widget configurations.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "widgetConfigs": {
    "weather": {
      "allowResize": true,
      "allowDrag": true,
      "allowDelete": false,
      "isLocked": false
    },
    "traffic": {
      "allowResize": false,
      "allowDrag": false,
      "allowDelete": false,
      "isLocked": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "widgetConfigs": {...},
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "message": "Admin widget configurations updated successfully"
}
```

#### GET `/api/admin/widget-configs/:widgetId`
Retrieves configuration for a specific widget.

**Authentication:** Not required (public endpoint)

**Response:**
```json
{
  "weather": {
    "allowResize": true,
    "allowDrag": true,
    "allowDelete": false,
    "isLocked": false
  }
}
```

#### PUT `/api/admin/widget-configs/:widgetId`
Updates configuration for a specific widget.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "allowResize": true,
  "allowDrag": true,
  "allowDelete": false,
  "isLocked": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Widget configuration for weather updated successfully"
}
```

## Widget Configuration Properties

Each widget configuration includes the following properties:

- **allowResize** (boolean): Whether users can resize this widget
- **allowDrag** (boolean): Whether users can drag this widget
- **allowDelete** (boolean): Whether users can delete this widget
- **isLocked** (boolean): Whether the widget is completely locked (overrides other settings)

## Default Widget Configurations

The system includes default configurations for all widgets:

```json
{
  "weather": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
  "breaking-news": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
  "radio": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "hot-deals": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
  "news-hero": { "allowResize": true, "allowDrag": true, "allowDelete": false, "isLocked": false },
  "business-spotlight": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "social-feed": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "trending": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "youtube": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "events-calendar": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "quick-links": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "photo-gallery": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "forum-activity": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "google-reviews": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "curator-social": { "allowResize": true, "allowDrag": true, "allowDelete": true, "isLocked": false },
  "traffic": { "allowResize": false, "allowDrag": false, "allowDelete": false, "isLocked": true }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Admin access required
- **400 Bad Request**: Invalid request data
- **500 Internal Server Error**: Server error

Example error response:
```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "Authentication required"
  }
}
```

## Frontend Integration

The frontend should:

1. Store authentication tokens in localStorage as `authToken`
2. Include the token in the `Authorization` header: `Bearer ${token}`
3. Handle authentication errors gracefully
4. Fall back to localStorage for layout persistence if API fails

## Database Schema

### User Layouts Table
- `id` (Primary Key)
- `userId` (String, Unique)
- `layout` (JSON)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Admin Widget Configs Table
- `id` (Primary Key)
- `widgetConfigs` (JSON)
- `lastUpdated` (DateTime)

## Setup Instructions

1. Restart Strapi backend to load new content types
2. Set up proper permissions in Strapi admin panel
3. Configure authentication middleware
4. Test endpoints with frontend integration

## Security Considerations

- All user layout endpoints require authentication
- Admin endpoints require administrator role
- Widget config endpoints (GET) are public for frontend access
- Proper input validation on all endpoints
- Rate limiting should be implemented for production use
