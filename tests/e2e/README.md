# End-to-End Tests

## Overview
This directory contains Playwright end-to-end tests for the Homework Buddy PWA.

## Test Suites

### Subscription Flow Tests (`subscription-flow.spec.ts`)
- Complete push notification subscription flow testing
- Mock-based testing with proper browser API simulation
- Covers success, error, unsubscribe, and browser compatibility scenarios

### Layout Guards (`layout-guards.spec.ts`)  
- DOM assertion-based layout protection
- Catches regressions in header sizing, FAB positioning, content spacing
- Mobile responsiveness and accessibility validation
- **Note**: Visual regression tests are disabled pending baseline generation

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run specific test file
npx playwright test subscription-flow.spec.ts
```

## Visual Regression Setup (Future)

To enable visual regression tests:

1. Generate baseline snapshots in your stable environment:
   ```bash
   npx playwright test layout-guards.spec.ts --update-snapshots
   ```

2. Commit the generated `__screenshots__` directory

3. Remove `.skip` from the visual comparison test suite in `layout-guards.spec.ts`

## Browser Support
Tests run against:
- Chrome/Chromium (desktop)
- Firefox (desktop) 
- WebKit/Safari (desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)