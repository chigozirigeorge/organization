export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return 'denied';
  }
}

export async function showLocalNotification(title: string, options?: NotificationOptions) {
  // Prefer service worker notifications when available (PWA installed / background)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        return reg.showNotification(title, options || {});
      }
    }

    // Fall back to the Notification API in-page
    if ('Notification' in window && Notification.permission === 'granted') {
      // eslint-disable-next-line no-new
      new Notification(title, options || {});
    }
  } catch (e) {
    console.error('Failed to show notification', e);
  }
}

export async function ensureAndNotify(title: string, options?: NotificationOptions) {
  const perm = await requestNotificationPermission();
  if (perm === 'granted') {
    await showLocalNotification(title, options);
  }
}
