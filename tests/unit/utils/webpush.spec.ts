import { describe, it, expect } from 'vitest';
import { base64UrlToUint8Array } from '@/utils/webpush';

describe('base64UrlToUint8Array', () => {
  it('converts base64url to bytes', () => {
    // 'hello' in base64url is 'aGVsbG8'
    const out = base64UrlToUint8Array('aGVsbG8');
    const str = String.fromCharCode(...out);
    expect(str).toContain('hello');
  });
});

