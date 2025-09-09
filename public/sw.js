/* Simple app-shell service worker with offline support and basic notification click handling */
const CACHE_NAME = 'hb-app-shell-v2';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const base = new URL(self.registration.scope).pathname; // e.g., '/homework-app/' or '/'
    const shell = [base, base + 'index.html', base + 'manifest.webmanifest', base + 'icon.svg', base + 'maskable.svg'];
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(shell);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? undefined : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

// Cache strategy: navigation requests → network-first with offline fallback
// Static assets (same-origin) → stale-while-revalidate
self.addEventListener('fetch', (event) => {
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => 'focus' in c);
      if (existing && 'focus' in existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});
