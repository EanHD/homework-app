# Quickstart: Notifications Reliability & UI Polish

**Feature**: 008-notifications-ui-polish  
**Purpose**: Validation scenarios for notification functionality and UI layout fixes

## Test Scenarios

### Scenario 1: Notification Registration & Delivery (E2E)

**Objective**: Verify complete push notification flow works in development and production

**Prerequisites**:
- App running on localhost:5000 (dev) or GitHub Pages (prod)
- Browser supports Web Push (Chrome, Firefox, Safari 16.4+ in PWA)
- HTTPS context available

**Steps**:
1. Open app in browser
2. Navigate to Settings page  
3. Click "Enable Notifications" toggle
4. Grant permission when browser prompts
5. Verify success message appears
6. Click "Send Test Notification" button
7. Wait up to 60 seconds for notification delivery
8. Verify notification appears with correct title/body
9. Click notification to verify it opens/focuses the app

**Expected Results**:
- Permission request appears and can be granted
- Test notification is delivered within 60 seconds
- Notification content matches expected format
- Click action properly navigates to app

**Failure Points to Check**:
- CORS errors in browser console
- Service Worker registration failures  
- VAPID key configuration issues
- Network connectivity problems

### Scenario 2: Mobile Layout Validation

**Objective**: Verify UI displays correctly on mobile devices with safe areas

**Prerequisites**:
- Mobile device or browser dev tools with device simulation
- iOS Safari (for safe area testing) or Android Chrome
- Portrait and landscape orientations

**Steps**:
1. Open app on mobile device or simulate mobile viewport
2. Verify header doesn't obstruct main content
3. Navigate to Today/Upcoming pages with long assignment lists  
4. Scroll to bottom of lists, verify all content visible
5. Rotate to landscape, verify layout adapts properly
6. Focus on form inputs, verify keyboard doesn't hide content
7. Test on device with notch/dynamic island if available

**Expected Results**:
- Header height allows full content visibility
- List items are not clipped at viewport bottom
- Safe area insets prevent content from being hidden by notch/home indicator
- Keyboard interaction maintains content accessibility
- Layout is responsive across orientations

**Measurements to Validate**:
- Header height: ~60px, doesn't exceed 10% of viewport
- Safe area handling: Content respects top/bottom insets
- Content scrolling: Full list visibility without clipping

### Scenario 3: Service Worker Cache & Registration

**Objective**: Verify service worker registration is reliable across app sessions

**Prerequisites**:
- Browser with service worker support
- Developer tools open to Application tab

**Steps**:
1. Open app with dev tools → Application → Service Workers
2. Verify service worker registers successfully
3. Note service worker script URL and version
4. Refresh page, verify service worker remains active
5. Clear browser cache, verify service worker re-registers
6. Go offline, verify app shell loads from cache
7. Return online, verify updates work correctly

**Expected Results**:
- Service worker registers without errors
- Cache-busting prevents stale service worker issues
- Offline functionality works for cached resources
- Service worker updates properly on app changes

### Scenario 4: Cross-Browser Permission Handling

**Objective**: Verify notification permission flow works across supported browsers

**Prerequisites**:
- Chrome, Firefox, Safari (if available)
- Both desktop and mobile versions where applicable

**Steps**:
1. Test permission flow in Chrome:
   - Enable notifications → verify success
   - Block notifications → verify graceful handling
   - Reset permissions → verify re-enable works
2. Repeat in Firefox with same steps  
3. Test in Safari (if iOS 16.4+ PWA available)
4. Verify error messages are clear and actionable

**Expected Results**:
- Permission request appears in all supported browsers
- Denied permissions show helpful recovery instructions
- Re-enabling permissions works without app reload
- Unsupported environments show appropriate fallback

## Environment Setup

### Development Environment
```bash
# Start development server
npm run dev

# Verify server accessibility
curl -I http://localhost:5000/

# Check service worker availability  
curl http://localhost:5000/sw.js | head -5

# Test CORS configuration
curl -X OPTIONS 'https://tihojhmqghihckekvprj.functions.supabase.co/subscribe' \
  -H 'Origin: http://localhost:5000' \
  -H 'Access-Control-Request-Method: POST' -i
```

### Production Environment
```bash
# Verify production deployment
curl -I https://eanhd.github.io/homework-app/

# Check PWA manifest
curl https://eanhd.github.io/homework-app/manifest.webmanifest

# Validate service worker scope
curl https://eanhd.github.io/homework-app/sw.js | grep -i scope
```

### Test Data Setup
```javascript
// Generate test user ID for manual testing
const testUserId = 'test-user-' + Date.now();
localStorage.setItem('hb_user_id', testUserId);

// Test notification scheduling (browser console)
const testSchedule = {
  userId: testUserId,
  assignmentId: 'test-assignment-' + Date.now(),
  title: 'Quickstart Test Notification',
  body: 'This notification validates the E2E flow',
  sendAt: new Date(Date.now() + 60000).toISOString() // 1 minute from now
};

// Manual API test (replace with actual functions URL)
fetch('https://tihojhmqghihckekvprj.functions.supabase.co/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testSchedule)
});
```

## Success Criteria

### Notification Flow
- ✅ Permission request works in target browsers
- ✅ Service worker registers and handles push events
- ✅ Backend subscription storage succeeds
- ✅ Test notifications deliver within 60 seconds  
- ✅ Notification clicks properly navigate to app

### UI Layout  
- ✅ Header doesn't obstruct content on any screen size
- ✅ Content scrolls fully without bottom clipping
- ✅ Safe area insets work on iOS devices with notch/Dynamic Island
- ✅ Virtual keyboard doesn't hide important UI elements
- ✅ Layout is responsive across mobile orientations

### Error Handling
- ✅ Denied permissions show clear recovery instructions
- ✅ Network failures display appropriate messages
- ✅ Unsupported browsers gracefully degrade functionality
- ✅ CORS issues provide actionable error information

### Performance
- ✅ Service worker registration doesn't block app startup
- ✅ UI layout changes don't cause visible reflow
- ✅ Cache-busting prevents stale content issues
- ✅ Push subscription flow completes within reasonable time

## Troubleshooting Guide

### Common Issues
1. **CORS Errors**: Update allowed origins in `supabase/functions/_shared/cors.ts`
2. **Service Worker Fails**: Check scope and cache-busting parameters
3. **Notifications Don't Arrive**: Verify VAPID keys and subscription storage
4. **Mobile Layout Issues**: Test safe-area CSS variables and viewport meta tag
5. **Permission Denied**: Ensure HTTPS context and clear recovery messaging

### Debug Commands
```bash
# View notification subscription details
# (Run in browser console on app page)
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => console.log(sub?.toJSON()))
);

# Check safe area inset values  
# (Run in browser console)
console.log({
  top: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)'),
  bottom: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')
});

# Test service worker messaging
navigator.serviceWorker.ready.then(reg =>
  reg.active?.postMessage({type: 'test', payload: 'quickstart validation'})
);
```