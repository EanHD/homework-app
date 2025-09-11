import { useEffect, useState } from 'react';
import { Group, Switch, Text, Tooltip } from '@mantine/core';

export default function NotificationsToggle() {
  const supported = typeof window !== 'undefined' && 
    'Notification' in window && 
    window.isSecureContext;
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (!supported) return;
    // Reflect external changes (some browsers allow changes in settings)
    const id = setInterval(() => {
      if (Notification.permission !== permission) setPermission(Notification.permission);
    }, 1000);
    return () => clearInterval(id);
  }, [supported, permission]);

  if (!supported) {
    const message = typeof window !== 'undefined' && !window.isSecureContext
      ? 'Notifications require HTTPS. Please use a secure connection.'
      : 'Notifications are not supported in this browser.';
    return (
      <Text size="sm" c="dimmed">{message}</Text>
    );
  }

  const enabled = permission === 'granted';

  const request = async () => {
    if (!supported) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch {
      // ignore
    }
  };

  return (
    <Group gap="sm">
      <Switch
        checked={enabled}
        onChange={(e) => {
          const next = e.currentTarget.checked;
          if (next && permission !== 'granted') request();
        }}
        aria-label="Enable notifications"
      />
      {permission === 'default' && (
        <Text size="sm" c="dimmed">Click to enable homework reminders</Text>
      )}
      {permission === 'denied' && (
        <Tooltip 
          label="To enable: Click the 🔒 icon in your address bar → Site settings → Notifications → Allow" 
          withArrow
          multiline
          w={300}
        >
          <Text size="sm" c="red.6">Permission denied</Text>
        </Tooltip>
      )}
      {permission === 'granted' && (
        <Text size="sm" c="teal.7">Notifications enabled</Text>
      )}
    </Group>
  );
}

