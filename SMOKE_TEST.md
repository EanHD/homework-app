# Smoke Test Guide

Quick validation commands for development and production environments to ensure the Homework Buddy PWA is working correctly.

## ✅ 009 Quick Checklist (this repo)
- Dev server: `npm run dev` serves at `http://localhost:5000`
- Build preview: `npm run build && npm run preview` at `http://localhost:4173/homework-app/`
- Pages base: HTML `<base href="/homework-app/">`; SW at `/homework-app/sw.js`
- Runtime config: `config.json` loads at base (functionsBase + vapidPublic)
- Enable push: Settings → “Enable push notifications” shows success + “Subscribed” badge
- CORS preflight: see `specs/009-repair-replit-changes/cors-allowlist.md` for curl examples
- Artifacts: capture SW registration, subscription success, and Pages site loaded screenshots

## 🏠 Development Environment Tests

### Prerequisites
```bash
# Ensure dependencies are installed
npm ci

# Start development server
npm run dev
# Server should start on http://localhost:5000
```

### 1. Basic Application Load
```bash
# Test basic page loads (run while dev server is running)
curl -I http://localhost:5000
# Expected: HTTP/1.1 200 OK

curl -I http://localhost:5000/index.html
# Expected: HTTP/1.1 200 OK

# Test service worker registration
curl -I http://localhost:5000/sw.js
# Expected: HTTP/1.1 200 OK
```

### 2. API Endpoints (Development)
```bash
# Test CORS preflight (replace with actual Supabase URL)
curl -X OPTIONS \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -i \
  https://your-project.supabase.co/functions/v1/push-subscribe
# Expected: Access-Control-Allow-Origin header present

# Test function health (if publicly accessible)
curl -i https://your-project.supabase.co/functions/v1/push-subscribe
# Expected: 401 Unauthorized (indicates JWT auth is working)
```

### 3. Build Process Validation
```bash
# Test build process
npm run build
# Expected: No errors, dist/ directory created

# Check critical build artifacts
ls -la dist/
# Expected: index.html, assets/, sw.js present

# Test built service worker
node -e "
const fs = require('fs');
const sw = fs.readFileSync('dist/sw.js', 'utf8');
console.log('SW size:', sw.length, 'chars');
console.log('Contains cache logic:', sw.includes('caches.open') ? '✅' : '❌');
console.log('Contains build ID:', sw.includes('BUILD_ID') ? '✅' : '❌');
"
```

### 4. Unit Test Validation
```bash
# Run unit tests
npm test
# Expected: All tests pass

# Run specific test suites
npm test -- --run store
npm test -- --run ui
npm test -- --run notifications
```

### 5. E2E Test Validation
```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e
# Expected: All tests pass

# Run specific E2E test suites
npx playwright test subscription-flow.spec.ts
npx playwright test layout-guards.spec.ts

# Generate test report
npx playwright show-report
```

### 6. PWA Manifest Validation
```bash
# Check PWA manifest
curl -s http://localhost:5173/manifest.webmanifest | jq .
# Expected: Valid JSON with name, icons, start_url

# Validate service worker scope
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('./public/manifest.webmanifest', 'utf8'));
console.log('App name:', manifest.name);
console.log('Start URL:', manifest.start_url);
console.log('Scope:', manifest.scope);
console.log('Icons count:', manifest.icons?.length || 0);
"
```

---

## 🌐 Production Environment Tests

### GitHub Pages Deployment
```bash
# Test production deployment (replace with your actual URL)
PROD_URL="https://username.github.io/homework-app"

# 1. Basic page load
curl -I $PROD_URL
# Expected: HTTP/1.1 200 OK

# 2. Service worker availability
curl -I $PROD_URL/sw.js
# Expected: HTTP/1.1 200 OK

# 3. PWA manifest
curl -s $PROD_URL/manifest.webmanifest | jq .
# Expected: Valid JSON with correct start_url and scope

# 4. Check base path configuration
curl -s $PROD_URL | grep -o 'base href="[^"]*"'
# Expected: base href="/homework-app/" (or your repo name)
```

### 5. Production Build Validation
```bash
# Build for production and test locally
npm run build
npx vite preview --port 4173

# Test preview server
curl -I http://localhost:4173
# Expected: HTTP/1.1 200 OK

# Check service worker in preview
curl -I http://localhost:4173/sw.js
# Expected: HTTP/1.1 200 OK
```

### 6. HTTPS and Security Headers
```bash
# Test HTTPS (production only)
curl -I -s $PROD_URL | grep -E "(HTTP|Security|Content-Security)"
# Expected: HTTPS status, security headers if configured

# Check for service worker scope in production
curl -s $PROD_URL/sw.js | grep -o "scope.*['\"].*['\"]"
# Expected: Correct scope for production base path
```

---

## 🔔 Push Notification Smoke Tests

### Manual Browser Testing (Required)
Since push notifications require browser APIs, these tests must be done manually:

#### Development Testing:
1. Open http://localhost:5173 in browser
2. Navigate to Settings
3. Click "Enable push notifications"
4. Accept permission prompt
5. Verify "Subscribed" badge appears
6. Check browser console for errors

#### Push Notification Backend Testing:
```bash
# Test push notification system (requires valid subscription)
npm run test:push:config
# Expected: Shows VAPID configuration

# Test Supabase functions (requires auth setup)
npm run test:push:subscriptions
# Expected: Lists current subscriptions

# Send test notification (requires subscription and auth)
npm run test:push:trigger
# Expected: Notification sent successfully
```

---

## 🛡️ Security Validation

### 1. Environment Variables Check
```bash
# Check that sensitive data isn't exposed
grep -r "sk_" . --exclude-dir=node_modules || echo "✅ No secret keys in code"
grep -r "SECRET" . --exclude-dir=node_modules --exclude="*.md" || echo "✅ No hardcoded secrets"

# Verify VAPID keys are properly configured (production)
echo $VITE_VAPID_PUBLIC_KEY | wc -c
# Expected: ~90 characters (base64 VAPID key)
```

### 2. Build Security Check
```bash
# Check built files for any exposed secrets
find dist -name "*.js" -exec grep -l "sk_\|SECRET" {} \; || echo "✅ No secrets in built files"

# Verify service worker doesn't expose sensitive data
grep -E "(api.*key|secret|password)" dist/sw.js || echo "✅ SW clean"
```

---

## 📊 Performance Validation

### 1. Bundle Size Check
```bash
# Check bundle sizes after build
npm run build
du -sh dist/
# Expected: < 2MB total

# Check individual asset sizes
ls -lh dist/assets/
# Expected: JS bundles < 500KB each
```

### 2. Lighthouse CLI (Optional)
```bash
# Install Lighthouse CLI (if available)
npm install -g lighthouse

# Run Lighthouse audit (requires running server)
lighthouse http://localhost:5173 --output json --output-path ./lighthouse-report.json
# Expected: PWA score > 90, Performance > 80
```

---

## 🐛 Troubleshooting Common Issues

### Service Worker Issues:
```bash
# Clear service worker cache in browser dev tools:
# Application tab → Service Workers → Unregister
# Application tab → Storage → Clear storage

# Check service worker registration errors:
# Browser Console → Look for SW registration errors
```

### Build Issues:
```bash
# Clean build artifacts
rm -rf dist/ node_modules/.vite/

# Reinstall dependencies
npm ci

# Run build with verbose output
npm run build -- --debug
```

### Test Issues:
```bash
# Clear test caches
npx playwright install --force
rm -rf test-results/ playwright-report/

# Run tests with debug output
DEBUG=pw:api npm run test:e2e
```

---

## ✅ Quick Validation Checklist

Copy-paste this checklist for quick validation:

### Development Checklist:
- [ ] `npm ci` - Dependencies installed
- [ ] `npm run dev` - Server starts on :5173  
- [ ] `curl -I http://localhost:5173` - Returns 200 OK
- [ ] `npm test` - All unit tests pass
- [ ] `npm run build` - Build succeeds without errors
- [ ] Manual: Settings → Enable notifications works
- [ ] Manual: PWA install prompt appears (Chrome/Edge)

### Production Checklist:
- [ ] GitHub Actions build passes
- [ ] Production URL loads correctly
- [ ] `curl -I $PROD_URL/sw.js` - Service worker available
- [ ] `curl -s $PROD_URL/manifest.json | jq .` - Valid PWA manifest
- [ ] Manual: PWA install works on production
- [ ] Manual: Push notifications work with production backend
- [ ] No console errors in production environment

### CI/CD Checklist:  
- [ ] `npm run test:e2e` - E2E tests pass locally
- [ ] GitHub Actions "Tests" workflow passes
- [ ] GitHub Actions "Deploy to GitHub Pages" workflow passes
- [ ] All artifacts uploaded on test failures
