export async function showNotification(title: string, options?: NotificationOptions): Promise<void> {
  // Support both browser and test (jsdom) environments
  if (typeof window === 'undefined') return;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && (reg as any).showNotification) {
        await (reg as any).showNotification(title, options);
        return;
      }
    }
    // No page-level fallback; rely on SW only to display notifications
  } catch {
    // no-op on failure
  }
}
