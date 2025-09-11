import { test, expect, Page } from '@playwright/test';

// Mock push subscription data for testing
const mockSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/mock-test-endpoint',
  keys: {
    p256dh: 'mock-p256dh-key',
    auth: 'mock-auth-key'
  }
};

test.describe('Push Notification Subscription Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant notification permissions for stable testing
    await context.grantPermissions(['notifications']);
    
    // Mock the service worker and push subscription APIs
    await page.addInitScript((mockData) => {
      const { mockSubscription } = mockData;
      
      // Create proper PushSubscription-like object
      const createMockSubscription = (data: typeof mockSubscription) => ({
        endpoint: data.endpoint,
        getKey: (name: string) => {
          const keys: Record<string, string> = {
            'p256dh': data.keys.p256dh,
            'auth': data.keys.auth
          };
          return new TextEncoder().encode(keys[name]);
        },
        toJSON: () => data,
        unsubscribe: async () => true
      });

      // Mock Notification permission API
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: async () => 'granted',
        },
        configurable: true
      });

      // Mock service worker and push manager
      const mockSub = createMockSubscription(mockSubscription);
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: async () => ({
            pushManager: {
              getSubscription: async () => null,
              subscribe: async () => mockSub,
            },
            waiting: null,
            installing: null,
            active: { state: 'activated' },
            addEventListener: () => {},
            update: async () => {},
          }),
          getRegistration: async () => ({
            pushManager: {
              getSubscription: async () => mockSub,
              subscribe: async () => mockSub,
            },
          }),
          ready: Promise.resolve({
            pushManager: {
              getSubscription: async () => null,
              subscribe: async () => mockSub,
            },
          }),
          addEventListener: () => {},
        },
        configurable: true
      });
    }, { mockSubscription });

    await page.goto('/');
  });

  test('should complete subscription flow successfully', async ({ page }) => {
    // Navigate to settings page using stable selector
    await page.getByRole('navigation').getByRole('link', { name: /settings/i }).click();
    
    // Wait for settings page to load
    await expect(page.getByText('Notifications')).toBeVisible();

    // Find and click the enable push notifications button
    const enableButton = page.getByRole('button', { name: /enable push notifications/i });
    await expect(enableButton).toBeVisible();
    await enableButton.click();

    // Wait for the success notification
    await expect(page.locator('[data-mantine-notification]')).toBeVisible();
    await expect(page.getByText(/push notifications enabled/i)).toBeVisible();

    // Verify subscription badge appears
    await expect(page.getByText('Subscribed')).toBeVisible();
    
    // Verify permission badge shows granted
    await expect(page.getByText(/permission.*granted/i)).toBeVisible();
  });

  test('should handle subscription errors gracefully', async ({ page }) => {
    // Override the mock to simulate an error
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: async () => {
            throw new Error('Service worker registration failed');
          },
          getRegistration: async () => {
            throw new Error('Service worker not available');
          },
          ready: Promise.reject(new Error('Service worker failed')),
          addEventListener: () => {},
        },
        configurable: true
      });
    });

    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: /settings/i }).click();
    
    // Try to enable push notifications
    const enableButton = page.getByRole('button', { name: /enable push notifications/i });
    await expect(enableButton).toBeVisible();
    await enableButton.click();

    // Wait for error notification
    await expect(page.getByText(/failed to enable push/i)).toBeVisible();
    
    // Verify subscription badge doesn't appear
    await expect(page.getByText('Subscribed')).not.toBeVisible();
  });

  test('should allow unsubscribing from notifications', async ({ page }) => {
    // Navigate to settings and enable notifications first
    await page.getByRole('navigation').getByRole('link', { name: /settings/i }).click();
    
    const enableButton = page.getByRole('button', { name: /enable push notifications/i });
    await enableButton.click();
    
    // Wait for subscription to complete
    await expect(page.getByText('Subscribed')).toBeVisible();
    
    // Now unsubscribe
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    await expect(unsubscribeButton).toBeVisible();
    await unsubscribeButton.click();

    // Wait for unsubscribe notification
    await expect(page.getByText(/unsubscribed/i)).toBeVisible();
    
    // Verify subscription badge is removed
    await expect(page.getByText('Subscribed')).not.toBeVisible();
  });

  test('should handle unsupported browsers gracefully', async ({ page }) => {
    // Mock unsupported browser environment
    await page.addInitScript(() => {
      // Remove Notification API
      delete (window as any).Notification;
      
      // Remove service worker support
      delete (navigator as any).serviceWorker;
    });

    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: /settings/i }).click();
    
    // Verify "Not supported" badge appears
    await expect(page.getByText(/not supported/i)).toBeVisible();
    
    // Enable button should still be present but won't work
    const enableButton = page.getByRole('button', { name: /enable push notifications/i });
    await expect(enableButton).toBeVisible();
  });

  test('should preserve notification settings across page reloads', async ({ page }) => {
    // Enable notifications
    await page.getByRole('navigation').getByRole('link', { name: /settings/i }).click();
    const enableButton = page.getByRole('button', { name: /enable push notifications/i });
    await enableButton.click();
    await expect(page.getByText('Subscribed')).toBeVisible();
    
    // Reload the page
    await page.reload();
    await page.getByRole('navigation').getByRole('link', { name: /settings/i }).click();
    
    // Verify settings are preserved
    await expect(page.getByText('Subscribed')).toBeVisible();
    await expect(page.getByText(/permission.*granted/i)).toBeVisible();
  });

  test('should navigate to main app from notification click', async ({ page }) => {
    // This test simulates notification click behavior
    // Since we can't actually trigger real notifications, we test the navigation logic
    
    // Navigate away from main page
    await page.getByRole('navigation').getByRole('link', { name: /settings/i }).click();
    await expect(page.getByText('Notifications')).toBeVisible();
    
    // Simulate notification click navigation
    await page.goto('/#/main');
    
    // Verify we're back on the main page
    await expect(page.getByRole('heading', { name: /today/i })).toBeVisible();
    await expect(page.locator('[data-onboarding="add-button"]')).toBeVisible();
  });
});