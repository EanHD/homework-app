/**
 * Supabase Edge Function: send-notifications (cron)
 * @verify_jwt false
 */
export const config = { verify_jwt: false } as const;
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsify, preflight } from "../_shared/cors.ts";
import webpush from 'npm:web-push@3.6.7';

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
  const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC') || '';
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE') || '';
  const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:you@example.com';
  if (!PROJECT_URL || !SERVICE_ROLE_KEY || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    return corsify(req, new Response(JSON.stringify({ ok: false, error: 'Missing env (VAPID_PUBLIC/PRIVATE, PROJECT_URL, SERVICE_ROLE_KEY)' }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
  // Configure web-push with standardized envs
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    // Optional direct delivery payload for diagnostics/testing
    let direct: { subscriptions?: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>; message?: { title?: string; body?: string } } | null = null;
    try { direct = await req.json(); } catch {}

    const statusCounts: Record<string, number> = {};
    const failures: Array<{ endpoint: string; statusCode?: number; body?: string }> = [];
    let processed = 0;
    let delivered = 0;
    let removed = 0;
    let errors = 0;

    if (direct && Array.isArray(direct.subscriptions)) {
      for (const sub of direct.subscriptions) {
        processed++;
        try {
          const res = await webpush.sendNotification(sub as any, direct.message ? JSON.stringify(direct.message) : undefined);
          const sc = (res as any)?.statusCode ?? 0;
          const text = (res as any)?.body ? String((res as any).body) : '';
          statusCounts[String(sc)] = (statusCounts[String(sc)] || 0) + 1;
          if (sc === 201) {
            delivered++;
          } else if (sc === 404 || sc === 410) {
            removed++;
          } else {
            errors++;
            failures.push({ endpoint: sub.endpoint, statusCode: sc, body: text.slice(0, 200) });
          }
        } catch (e) {
          errors++;
          failures.push({ endpoint: sub.endpoint, body: e instanceof Error ? e.message : String(e) });
        }
      }
    } else {
      const { data: rows, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .is('sent_at', null)
        .lte('send_at', new Date().toISOString())
        .limit(500);
      if (error) return corsify(req, new Response(error.message, { status: 500 }));

      for (const row of (rows || []) as SchedRow[]) {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint,p256dh,auth')
          .eq('user_id', row.user_id);
        let anySent = false;
        for (const sub of subs || []) {
          const endpoint = (sub as any).endpoint as string;
          try {
            const payload = (row.title || row.body) ? JSON.stringify({ title: row.title, body: row.body, url: row.url || null }) : undefined;
            processed++;
            const res = await webpush.sendNotification({ endpoint, keys: { p256dh: (sub as any).p256dh, auth: (sub as any).auth } } as any, payload);
            const sc = (res as any)?.statusCode ?? 0;
            const text = (res as any)?.body ? String((res as any).body) : '';
            statusCounts[String(sc)] = (statusCounts[String(sc)] || 0) + 1;
            if (sc === 201) {
              anySent = true;
              delivered++;
            } else if (sc === 404 || sc === 410) {
            await supabase.from('push_subscriptions').delete().match({ endpoint });
            removed++;
          } else {
              errors++;
              failures.push({ endpoint, statusCode: sc, body: text.slice(0, 200) });
          }
        } catch (e) {
          errors++;
          failures.push({ endpoint, body: e instanceof Error ? e.message : String(e) });
        }
      }

      if (anySent) {
        await supabase
          .from('scheduled_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', row.id);
      }
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
      vapidPublicLen: (VAPID_PUBLIC || '').length,
      vapidPrivateLen: (VAPID_PRIVATE || '').length,
      vapidPublicHash: vapidHash,
      failures,
    };
    try { console.log(`[send-notifications] processed=${processed} successes=${delivered} pruned=${removed} errors=${errors}`); } catch {}
    return corsify(req, new Response(JSON.stringify(report), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    return corsify(req, new Response(`Error: ${e instanceof Error ? e.message : 'unknown'}`, { status: 500 }));
  }
});
