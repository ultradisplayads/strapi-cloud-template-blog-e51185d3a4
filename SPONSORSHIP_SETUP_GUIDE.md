# Global Sponsorship System Setup Guide

## Overview
The global sponsorship system allows you to display sponsorship text across multiple widgets on the homepage. It supports both single static titles and multiple titles with marquee animation.

## Features
- ✅ Multiple sponsorship titles with individual colors
- ✅ Widget selection (choose which widgets show sponsorship)
- ✅ Select All functionality for quick setup
- ✅ Marquee animation for multiple titles
- ✅ Date range support (start/end dates)
- ✅ Animation speed control (slow/normal/fast)
- ✅ Individual title activation/deactivation

## Setup Instructions

### 1. Set Up Permissions
1. Go to https://api.pattaya1.com/admin
2. Navigate to **Settings** → **Users & Permissions Plugin** → **Roles**
3. Click on **Public** role
4. Under **Global Sponsorship**, check the **find** permission
5. Click **Save**

### 2. Create Global Sponsorship
1. Go to **Content Manager** → **Global Sponsorship**
2. Click **Create new entry**
3. Fill in the following fields:
   - **Sponsorship Titles**: Add one or more titles
     - Title Text: e.g., "Sponsored by Singha Beer"
     - Color: Choose a color for each title
     - Is Active: Toggle to enable/disable individual titles
     - Display Order: Set the order (1, 2, 3, etc.)
   - **Is Active**: Toggle to enable the entire sponsorship
   - **Sponsored Widgets**: Select which widgets should show the sponsorship
     - Available widgets: radio, weather, news, events, deals, business, social, traffic, youtube, photos, quick-links, trending, breaking-news, live-events, business-spotlight, hot-deals
   - **Default Color**: Fallback color for titles without specific colors
   - **Animation Speed**: Choose slow, normal, or fast for marquee animation
   - **Sponsor Website**: Optional website URL
   - **Sponsor Logo**: Optional logo image
   - **Sponsor Start Date**: Optional start date
   - **Sponsor End Date**: Optional end date
4. Click **Save**

### 3. Test the System
1. Go to the homepage (http://localhost:3000)
2. Check the widgets you selected for sponsorship
3. You should see the sponsorship banner at the top of each widget

## How It Works

### Single Title
- If you add only one active title, it displays as static text
- Uses the title's specific color or the default color

### Multiple Titles
- If you add multiple active titles, they display in a marquee animation
- Each title can have its own color
- Animation speed is controlled by the global setting
- Titles are displayed in the order specified by Display Order

### Widget Integration
- Each widget that supports sponsorship includes the `<SponsorshipBanner widgetType="widget-name" />` component
- The component automatically fetches and displays active sponsorships for that widget type
- Only shows if the widget is selected in the sponsorship settings

## Available Widgets
- **radio**: Radio streaming widget
- **weather**: Weather information widget
- **news**: News updates widget
- **events**: Events listing widget
- **deals**: Hot deals widget
- **business**: Business directory widget
- **social**: Social media feeds widget
- **traffic**: Traffic updates widget
- **youtube**: YouTube videos widget
- **photos**: Photo gallery widget
- **quick-links**: Quick navigation links widget
- **trending**: Trending topics widget
- **breaking-news**: Breaking news alerts widget
- **live-events**: Live event streaming widget
- **business-spotlight**: Featured businesses widget
- **hot-deals**: Enhanced hot deals widget

## Admin Interface
- Access the admin interface at: http://localhost:3000/admin/global-sponsorship
- Features:
  - Add/remove sponsorship titles
  - Individual title color customization
  - Widget selection with Select All option
  - Animation speed control
  - Date range management
  - Real-time preview of selected widgets

## Troubleshooting

### Sponsorship Not Showing
1. Check if the sponsorship is marked as "Is Active"
2. Verify the widget is selected in "Sponsored Widgets"
3. Ensure at least one title is active and has text
4. Check if the current date is within the start/end date range

### API Errors
1. Make sure Strapi is running on https://api.pattaya1.com
2. Verify permissions are set for the Public role
3. Check the browser console for any JavaScript errors

### Animation Issues
1. Ensure you have multiple active titles for marquee animation
2. Check the animation speed setting
3. Verify the CSS animation is loaded (check globals.css)

## Example Configuration

### Single Sponsor
```
Title 1: "Sponsored by Singha Beer" (Color: #FF6B35)
Widgets: radio, weather, news
Animation Speed: normal
```

### Multiple Sponsors
```
Title 1: "Sponsored by Singha Beer" (Color: #FF6B35, Order: 1)
Title 2: "Powered by Coca-Cola" (Color: #FF0000, Order: 2)
Title 3: "Brought to you by Toyota" (Color: #000000, Order: 3)
Widgets: All widgets (Select All)
Animation Speed: slow
```

This will create a marquee animation cycling through all three sponsors across all widgets.
