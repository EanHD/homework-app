import { getRuntimeConfig } from '@/config';

async function api(path: string, init: RequestInit & { json?: any } = {}) {
  const cfg = await getRuntimeConfig();
  const base = cfg.functionsBase;
  if (!base) throw new Error('functionsBase not configured');
  const url = `${base}${path}`;
  const { json, headers, ...rest } = init;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  });
  return res;
}

export async function postSubscribe(payload: { userId: string; endpoint: string; keys: { p256dh: string; auth: string } }) {
  try {
    return await api('/subscribe', { json: payload });
  } catch {
    // no-op
  }
}

export async function deleteSubscription(payload: { userId: string; endpoint: string }) {
  try {
    const cfg = await getRuntimeConfig();
    const base = cfg.functionsBase;
    if (!base) throw new Error('functionsBase not configured');
    const res = await fetch(`${base}/subscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res;
  } catch {
    // no-op
  }
}

export async function postSchedule(payload: { userId: string; assignmentId: string; title?: string; body?: string; sendAt?: string; cancel?: boolean; url?: string }) {
  try {
    return await api('/schedule', { json: payload });
  } catch {
    // no-op
  }
}

export type PushSubscriptionJSON = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export function getSubscriptionJSON(sub: PushSubscription | null): PushSubscriptionJSON | null {
  if (!sub) return null;
  try {
    const json = sub.toJSON() as any;
    return { endpoint: json.endpoint, keys: json.keys };
  } catch {
    return null;
  }
}
