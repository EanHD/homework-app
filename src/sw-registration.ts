// Minimal service worker registration using workbox-window when available
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('/homework-app/sw.js', { scope: '/homework-app/' });
    } catch (e) {
      // no-op
    }
  }
}

registerServiceWorker();
