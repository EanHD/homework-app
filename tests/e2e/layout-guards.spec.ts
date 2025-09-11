import { test, expect } from '@playwright/test';

test.describe('Layout Guards - DOM Assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper header layout and mobile-friendly sizing', async ({ page }) => {
    // Verify header is present and properly sized
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Header should have reasonable height (not oversized)
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBeLessThanOrEqual(60); // Max 60px for all viewports
    expect(headerBox?.height).toBeGreaterThanOrEqual(40); // Min 40px for usability
    
    // Header should span full width
    expect(headerBox?.width).toBeGreaterThan(300); // Reasonable minimum width
  });

  test('should have FAB (Floating Action Button) positioned correctly', async ({ page }) => {
    // Find the add button (FAB)
    const fab = page.locator('[data-onboarding="add-button"]');
    await expect(fab).toBeVisible();
    
    // FAB should be positioned at bottom right
    const fabBox = await fab.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (fabBox && viewportSize) {
      // Should be in bottom portion of screen
      expect(fabBox.y + fabBox.height).toBeGreaterThan(viewportSize.height * 0.7);
      
      // Should be in right portion of screen  
      expect(fabBox.x + fabBox.width).toBeGreaterThan(viewportSize.width * 0.7);
      
      // Should not be clipped at bottom (leave room for safe area)
      expect(fabBox.y + fabBox.height).toBeLessThan(viewportSize.height - 20);
    }
  });

  test('should have proper content area without overlaps', async ({ page }) => {
    // Main content area should be visible and properly positioned
    const mainContent = page.locator('main, [role="main"], .content-area').first();
    await expect(mainContent).toBeVisible();
    
    const contentBox = await mainContent.boundingBox();
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    
    if (contentBox && headerBox) {
      // Content should start below header
      expect(contentBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 5); // Allow 5px overlap tolerance
      
      // Content should have reasonable height
      expect(contentBox.height).toBeGreaterThan(200);
    }
  });

  test('should have proper navigation layout', async ({ page }) => {
    // Navigation should be accessible (try multiple selectors for stability)
    const nav = page.locator('nav, [role="navigation"], [data-testid="navigation"]').first();
    await expect(nav).toBeVisible();
    
    // Navigation items should be present - try multiple approaches
    const navItems = page.locator('nav a, [role="navigation"] a, [data-testid="navigation"] a');
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least 2 nav items
    
    // Each nav item should be properly sized and clickable
    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      await expect(item).toBeVisible();
      
      const itemBox = await item.boundingBox();
      if (itemBox) {
        expect(itemBox.width).toBeGreaterThan(20); // Min touch target
        expect(itemBox.height).toBeGreaterThan(20); // Min touch target
      }
    }
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Test mobile viewport (375x667 - iPhone SE size)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // All essential elements should still be visible and usable
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.locator('[data-onboarding="add-button"]')).toBeVisible();
    
    // Header should be appropriately sized for mobile
    const headerBox = await page.locator('header').boundingBox();
    expect(headerBox?.height).toBeLessThanOrEqual(60); // Consistent with desktop limit
  });

  test('should have proper bottom padding for FAB clearance', async ({ page }) => {
    // Check that the main content area has proper padding-bottom for FAB clearance
    const paddingBottom = await page.evaluate(() => {
      const mainElement = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
      return window.getComputedStyle(mainElement).paddingBottom;
    });
    
    // Should have at least 80px padding-bottom for FAB clearance
    const paddingValue = parseInt(paddingBottom, 10);
    expect(paddingValue).toBeGreaterThanOrEqual(80);
    
    // Also verify FAB doesn't overlap with content by checking positions
    const fab = page.locator('[data-onboarding="add-button"]');
    await expect(fab).toBeVisible();
    
    const fabBox = await fab.boundingBox();
    if (fabBox) {
      // FAB should be positioned so it doesn't block main content scrolling
      expect(fabBox.y).toBeGreaterThan(100); // Should not be too high up
    }
  });

  test('should have proper focus management for keyboard navigation', async ({ page }) => {
    // Test tab navigation works properly
    await page.keyboard.press('Tab');
    
    // First focusable element should be focused
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    
    // Focus should be visible (not hidden behind other elements)
    const focusedBox = await focused.boundingBox();
    if (focusedBox) {
      expect(focusedBox.width).toBeGreaterThan(0);
      expect(focusedBox.height).toBeGreaterThan(0);
    }
  });
});

test.describe.skip('Layout Guards - Visual Comparison (requires baseline snapshots)', () => {
  test('should match expected main page layout', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load and any animations to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Take screenshot for visual regression testing
    await expect(page).toHaveScreenshot('main-page-layout.png', {
      animations: 'disabled',
      maxDiffPixels: 100, // Stricter tolerance
      maxDiffPixelRatio: 0.02, // Allow 2% pixel difference
    });
  });

  test('should match expected settings page layout', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to settings using stable selector approach
    const settingsLink = page.locator('nav a, [role="navigation"] a').filter({ hasText: /settings|Settings/i }).first();
    await settingsLink.click();
    
    // Wait for page to load and animations to complete
    await expect(page.getByText('Notifications')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('settings-page-layout.png', {
      animations: 'disabled',
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('should match expected mobile layout', async ({ page }) => {
    // Set mobile viewport consistently
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for layout to settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-main-layout.png', {
      animations: 'disabled',
      maxDiffPixels: 80, // Even stricter for mobile
      maxDiffPixelRatio: 0.02,
    });
  });
});