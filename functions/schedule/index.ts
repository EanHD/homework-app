// Supabase Edge Function: schedule
// POST { userId, assignmentId, title?, body?, sendAt?, url? } → upsert
// POST { userId, assignmentId, cancel: true } → delete pending

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Payload = {
  userId?: string;
  assignmentId?: string;
  title?: string;
  body?: string;
  sendAt?: string | null;
  cancel?: boolean;
  url?: string; // optional; not persisted server-side
};

function cors(resp: Response) {
  const headers = new Headers(resp.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'content-type, authorization');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return new Response(resp.body, { status: resp.status, headers });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) return cors(new Response('Missing Supabase env', { status: 500 }));
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    const body = (await req.json()) as Payload;
    if (!body.userId || !body.assignmentId) return cors(new Response('Invalid input', { status: 400 }));

    if (body.cancel || !body.sendAt) {
      // Delete or mark as sent any future unsent rows for this assignment
      const { error } = await supabase
        .from('scheduled_notifications')
        .delete()
        .eq('user_id', body.userId)
        .eq('assignment_id', body.assignmentId)
        .is('sent_at', null);
      if (error) return cors(new Response(error.message, { status: 500 }));
      return cors(new Response(JSON.stringify({ ok: true, action: 'deleted' }), { status: 200 }));
    }

    // Remove any pending unsent schedules for this assignment to avoid duplicates
    await supabase
      .from('scheduled_notifications')
      .delete()
      .eq('user_id', body.userId)
      .eq('assignment_id', body.assignmentId)
      .is('sent_at', null);

    // Insert new schedule row
    const row = {
      user_id: body.userId,
      assignment_id: body.assignmentId,
      title: body.title ?? 'Reminder',
      body: body.body ?? '',
      send_at: body.sendAt,
      sent_at: null as string | null,
    } as any;
    const { error } = await supabase
      .from('scheduled_notifications')
      .insert(row);
    if (error) return cors(new Response(error.message, { status: 500 }));
    return cors(new Response(JSON.stringify({ ok: true, action: 'inserted' }), { status: 200 }));
  } catch (e) {
    return cors(new Response(`Error: ${e instanceof Error ? e.message : 'unknown'}`, { status: 500 }));
  }
});
