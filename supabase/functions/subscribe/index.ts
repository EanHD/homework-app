/**
 * Supabase Edge Function: subscribe (Supabase CLI deploy path)
 * @verify_jwt false
 */
// Supabase Edge Function: subscribe (Supabase CLI deploy path)
// POST { userId: string, endpoint: string, keys: { p256dh: string, auth: string } }
// DELETE { userId: string, endpoint: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsify, preflight } from "../_shared/cors.ts";

type Payload = {
  userId?: string;
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return corsify(req, pf);

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return corsify(req, new Response('Method Not Allowed', { status: 405 }));
  }

  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
    return corsify(req, new Response('Missing Supabase env', { status: 500 }));
  }
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    if (req.method === 'DELETE') {
      const body = (await req.json()) as { userId?: string; endpoint?: string };
      if (!body.endpoint || !body.userId) return corsify(req, new Response('Invalid input', { status: 400 }));
      await supabase.from('push_subscriptions').delete().match({ endpoint: body.endpoint, user_id: body.userId });
      try { console.log('[subscribe][DELETE]', { user: body.userId, endpoint: (body.endpoint || '').slice(0, 24) + '...' }); } catch {}
      return corsify(req, new Response(JSON.stringify({ ok: true, action: 'deleted' }), { status: 200 }));
    }

    const ct = req.headers.get('content-type') || '';
    const origin = req.headers.get('origin') || '';
    let body: Payload | null = null;
    try {
      body = (await req.json()) as Payload;
    } catch (e) {
      try { console.log('[subscribe] JSON parse error', String(e)); } catch {}
      return corsify(req, new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400 }));
    }
    if (!body?.userId || !body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      try { console.log('[subscribe] Invalid input', { origin, ct, body }); } catch {}
      return corsify(req, new Response(JSON.stringify({ ok: false, error: 'Invalid input' }), { status: 400 }));
    }

    const row = {
      user_id: body.userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    };
    await supabase.from('push_subscriptions').delete().eq('user_id', body.userId);
    const { error } = await supabase.from('push_subscriptions').insert(row);
    if (error) {
      try { console.log('[subscribe] insert error', { message: error.message }); } catch {}
      return corsify(req, new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 }));
    }
    try {
      console.log('[subscribe][POST] saved', {
        user: body.userId,
        endpoint: body.endpoint.slice(0, 32) + '...',
        origin,
      });
    } catch {}
    return corsify(req, new Response(JSON.stringify({ ok: true, action: 'replaced', userId: body.userId }), { status: 200 }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    try { console.log('[subscribe] unhandled error', msg); } catch {}
    return corsify(req, new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 }));
  }
});
