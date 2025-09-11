/**
 * Supabase Edge Function: send-notifications (cron)
 * @verify_jwt false
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webpush from "https://deno.land/x/webpush@v1.2.0/mod.ts";
import { corsify, preflight } from "../_shared/cors.ts";

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

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

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

    for (const row of (rows || []) as SchedRow[]) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint,p256dh,auth')
        .eq('user_id', row.user_id);
      const payload = JSON.stringify({
        title: row.title,
        body: row.body,
        assignmentId: row.assignment_id,
        url: row.url ?? '/homework-app/#/main',
      });

      let anySent = false;
      for (const sub of subs || []) {
        const pushSub = {
          endpoint: (sub as any).endpoint,
          keys: { p256dh: (sub as any).p256dh, auth: (sub as any).auth },
        } as webpush.PushSubscription;

        try {
          await webpush.sendNotification(pushSub, payload);
          anySent = true;
          delivered++;
        } catch (e) {
          const msg = String(e?.message || e);
          if (msg.includes('410') || msg.includes('404')) {
            await supabase.from('push_subscriptions').delete().match({ endpoint: (sub as any).endpoint });
            removed++;
          } else {
            errors++;
          }
        }
      }

      if (anySent) {
        await supabase
          .from('scheduled_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', row.id);
      }
    }

    const report = { processed, successes: delivered, pruned: removed, errors };
    try { console.log(`[send-notifications] processed=${processed} successes=${delivered} pruned=${removed} errors=${errors}`); } catch {}
    return corsify(req, new Response(JSON.stringify(report), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    return corsify(req, new Response(`Error: ${e instanceof Error ? e.message : 'unknown'}`, { status: 500 }));
  }
});
