// Minimal service worker registration using dynamic base
import { appBase, withBase } from '@/base';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const base = appBase();
      navigator.serviceWorker.register(withBase('/sw.js'), { scope: base });
    } catch (e) {
      // no-op
    }
  }
}

registerServiceWorker();
