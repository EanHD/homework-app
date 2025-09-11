import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as notif from '@/store/notifications';

declare const global: any;

describe('notifications (SW-only)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock Notification API
    (global as any).Notification = {
      permission: 'granted',
      requestPermission: vi.fn(),
    } as any;
    // Mock service worker registration
    const swReg = { showNotification: vi.fn(async () => {}) };
    (global as any).navigator = {
      serviceWorker: {
        getRegistration: vi.fn(async () => swReg),
      },
    } as any;
  });

  it('uses service worker registration to show notifications; no page-level Notification fallback', async () => {
    const newSpy = vi.spyOn<any, any>(global, 'Notification');
    await notif.showNotification('Hello', { body: 'World' });
    const reg = await (navigator as any).serviceWorker.getRegistration();
    expect(reg.showNotification).toHaveBeenCalledWith('Hello', { body: 'World' });
    // Ensure no page-level constructor usage
    expect(newSpy).not.toHaveBeenCalled();
  });
});

