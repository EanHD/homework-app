/**
 * Supabase Edge Function: diag
 * Logs presence and lengths of required env vars for Web Push (VAPID_*),
 * and returns a JSON diagnostics report. Useful to verify server is using
 * the expected keys and that redeploy picked up new env values.
 * @verify_jwt false
 */
export const config = { verify_jwt: false } as const;

import { corsify, preflight } from "../_shared/cors.ts";

function isUrlSafeB64(s: string | undefined): boolean {
  if (!s) return false;
  return /^[A-Za-z0-9_-]+$/.test(s);
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return corsify(req, pf);

  try {
    const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC') || '';
    const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE') || '';
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || '';
    const PROJECT_URL = Deno.env.get('PROJECT_URL') || '';
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') || '';

    const pubLen = VAPID_PUBLIC.length;
    const pvtLen = VAPID_PRIVATE.length;
    let pubHash = '';
    try { pubHash = (await sha256Hex(VAPID_PUBLIC)).slice(0, 12); } catch {}

    const body = {
      present: {
        VAPID_PUBLIC: !!VAPID_PUBLIC,
        VAPID_PRIVATE: !!VAPID_PRIVATE,
        VAPID_SUBJECT: !!VAPID_SUBJECT,
        PROJECT_URL: !!PROJECT_URL,
        SERVICE_ROLE_KEY: !!SERVICE_ROLE_KEY,
      },
      lengths: {
        VAPID_PUBLIC: pubLen,
        VAPID_PRIVATE: pvtLen,
        VAPID_SUBJECT: VAPID_SUBJECT.length,
      },
      urlSafeBase64: {
        VAPID_PUBLIC: isUrlSafeB64(VAPID_PUBLIC),
        VAPID_PRIVATE: isUrlSafeB64(VAPID_PRIVATE),
      },
      vapidPublicHash: pubHash,
      note: 'Expect public ≈ 87 chars (starts with B), private ≈ 43–44 chars (single line, url-safe).',
    };
    return corsify(req, new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return corsify(req, new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 }));
  }
});

