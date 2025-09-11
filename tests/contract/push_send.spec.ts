import { describe, expect, it } from 'vitest';
import * as pushApi from '@/services/pushApi';

describe('Contract: POST /send-notifications', () => {
  it('exposes a client helper to trigger cron delivery (to be implemented)', async () => {
    // TDD: ensure a helper will be added
    expect(typeof (pushApi as any).postSendNotifications).toBe('function');
  });
});

