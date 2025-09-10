// Supabase Edge Function: subscribe
// POST { userId: string, endpoint: string, keys: { p256dh: string, auth: string } }
// Upsert a web push subscription keyed by endpoint

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Payload = {
  userId?: string;
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

function cors(resp: Response) {
  const headers = new Headers(resp.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'content-type, authorization');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, DELETE');
  return new Response(resp.body, { status: resp.status, headers });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) return cors(new Response('Missing Supabase env', { status: 500 }));
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    if (req.method === 'DELETE') {
      const body = (await req.json()) as { userId?: string; endpoint?: string };
      if (!body.endpoint || !body.userId) return cors(new Response('Invalid input', { status: 400 }));
      await supabase.from('push_subscriptions').delete().match({ endpoint: body.endpoint, user_id: body.userId });
      return cors(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    }

    const body = (await req.json()) as Payload;
    if (!body.userId || !body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return cors(new Response('Invalid input', { status: 400 }));
    }

    const row = {
      user_id: body.userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    };
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(row, { onConflict: 'endpoint' });
    if (error) return cors(new Response(error.message, { status: 500 }));
    return cors(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  } catch (e) {
    return cors(new Response(`Error: ${e instanceof Error ? e.message : 'unknown'}`, { status: 500 }));
  }
});

