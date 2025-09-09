// Minimal service worker registration using workbox-window when available
import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox(`${import.meta.env.BASE_URL}sw.js`);
    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        // First install
        // console.log('Service worker activated');
      }
    });
    wb.register();
  }
}

// Auto-register by default
registerServiceWorker();
