# CORS Preflight Validation Examples

## Supabase Functions Base URL
`https://tihojhmqghihckekvprj.functions.supabase.co`

## Available Functions
- `/subscribe` - Push subscription management
- `/schedule` - Notification scheduling  
- `/send-notifications` - Cron notification delivery

## CORS Preflight Tests

### 1. Test localhost:5000 (Replit Dev Server) - PRIMARY FIX

**Subscribe Function:**
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe
```

**Schedule Function:**
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  https://tihojhmqghihckekvprj.functions.supabase.co/schedule
```

**Send-Notifications Function:**
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  https://tihojhmqghihckekvprj.functions.supabase.co/send-notifications
```

### 2. Test Vite Default Dev Server (localhost:5173)

**Subscribe Function:**
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe
```

### 3. Test Replit Preview Domain

**Subscribe Function:**
```bash
curl -X OPTIONS \
  -H "Origin: https://1755e6d3-6953-4f17-a66c-a7d844f91178-00-3n90unkyc9g08.kirk.replit.dev" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe
```

### 4. Test Production (GitHub Pages)

**Subscribe Function:**
```bash
curl -X OPTIONS \
  -H "Origin: https://eanhd.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe
```

## Expected Response Headers

For **allowed origins**, expect these headers:

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: <requested-origin>
Access-Control-Allow-Methods: GET,POST,OPTIONS,DELETE,PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, Prefer, Accept
Access-Control-Expose-Headers: Content-Type
Access-Control-Max-Age: 86400
Vary: Origin
```

For **disallowed origins**, expect:

```
HTTP/1.1 204 No Content
Access-Control-Allow-Methods: GET,POST,OPTIONS,DELETE,PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, Prefer, Accept
Access-Control-Expose-Headers: Content-Type
Access-Control-Max-Age: 86400
```

**Note:** No `Access-Control-Allow-Origin` header will be present for disallowed origins.

## Test Disallowed Origin (Should Fail)

```bash
curl -X OPTIONS \
  -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe
```

## Quick Test Command

Test all key origins for subscribe function:

```bash
# Test localhost:5000 (main fix)
echo "=== Testing localhost:5000 ==="
curl -X OPTIONS \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -s -o /dev/null -w "%{http_code} - %{header_json}" \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe

echo -e "\n=== Testing localhost:5173 ==="
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -s -o /dev/null -w "%{http_code}" \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe

echo -e "\n=== Testing GitHub Pages ==="
curl -X OPTIONS \
  -H "Origin: https://eanhd.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -s -o /dev/null -w "%{http_code}" \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe

echo -e "\n=== Testing Disallowed Origin ==="
curl -X OPTIONS \
  -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -s -o /dev/null -w "%{http_code}" \
  https://tihojhmqghihckekvprj.functions.supabase.co/subscribe
```

## Validation Checklist

- ✅ localhost:5000 returns 204 with `Access-Control-Allow-Origin: http://localhost:5000`
- ✅ localhost:5173 returns 204 with `Access-Control-Allow-Origin: http://localhost:5173`  
- ✅ GitHub Pages returns 204 with `Access-Control-Allow-Origin: https://eanhd.github.io`
- ✅ Replit preview returns 204 with corresponding origin header
- ✅ Disallowed origins return 204 without `Access-Control-Allow-Origin` header
- ✅ All responses include proper `Access-Control-Allow-Methods` and other CORS headers