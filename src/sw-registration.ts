// Service worker registration with build-based versioning and update handling
import { appBase, withBase } from '@/base';

declare const __BUILD_ID__: string;

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const base = appBase();
      // No query parameters needed - browser bypasses cache for SW automatically
      const swUrl = withBase('/sw.js');
      
      navigator.serviceWorker.register(swUrl, { scope: base })
        .then(registration => {
          let refreshing = false; // Prevent multiple reloads
          
          // Handle service worker updates with proper reload coordination  
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New SW available - trigger skip waiting
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              });
            }
          });

          // Listen for when new SW takes control
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Reload once when new SW takes control
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });

          // Check for updates on existing registrations
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Proactively check for updates
          registration.update();
        })
        .catch(error => {
          console.warn('Service worker registration failed:', error);
        });
    } catch (e) {
      console.warn('Service worker registration error:', e);
    }
  }
}

registerServiceWorker();
