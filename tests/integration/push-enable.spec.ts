import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enablePush } from '@/utils/push';
import * as pushApi from '@/services/pushApi';

declare const global: any;

function makeFakeSubscription(endpoint: string) {
  return {
    toJSON() {
      return { endpoint, keys: { p256dh: 'p', auth: 'a' } };
    },
  } as any;
}

describe('enablePush helper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Permission granted
    (global as any).Notification = { permission: 'granted', requestPermission: vi.fn() } as any;
    // Default: no fetches unless subscribe posts
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }) as any);
  });

  it('reuses existing subscription and does not call subscribe', async () => {
    const sub = makeFakeSubscription('https://push/endpoint');
    const getSubscription = vi.fn(async () => sub);
    const subscribe = vi.fn();
    (global as any).navigator = {
      serviceWorker: {
        getRegistration: vi.fn(async () => ({ pushManager: { getSubscription, subscribe } })),
        register: vi.fn(),
      },
    } as any;

    const postSpy = vi.spyOn(pushApi, 'postSubscribe');
    const res = await enablePush('user-1');
    expect(res.reused).toBe(true);
    expect(getSubscription).toHaveBeenCalled();
    expect(subscribe).not.toHaveBeenCalled();
    expect(postSpy).toHaveBeenCalled();
  });
});

