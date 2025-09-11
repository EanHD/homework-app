/**
 * Supabase Edge Function: schedule (Supabase CLI deploy path)
 * @verify_jwt false
 */
export const config = { verify_jwt: false } as const;
// Supabase Edge Function: schedule (Supabase CLI deploy path)
// POST { userId, assignmentId, title?, body?, sendAt?, url? } → insert idempotently
// POST { userId, assignmentId, cancel: true } → mark pending as sent (cancel)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsify, preflight } from "../_shared/cors.ts";

type Payload = {
  userId?: string;
  assignmentId?: string;
  title?: string;
  body?: string;
  sendAt?: string | null;
  cancel?: boolean;
  url?: string; // optional; not persisted server-side
};

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return corsify(req, pf);

  if (req.method !== 'POST') {
    return corsify(req, new Response('Method Not Allowed', { status: 405 }));
  }

  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) return corsify(req, new Response('Missing Supabase env', { status: 500 }));
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    const body = (await req.json()) as Payload;
    const prefer = (req.headers.get('prefer') || '').toLowerCase();
    if (!body.userId || !body.assignmentId) return corsify(req, new Response('Invalid input', { status: 400 }));

    if (body.cancel || !body.sendAt) {
      const { error, count } = await supabase
        .from('scheduled_notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('user_id', body.userId)
        .eq('assignment_id', body.assignmentId)
        .is('sent_at', null)
        .select('*', { count: 'exact', head: true });
      if (error) return corsify(req, new Response(error.message, { status: 500 }));
      try { console.log(`[schedule] cancel marked ${count ?? 0} rows for user ${body.userId}`); } catch {}
      return corsify(req, new Response(JSON.stringify({ ok: true, action: 'canceled', count: count ?? 0, payload: body }), { status: 200 }));
    }

    const row = {
      user_id: body.userId,
      assignment_id: body.assignmentId,
      title: body.title ?? 'Reminder',
      body: body.body ?? '',
      send_at: body.sendAt,
      url: body.url ?? null,
      sent_at: null as string | null,
    } as any;
    const { error } = await supabase.from('scheduled_notifications').insert(row);
    if (error) {
      const msg = String(error.message || '').toLowerCase();
      const isDuplicate = msg.includes('duplicate') || msg.includes('unique');
      if (isDuplicate && prefer.includes('resolution=merge-duplicates')) {
        try { console.log('[schedule] duplicate merged'); } catch {}
        return corsify(req, new Response(JSON.stringify({ ok: true, action: 'merged', payload: body }), { status: 200 }));
      }
      return corsify(req, new Response(error.message, { status: 500 }));
    }
    try { console.log(`[schedule] inserted schedule for user ${body.userId} at ${body.sendAt}`); } catch {}
    return corsify(req, new Response(JSON.stringify({ ok: true, action: 'inserted', payload: body }), { status: 200 }));
  } catch (e) {
    return corsify(req, new Response(`Error: ${e instanceof Error ? e.message : 'unknown'}`, { status: 500 }));
  }
});
