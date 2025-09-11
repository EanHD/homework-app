/* Simple app-shell service worker with offline support and basic notification click handling */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope & typeof globalThis;
declare const __BUILD_ID__: string;

const CACHE_NAME = `hb-app-shell-${__BUILD_ID__}`;

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil((async () => {
    const base = new URL(self.registration.scope).pathname; // e.g., '/homework-app/' or '/'
    const shell = [base, base + 'index.html', base + 'manifest.webmanifest', base + 'icon.svg', base + 'maskable.svg'];
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(shell);
    // Don't skip waiting automatically - wait for message from page
  })());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? undefined : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

// Cache strategy: navigation requests → network-first with offline fallback
// Static assets (same-origin) → stale-while-revalidate
self.addEventListener('fetch', (event: FetchEvent) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() => {
          const base = new URL(self.registration.scope).pathname;
          return caches.match(base + 'index.html');
        })
    );
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});

// Handle incoming Web Push messages
self.addEventListener('push', (event: PushEvent) => {
  try {
    const data = event.data && event.data.json ? event.data.json() : {};
    const title = data.title || 'Homework Buddy';
    const base = new URL(self.registration.scope).pathname; // '/homework-app/' or '/'
    const options = {
      body: data.body,
      data,
      icon: base + 'icon.svg',
      badge: base + 'maskable.svg',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // ignore malformed payloads
  }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients: readonly WindowClient[]) => {
      const data = (event.notification && event.notification.data) || {};
      const base = new URL(self.registration.scope).pathname || '/';
      const url = (data && data.url) || (base + '#/main');
      for (const c of clients) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// Handle messages from page (for update coordination)
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
