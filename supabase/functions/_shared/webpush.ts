// Minimal Web Push sender for Deno (no payload variant)
// - Generates a VAPID JWT (ES256) and POSTs to the endpoint with empty body
// - This triggers a push event; the Service Worker can show a default notification

function b64urlEncode(bytes: Uint8Array): string {
  const bin = Array.from(bytes).map((b) => String.fromCharCode(b)).join('');
  // deno-lint-ignore no-deprecated-deno-api
  const b64 = btoa(bin);
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 2 ? '==' : input.length % 4 === 3 ? '=' : '';
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  // deno-lint-ignore no-deprecated-deno-api
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function base64urlFromString(s: string): string {
  return b64urlEncode(utf8(s));
}

function derToJose(der: Uint8Array, size = 32): Uint8Array {
  // Parse DER ECDSA signature (r and s) and convert to JOSE (raw) 64 bytes
  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('Invalid DER sequence');
  const seqLen = der[offset++];
  if (der[offset++] !== 0x02) throw new Error('Invalid DER integer (r)');
  const rLen = der[offset++];
  let r = der.slice(offset, offset + rLen);
  offset += rLen;
  if (der[offset++] !== 0x02) throw new Error('Invalid DER integer (s)');
  const sLen = der[offset++];
  let s = der.slice(offset, offset + sLen);
  // Trim leading zeros and left-pad to size
  while (r.length > 0 && r[0] === 0x00) r = r.slice(1);
  while (s.length > 0 && s[0] === 0x00) s = s.slice(1);
  const rPadded = new Uint8Array(size);
  rPadded.set(r, size - r.length);
  const sPadded = new Uint8Array(size);
  sPadded.set(s, size - s.length);
  const out = new Uint8Array(size * 2);
  out.set(rPadded, 0);
  out.set(sPadded, size);
  return out;
}

async function importVapidKey(vapidPublic: string, vapidPrivate: string): Promise<CryptoKey> {
  // vapidPublic is uncompressed EC point (65 bytes) base64url; extract x/y (skip leading 0x04)
  const pub = b64urlDecode(vapidPublic);
  if (pub.length !== 65 || pub[0] !== 0x04) throw new Error('Invalid VAPID public key');
  const x = pub.slice(1, 33);
  const y = pub.slice(33, 65);
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: b64urlEncode(x),
    y: b64urlEncode(y),
    d: b64urlEncode(b64urlDecode(vapidPrivate)),
    ext: true,
  };
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

function originFromUrl(url: string): string {
  const u = new URL(url);
  return `${u.protocol}//${u.host}`;
}

export async function sendPushNoPayload(
  endpoint: string,
  opts: { vapidPublic: string; vapidPrivate: string; subject: string; ttl?: number }
): Promise<Response> {
  const key = await importVapidKey(opts.vapidPublic, opts.vapidPrivate);
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 12 * 60 * 60; // 12 hours
  const header = { alg: 'ES256', typ: 'JWT' };
  const payload = { aud: originFromUrl(endpoint), exp, sub: opts.subject };
  const securedInput = `${base64urlFromString(JSON.stringify(header))}.${base64urlFromString(JSON.stringify(payload))}`;
  const sigDer = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: { name: 'SHA-256' } }, key, utf8(securedInput)));
  const sigJose = derToJose(sigDer, 32);
  const jwt = `${securedInput}.${b64urlEncode(sigJose)}`;

  const headers: Record<string, string> = {
    Authorization: `WebPush ${jwt}`,
    'Crypto-Key': `p256ecdsa=${opts.vapidPublic}`,
    TTL: String(opts.ttl ?? 60 * 60),
  };
  return await fetch(endpoint, { method: 'POST', headers, body: new Uint8Array(0) });
}

