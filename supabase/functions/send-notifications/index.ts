/**
 * Supabase Edge Function: send-notifications (cron)
 * @verify_jwt false
 */
export const config = { verify_jwt: false } as const;
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsify, preflight } from "../_shared/cors.ts";
import { sendPushNoPayload } from "../_shared/webpush.ts";

type SchedRow = {
  id: string;
  user_id: string;
  assignment_id: string;
  title: string;
  body: string;
  send_at: string;
  sent_at: string | null;
  url?: string | null;
};

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return corsify(req, pf);
  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC');
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE');
  const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:you@example.com';
  if (!PROJECT_URL || !SERVICE_ROLE_KEY || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    return corsify(req, new Response('Missing env', { status: 500 }));
  }
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    const { data: rows, error } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .is('sent_at', null)
      .lte('send_at', new Date().toISOString())
      .limit(500);
    if (error) return corsify(req, new Response(error.message, { status: 500 }));

    const processed = (rows || []).length;
    let delivered = 0;
    let removed = 0;
    let errors = 0;
    const statusCounts: Record<string, number> = {};
    let lastStatus = 0;
    let lastText = '';
    let lastErrorMsg = '';

    for (const row of (rows || []) as SchedRow[]) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint,p256dh,auth')
        .eq('user_id', row.user_id);
      let anySent = false;
      for (const sub of subs || []) {
        const endpoint = (sub as any).endpoint as string;
        try {
          const res = await sendPushNoPayload(endpoint, {
            vapidPublic: VAPID_PUBLIC,
            vapidPrivate: VAPID_PRIVATE,
            subject: VAPID_SUBJECT,
            ttl: 3600,
          });
          lastStatus = res.status;
          try { lastText = await res.text(); } catch {}
          const key = String(res.status);
          statusCounts[key] = (statusCounts[key] || 0) + 1;
          if (res.status === 404 || res.status === 410) {
            await supabase.from('push_subscriptions').delete().match({ endpoint });
            removed++;
          } else if (res.ok) {
            anySent = true;
            delivered++;
          } else {
            errors++;
          }
        } catch (e) {
          errors++;
          try { lastErrorMsg = e instanceof Error ? e.message : String(e); } catch {}
        }
      }

      if (anySent) {
        await supabase
          .from('scheduled_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', row.id);
      }
    }

    // Compute a short fingerprint of VAPID public for diagnostics
    let vapidHash = '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(VAPID_PUBLIC);
      const digest = await crypto.subtle.digest('SHA-256', data);
      const bytes = Array.from(new Uint8Array(digest));
      const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
      vapidHash = hex.slice(0, 12);
    } catch {}

    const report = {
      processed,
      successes: delivered,
      pruned: removed,
      errors,
      statusCounts,
      lastStatus,
      lastText: (lastText || '').slice(0, 200),
      vapidPublicLen: (VAPID_PUBLIC || '').length,
      vapidPublicHash: vapidHash,
      lastError: lastErrorMsg ? String(lastErrorMsg).slice(0, 200) : undefined,
    };
    try { console.log(`[send-notifications] processed=${processed} successes=${delivered} pruned=${removed} errors=${errors}`); } catch {}
    return corsify(req, new Response(JSON.stringify(report), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    return corsify(req, new Response(`Error: ${e instanceof Error ? e.message : 'unknown'}`, { status: 500 }));
  }
});
