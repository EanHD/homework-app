import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postSubscribe } from '@/services/pushApi';

declare const global: any;

describe('Contract: POST /subscribe', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Configure runtime base via localStorage override
    localStorage.setItem('hb_functions_base', 'https://example.functions.supabase.co');
  });

  it('posts subscription payload to {base}/subscribe with JSON body', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
    );

    const payload = {
      userId: 'user-123',
      endpoint: 'https://push.service/endpoint/abc',
      keys: { p256dh: 'pkey', auth: 'akey' },
    };

    const res = await postSubscribe(payload);
    expect(res?.ok).toBe(true);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://example.functions.supabase.co/subscribe');
    expect((init as RequestInit).method).toBe('POST');
    expect((init as any).headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(String((init as any).body));
    expect(body).toEqual(payload);
  });
});

