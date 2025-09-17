# Strapi 5 Cron Jobs Configuration

This document describes the comprehensive cron job setup for the Strapi breaking news and video fetching system using Strapi 5's built-in cron functionality.

## Overview

The system has been migrated from alternative schedulers to use Strapi 5's native cron jobs with the recommended object format. All cron jobs are configured in `config/cron-tasks.js` and automatically start with Strapi.

## Configuration Files

### Server Configuration (`config/server.js`)
```javascript
const cronTasks = require('./cron-tasks');

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  cron: {
    enabled: true,
    tasks: cronTasks,
  },
});
```

### Cron Tasks Configuration (`config/cron-tasks.js`)
All cron jobs use the **object format** (recommended by Strapi 5) with proper timezone configuration.

## Configured Cron Jobs

### 1. News System Jobs

#### News Fetching
- **Job Name**: `newsFetching`
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Function**: Fetches breaking news from News API
- **Service**: `api::breaking-news.breaking-news.fetchAndProcessNews()`

#### News Cleanup
- **Job Name**: `newsCleanup`
- **Schedule**: Every 15 minutes (`*/15 * * * *`)
- **Function**: Dynamic cleanup based on admin settings
- **Service**: Uses cleanup controller with admin-configured frequency

#### Rejected Articles Cleanup
- **Job Name**: `rejectedArticlesCleanup`
- **Schedule**: Daily at 2 AM (`0 2 * * *`)
- **Function**: Removes rejected articles older than 7 days

### 2. Video System Jobs

#### Daytime Video Fetch
- **Job Name**: `videoDaytimeFetch`
- **Schedule**: Every 30 minutes, 6 AM - 11 PM (`*/30 6-23 * * *`)
- **Function**: Regular video fetching during active hours
- **Service**: `VideoScheduler.performVideoFetching()`

#### Nighttime Video Fetch
- **Job Name**: `videoNighttimeFetch`
- **Schedule**: Every 2 hours, midnight - 5 AM (`0 */2 0-5 * * *`)
- **Function**: Reduced frequency video fetching during off-hours
- **Service**: `VideoScheduler.performVideoFetching()`

#### Trending Video Check
- **Job Name**: `videoTrendingCheck`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Function**: Checks for active trending tags and performs high-frequency fetch
- **Service**: `VideoScheduler.checkActiveTrendingTags()` + `performTrendingFetch()`

#### Video Cleanup
- **Job Name**: `videoCleanup`
- **Schedule**: Daily at 2 AM (`0 2 * * *`)
- **Function**: Cleans up old videos and maintains database
- **Service**: `VideoScheduler.performVideoCleanup()`

#### Video Stats Update
- **Job Name**: `videoStatsUpdate`
- **Schedule**: Every 6 hours (`0 */6 * * *`)
- **Function**: Updates video statistics and analytics
- **Service**: `VideoScheduler.performStatsUpdate()`

### 3. Review System Jobs

#### Reviews Fetching
- **Job Name**: `reviewsFetching`
- **Schedule**: Daily at 6 AM (`0 6 * * *`)
- **Function**: Fetches reviews from all platforms
- **Service**: `ReviewFetcherService.fetchAllReviews()`

#### Reviews Cleanup
- **Job Name**: `reviewsCleanup`
- **Schedule**: Daily at 3 AM (`0 3 * * *`)
- **Function**: Removes expired reviews for ToS compliance
- **Service**: `google-review.cleanupExpiredReviews()`

### 4. Additional System Jobs

#### Currency Update
- **Job Name**: `currencyUpdate`
- **Schedule**: Every 3 minutes (`*/3 * * * *`)
- **Function**: Updates currency exchange rates
- **Service**: `CurrencyScheduler.updateCurrencyData()`

#### Travel Times Summary
- **Job Name**: `travelTimesSummary`
- **Schedule**: Every 20 minutes (`*/20 * * * *`)
- **Function**: Updates traffic and travel time summaries
- **Service**: `traffic-summary.updateSummary()`

#### Static Map Refresh
- **Job Name**: `staticMapRefresh`
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Function**: Refreshes cached static traffic maps
- **Service**: `traffic-map.refreshStaticMap()`

## Key Features

### Timezone Configuration
- **All jobs use**: `Asia/Bangkok` timezone
- **Consistent scheduling** across all cron jobs
- **Local time awareness** for Thailand-based operations

### Object Format Benefits
- **Named jobs**: Easy to identify and manage
- **Removable**: Jobs can be dynamically removed with `strapi.cron.remove()`
- **Configurable**: Advanced options like start/end times, timezone support
- **Recommended**: Follows Strapi 5 best practices

### Error Handling
- **Comprehensive logging** for all cron job executions
- **Graceful error handling** with detailed error messages
- **Status indicators** (🔄 running, ✅ success, ❌ error)
- **Service isolation** - one job failure doesn't affect others

## Schedule Optimization

### Conflict Resolution
- **No overlapping schedules** for resource-intensive operations
- **Staggered execution** to prevent system overload
- **Priority-based scheduling** (news every 5min, videos every 10min for trending)

### Performance Considerations
- **Daytime vs Nighttime** scheduling for videos
- **Dynamic frequency** based on trending content
- **Cleanup operations** scheduled during low-traffic hours (2-3 AM)

## Monitoring and Logs

### Log Format
```
[timestamp] info: 🔄 Running [job description]...
[timestamp] info: ✅ [job description] completed
[timestamp] error: ❌ [job description] failed: [error message]
```

### Key Metrics to Monitor
- News fetch success rate and article count
- Video fetch performance and trending tag detection
- Cleanup operation effectiveness
- Service response times and error rates

## Migration from Alternative Schedulers

### What Changed
- **From**: Standalone `alternative-scheduler.js` and `alternative-video-scheduler.js`
- **To**: Integrated Strapi 5 cron jobs in `config/cron-tasks.js`
- **Benefits**: Native Strapi integration, better error handling, unified configuration

### Backward Compatibility
- **Alternative schedulers preserved** in `scripts/` directory for reference
- **Same service methods** used, only scheduling mechanism changed
- **Identical functionality** with improved reliability

## Testing and Verification

### Test Script
Run `node test-cron-configuration.js` to verify:
- ✅ Server running successfully
- ✅ Cron jobs configured with object format
- ✅ All schedules use proper timezone
- ✅ No conflicting cron schedules
- ✅ Both video and news fetching integrated

### Manual Verification
1. **Check logs**: Monitor Strapi console for cron job execution
2. **Database verification**: Check that new content is being created
3. **API testing**: Verify endpoints return fresh content
4. **Admin panel**: Confirm settings are being respected

## Troubleshooting

### Common Issues
1. **Jobs not running**: Check `cron.enabled: true` in server config
2. **Service errors**: Verify all required services exist and are accessible
3. **Timezone issues**: Ensure `tz: 'Asia/Bangkok'` is set for all jobs
4. **Memory issues**: Monitor system resources during high-frequency jobs

### Debug Commands
```bash
# Check if Strapi is running
curl http://localhost:1337/admin/init

# Monitor logs in real-time
tail -f logs/strapi.log

# Test individual services
node test-cron-configuration.js
```

## Production Deployment

### Environment Variables Required
- `NEWS_API_KEY`: For news fetching service
- `YOUTUBE_API_KEY`: For video fetching service
- `FIREBASE_CONFIG`: For authentication and storage
- All other service-specific API keys

### Docker Configuration
The cron jobs run within the main Strapi process, so no additional Docker configuration is needed. The jobs will automatically start with the Strapi container.

### Scaling Considerations
- **Single instance**: All cron jobs run in the main Strapi process
- **Multi-instance**: Consider using external job queue for distributed deployments
- **Database locking**: Ensure proper concurrency handling for cleanup operations

## Future Enhancements

### Planned Improvements
- **Dynamic scheduling**: Adjust frequency based on content volume
- **Health checks**: Automated monitoring and alerting
- **Performance metrics**: Detailed analytics for job execution
- **Admin interface**: GUI for managing cron job schedules

### Extension Points
- **New services**: Easy to add new cron jobs using the same pattern
- **Custom schedules**: Support for complex scheduling rules
- **Integration hooks**: Connect with external monitoring systems
