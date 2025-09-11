import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postSchedule } from '@/services/pushApi';

declare const global: any;

describe('Contract: POST /schedule', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('hb_functions_base', 'https://example.functions.supabase.co');
  });

  it('posts schedule with ISO UTC and Prefer: resolution=merge-duplicates header', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }) as any
    );

    const sendAt = new Date('2025-01-01T00:00:00.000Z').toISOString();
    const payload = {
      userId: 'user-123',
      assignmentId: 'a-1',
      title: 'Reminder',
      body: 'Body',
      url: '/homework-app/#/main',
      sendAt,
    };

    const res = await postSchedule(payload);
    expect(res?.ok).toBe(true);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://example.functions.supabase.co/schedule');
    expect((init as RequestInit).method).toBe('POST');
    const headers = (init as any).headers as Record<string, string>;
    // Expect Prefer header to guide server-side dedupe
    expect(headers['Prefer']).toBe('resolution=merge-duplicates');
    const body = JSON.parse(String((init as any).body));
    expect(body).toEqual(payload);
  });
});

