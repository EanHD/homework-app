# Push Notification Test Scripts

This directory contains scripts to test and validate the push notification system.

## Available Scripts

### Quick Start
```bash
# Run full test suite
npm run test:push

# Test specific components
npm run test:push:subscriptions  # Check database subscriptions
npm run test:push:send          # Send test notification  
npm run test:push:trigger       # Trigger notification delivery
npm run test:push:config        # Validate configuration
```

### Manual Execution
```bash
# TypeScript version (recommended)
npx tsx scripts/test-push.ts
npx tsx scripts/test-push.ts subscriptions
npx tsx scripts/test-push.ts send <userId>
npx tsx scripts/test-push.ts trigger

# JavaScript version
node scripts/test-push.js
node scripts/test-push.js subscriptions
```

## Test Components

### 1. Configuration Validation (`config`)
- Checks environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
- Validates VAPID keys from public/config.json
- Verifies function URLs and accessibility

### 2. Subscription Check (`subscriptions`)  
- Queries database for existing push subscriptions
- Displays user IDs and endpoint information
- Helpful for debugging subscription storage issues

### 3. Test Notification (`send <userId>`)
- Sends a test notification to specified user
- Uses the `/schedule` Supabase function
- Tests the notification scheduling pipeline

### 4. Delivery Trigger (`trigger`)
- Manually triggers the `/send-notifications` function
- Simulates the cron job that delivers scheduled notifications
- Tests the notification delivery pipeline

## Environment Variables

The scripts use these environment variables:

```bash
# Required for database access
SUPABASE_URL=https://tihojhmqghihckekvprj.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>

# Optional overrides
FUNCTIONS_BASE=https://tihojhmqghihckekvprj.functions.supabase.co
TEST_USER_ID=test-user-123
```

## Current Limitations ⚠️

Due to architectural issues identified during development:

### 1. Authentication Required
- All functions now require JWT authentication (`verify_jwt: true`)
- Scripts will receive 401 errors until auth integration is complete
- **Solution**: Integrate Supabase Auth and pass Bearer tokens

### 2. CORS Configuration  
- Functions need redeployment with updated CORS settings
- localhost:5000 origin may still be blocked
- **Solution**: Deploy functions with updated CORS allowlist

### 3. Function-Level Config Conflicts
- Function exports may override deno.json settings
- JWT verification behavior may be inconsistent
- **Solution**: Standardize configuration approach

## Expected Responses

### Successful Test Output
```
🚀 Push Notification Test Suite

🔧 Validating configuration...
   Functions: https://tihojhmqghihckekvprj.functions.supabase.co
   SUPABASE_URL: ✅ Set
   VAPID: ✅ Available

🔍 Fetching push subscriptions...
📊 Found 2 subscription(s)
   1. user-123 | https://fcm.googleapis.com/fcm/send/abc123...

📨 Scheduling test notification for: user-123
✅ Notification scheduled!

⚡ Triggering notification delivery...
✅ Notification delivery triggered!

✅ Test suite completed!
```

### Current Error Output (Expected)
```
❌ Schedule failed (401): Unauthorized
💡 Authentication required - JWT verification is enabled
   Integrate Supabase Auth and pass Bearer token
```

## Test Notification Details

The scripts send this test notification:

```json
{
  "title": "🧪 Test Notification",
  "body": "TypeScript test notification - system is working!",
  "icon": "/favicon.ico",
  "badge": "/icon-192x192.png",
  "tag": "test-notification-ts",
  "data": {
    "test": true,
    "source": "test-push-script-ts",
    "environment": "development"
  }
}
```

## Troubleshooting

### 401 Unauthorized Errors
- Functions require JWT authentication
- Need to integrate Supabase Auth first

### CORS Errors  
- Functions need redeployment with updated origins
- Verify localhost:5000 is in CORS allowlist

### Network/Connection Errors
- Check if dev server is running (http://localhost:5000)
- Verify Supabase function URLs are correct
- Test with curl commands from CORS_PREFLIGHT_VALIDATION.md

### Database Connection Errors
- Verify SUPABASE_ANON_KEY environment variable
- Check database permissions and RLS policies

## Integration with Development Workflow

Once authentication and deployment issues are resolved:

1. **During Development**: Run `npm run test:push` to validate notifications
2. **After Changes**: Use `npm run test:push:send <userId>` to test specific users  
3. **Before Deployment**: Run full test suite to ensure system health
4. **Production Testing**: Use production environment variables

## Related Files

- `CORS_PREFLIGHT_VALIDATION.md` - CORS testing documentation
- `public/config.json` - Runtime configuration (VAPID keys)
- `supabase/functions/` - Notification function implementations
- `src/utils/push.ts` - Client-side push utilities