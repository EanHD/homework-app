import { getRuntimeConfig } from '@/config';
import { base64UrlToUint8Array } from '@/utils/webpush';
import { getSubscriptionJSON, postSubscribe } from '@/services/pushApi';
import { appBase, withBase } from '@/base';

export type EnablePushResult = { reused: boolean; endpoint?: string };

export async function enablePush(userId: string): Promise<EnablePushResult> {
  if (typeof window === 'undefined') return { reused: false };
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return { reused: false };

  // Register service worker under app base
  const reg =
    (await navigator.serviceWorker.getRegistration()) ||
    (await navigator.serviceWorker.register(withBase('/sw.js'), { scope: appBase() }));

  // Ensure permission
  let permission: NotificationPermission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return { reused: false };

  // Try to reuse existing subscription
  let sub = await reg.pushManager.getSubscription();
  let reused = false;

  if (!sub) {
    const cfg = await getRuntimeConfig();
    const publicKey = cfg.vapidPublic as string | undefined;
    const functionsBase = cfg.functionsBase;
    try {
      console.log('[enablePush] runtime config', {
        functionsBase,
        vapidPublicLen: publicKey ? publicKey.length : 0,
      });
    } catch {}
    if (!publicKey) throw new Error('Missing VAPID public key configuration');
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey) as unknown as BufferSource,
    });
    reused = false;
  } else {
    reused = true;
  }

  const json = getSubscriptionJSON(sub);
  if (!json?.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error('Invalid subscription');

  // Log outbound request target for debugging
  try {
    const cfg = await getRuntimeConfig();
    console.log('[enablePush] POST to', `${cfg.functionsBase}/subscribe`);
  } catch {}

  const res = await postSubscribe({ userId, endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } });
  try {
    const text = await res?.clone()?.text();
    console.log('[enablePush] subscribe response', { status: res?.status, ok: res?.ok, body: text });
  } catch {}
  if (!res || !res.ok) throw new Error('Subscribe failed');

  try { console.log(`[enablePush] ${reused ? 'reused' : 'created'} subscription for ${userId}`); } catch {}
  return { reused, endpoint: json.endpoint };
}
