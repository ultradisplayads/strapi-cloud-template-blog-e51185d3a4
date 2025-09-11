# Widget Management System Guide

## Overview

The Widget Management System provides comprehensive control over all widgets in the Pattaya application. It allows administrators to configure widget permissions, positioning, and behavior through a centralized Strapi content type.

## Features

### Admin Controls
Each widget has the following admin control options:

- **Allow User Resizing & Moving**: Controls whether users can resize and move the widget
- **Is Mandatory (Cannot be Deleted)**: Prevents users from hiding/deleting the widget
- **Can Be Deleted**: Allows users to remove the widget from their dashboard
- **Is Locked**: Completely locks the widget (no resizing, moving, or deleting)
- **Requires Admin Approval**: Widget changes require admin approval
- **Max Instances**: Maximum number of instances allowed per user
- **Restricted To Roles**: Limit widget access to specific user roles

### Widget Categories
- **Core**: Essential widgets (Breaking News, Hot Deals)
- **Content**: Information widgets (Events, News)
- **Social**: Social media and community widgets
- **Utility**: Tools and utilities (Weather, Currency Converter)
- **Advertising**: Sponsored content and ads
- **Entertainment**: Entertainment widgets (Radio, YouTube)
- **Business**: Business-related widgets

## Default Widgets

### Core Widgets (Mandatory)
1. **Breaking News** - Latest news and updates
   - Mandatory: ✅
   - Deletable: ❌
   - Resizable: ✅
   - Movable: ✅

2. **Hot Deals** - Featured deals and promotions
   - Mandatory: ✅
   - Deletable: ❌
   - Resizable: ✅
   - Movable: ✅

### Utility Widgets (Optional)
3. **Weather Widget** - Current weather conditions
   - Mandatory: ❌
   - Deletable: ✅
   - Resizable: ✅
   - Movable: ✅

4. **Currency Converter** - Real-time currency conversion
   - Mandatory: ❌
   - Deletable: ✅
   - Resizable: ✅
   - Movable: ✅

### Content Widgets (Optional)
5. **Events Calendar** - Upcoming events
   - Mandatory: ❌
   - Deletable: ✅
   - Resizable: ✅
   - Movable: ✅

6. **Business Spotlight** - Featured businesses
   - Mandatory: ❌
   - Deletable: ✅
   - Resizable: ✅
   - Movable: ✅

### Social Widgets (Optional)
7. **Social Feed** - Social media aggregation
   - Mandatory: ❌
   - Deletable: ✅
   - Resizable: ✅
   - Movable: ✅

### Entertainment Widgets (Optional)
8. **Radio Widget** - Live radio streaming
   - Mandatory: ❌
   - Deletable: ✅
   - Resizable: ✅
   - Movable: ✅

### Advertising Widgets (Locked)
9. **Ad Banner** - Sponsored content
   - Mandatory: ✅
   - Deletable: ❌
   - Resizable: ❌
   - Movable: ❌
   - Locked: 🔒

## API Endpoints

### Get All Widgets
```http
GET /api/widget-managements
```

### Get Widget by Type
```http
GET /api/widget-management/type/{widgetType}
```

### Get Widgets by Category
```http
GET /api/widget-management/category/{category}
```

### Get Mandatory Widgets
```http
GET /api/widget-management/mandatory
```

### Get Deletable Widgets
```http
GET /api/widget-management/deletable
```

### Update Admin Controls
```http
PUT /api/widget-management/{id}/admin-controls
Content-Type: application/json

{
  "data": {
    "adminControls": {
      "allowUserResizing": true,
      "allowUserMoving": true,
      "isMandatory": false,
      "canBeDeleted": true,
      "isLocked": false
    }
  }
}
```

### Bulk Update Admin Controls
```http
PUT /api/widget-management/bulk-admin-controls
Content-Type: application/json

{
  "data": {
    "widgetUpdates": [
      {
        "id": 1,
        "adminControls": {
          "allowUserResizing": true,
          "allowUserMoving": true,
          "isMandatory": true,
          "canBeDeleted": false,
          "isLocked": false
        }
      }
    ]
  }
}
```

### Get Permissions Summary
```http
GET /api/widget-management/permissions-summary
```

## Use Cases

### Ad Banners (Locked and Mandatory)
```json
{
  "allowUserResizing": false,
  "allowUserMoving": false,
  "isMandatory": true,
  "canBeDeleted": false,
  "isLocked": true
}
```

### Core Content (Mandatory but Resizable)
```json
{
  "allowUserResizing": true,
  "allowUserMoving": true,
  "isMandatory": true,
  "canBeDeleted": false,
  "isLocked": false
}
```

### Niche Widgets (Optional)
```json
{
  "allowUserResizing": true,
  "allowUserMoving": true,
  "isMandatory": false,
  "canBeDeleted": true,
  "isLocked": false
}
```

## Frontend Integration

### Widget Wrapper Component
The `WidgetWrapper` component automatically respects the admin controls:

```tsx
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';

<WidgetWrapper widgetId="weather">
  <WeatherWidget />
</WidgetWrapper>
```

### Permission Checking
```tsx
import { useWidgetPermissions } from '@/hooks/use-widget-permissions';

const { canResize, canDrag, canDelete, isLocked } = useWidgetPermissions();

if (canResize('weather')) {
  // Show resize controls
}

if (canDelete('weather')) {
  // Show delete button
}
```

## Initialization

To initialize the widget management system:

```bash
cd strapi_backend
node scripts/initialize-widget-management.js
```

## Strapi Admin Panel

1. Navigate to **Content Manager** → **Widget Management**
2. View all widgets and their current settings
3. Edit individual widgets to modify admin controls
4. Use bulk operations for multiple widgets

## Migration from Existing System

The new system is backward compatible with the existing `admin-widget-configs`. The system will:

1. Initialize default widgets with current settings
2. Maintain existing API endpoints
3. Provide enhanced functionality through new endpoints

## Best Practices

1. **Mandatory Widgets**: Only mark essential widgets as mandatory
2. **Ad Banners**: Always lock ad banners to prevent user interference
3. **Core Content**: Make core content mandatory but allow customization
4. **Niche Widgets**: Allow full user control for optional widgets
5. **Testing**: Test widget permissions in different user roles
6. **Documentation**: Document any custom widget configurations

## Troubleshooting

### Widget Not Showing
- Check if widget is marked as `isActive: true`
- Verify user has appropriate role permissions
- Check widget category and priority settings

### Permission Issues
- Verify admin controls are properly configured
- Check user role restrictions
- Ensure widget is not locked

### API Errors
- Verify authentication for admin endpoints
- Check request payload format
- Ensure widget ID exists

## Support

For issues or questions about the Widget Management System:
1. Check the API documentation
2. Review widget configurations in Strapi admin
3. Test with different user roles
4. Check server logs for detailed error messages
