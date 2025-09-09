import { useEffect, useState } from 'react';
import { Group, Switch, Text, Tooltip } from '@mantine/core';

export default function NotificationsToggle() {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
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
    return (
      <Text size="sm" c="dimmed">Notifications are not supported in this browser.</Text>
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
        <Tooltip label="Enable notifications in your browser settings" withArrow>
          <Text size="sm" c="red.6">Permission denied</Text>
        </Tooltip>
      )}
      {permission === 'granted' && (
        <Text size="sm" c="teal.7">Notifications enabled</Text>
      )}
    </Group>
  );
}

