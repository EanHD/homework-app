/* Simple app-shell service worker with offline support and basic notification click handling */

/// <reference lib="webworker" />

// Service Worker TypeScript declarations
const sw = self as unknown as ServiceWorkerGlobalScope;
declare const __BUILD_ID__: string;

const CACHE_NAME = `hb-app-shell-${__BUILD_ID__}`;

sw.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const base = new URL(sw.registration.scope).pathname; // e.g., '/homework-app/' or '/'
    const shell = [base, base + 'index.html', base + 'manifest.webmanifest', base + 'icon.svg', base + 'maskable.svg'];
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(shell);
    // Don't skip waiting automatically - wait for message from page
  })());
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? undefined : caches.delete(k)))))
      .then(() => sw.clients.claim())
  );
});

// Cache strategy: navigation requests → network-first with offline fallback
// Static assets (same-origin) → stale-while-revalidate
sw.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(async () => {
          const base = new URL(sw.registration.scope).pathname;
          const cached = await caches.match(base + 'index.html');
          return cached || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(async (cached) => {
        const fresh = fetch(req).catch(() => cached || new Response('Offline', { status: 503 }));
        if (cached) return cached;
        return fresh;
      })
    );
  }
});

// Handle push notification
sw.addEventListener('push', (event) => {
  // Some platforms (or our server) may send an empty push to trigger SW logic.
  // Always show a reasonable default notification when no payload is provided.
  let payload: any = null;
  try {
    // json() is synchronous in PushMessageData
    payload = event.data ? event.data.json?.() ?? null : null;
  } catch {
    payload = null;
  }

  const basePath = new URL(sw.registration.scope).pathname; // e.g. '/homework-app/' or '/'
  const title = (payload && (payload.title as string)) || 'Homework Buddy';
  const body = (payload && (payload.body as string)) || 'You have a homework reminder.';
  const tag = (payload && (payload.tag as string)) || 'homework';

  const options: NotificationOptions = {
    body,
    icon: basePath + 'icon.svg',
    badge: basePath + 'maskable.svg',
    tag,
    requireInteraction: false,
    data: (payload && (payload.data as any)) || {},
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

// Handle notification click
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || new URL(sw.registration.scope).origin + new URL(sw.registration.scope).pathname;

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing client
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (sw.clients.openWindow) return sw.clients.openWindow(urlToOpen);
    })
  );
});

// Handle service worker update message
sw.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});
