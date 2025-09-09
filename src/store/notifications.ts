export async function showNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, options);
        return;
      }
    }
    // Fallback to page-level Notification
    // eslint-disable-next-line no-new
    new Notification(title, options);
  } catch {
    // no-op on failure
  }
}

