# Breaking News API Permission Setup

## Quick Setup Steps

1. **Open Strapi Admin Panel**
   - Go to: http://localhost:1337/admin
   - Login with your admin credentials

2. **Navigate to Permissions**
   - Click "Settings" in the left sidebar
   - Click "Users & Permissions Plugin"
   - Click "Roles"

3. **Configure Public Role**
   - Click on "Public" role
   - Scroll down to find "Breaking-news" section
   - Enable these permissions:
     - ✅ `find` - Allows reading all breaking news
     - ✅ `findOne` - Allows reading individual articles
     - ❌ `create` - Keep disabled for security
     - ❌ `update` - Keep disabled for security
     - ❌ `delete` - Keep disabled for security

4. **Save Changes**
   - Click "Save" button at the top right

## Test API Access

After saving, test the API:

```bash
# Test basic access
curl "http://localhost:1337/api/breaking-news-plural"

# Should return: {"data": [], "meta": {...}}
# Instead of: {"error": {"status": 403, "name": "ForbiddenError"}}
```

## Next Steps

Once permissions are configured:
1. Test the breaking-news API endpoints
2. Run the news scheduler to populate articles
3. Test frontend integration

## Troubleshooting

- If still getting 403 errors, try restarting Strapi
- Check that "breaking-news" appears in the permissions list
- Verify the content type is properly registered
