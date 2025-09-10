// Supabase Edge Function: send-notifications (cron)
// Query unsent due rows, send Web Push to each user's subscriptions, mark sent, clean up invalid subs

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webpush from "https://deno.land/x/webpush@v1.2.0/mod.ts";

function cors(resp: Response) {
  const headers = new Headers(resp.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'content-type, authorization');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return new Response(resp.body, { status: resp.status, headers });
}

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
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC');
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE');
  const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:you@example.com';
  if (!PROJECT_URL || !SERVICE_ROLE_KEY || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    return cors(new Response('Missing env', { status: 500 }));
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
    if (error) return cors(new Response(error.message, { status: 500 }));

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
        } as webpush.PushSubscription; // type compatible

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

    const report = { delivered, removedSubscriptions: removed, errors };
    return cors(new Response(JSON.stringify(report), { status: 200 }));
  } catch (e) {
    return cors(new Response(`Error: ${e instanceof Error ? e.message : 'unknown'}`, { status: 500 }));
  }
});

