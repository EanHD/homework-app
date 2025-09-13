import { useEffect, useState } from 'react';
import { Alert, Button, Group, Text } from '@mantine/core';
import { IconInfoCircle, IconX } from '@tabler/icons-react';

function isiOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /iPad|iPhone|iPod/.test(ua);
}

function isStandalone(): boolean {
  try {
    // iOS Safari exposes navigator.standalone; also check display-mode
    const standalone = (navigator as any).standalone === true;
    const displayMode = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    return !!standalone || !!displayMode;
  } catch {
    return false;
  }
}

export default function IosInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('hb_ios_hint_dismissed') === '1';
      if (!dismissed && isiOS() && !isStandalone()) {
        setVisible(true);
      }
    } catch {}
  }, []);

  if (!visible) return null;

  return (
    <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mb="sm" title="Enable notifications on iPhone">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="sm">
            Install this app to your Home Screen to receive push notifications on iOS. Tap the Share button, then
            “Add to Home Screen”. After installing, open the app and Allow notifications.
          </Text>
        </div>
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconX size={14} />}
          onClick={() => {
            try { localStorage.setItem('hb_ios_hint_dismissed', '1'); } catch {}
            setVisible(false);
          }}
        >
          Dismiss
        </Button>
      </Group>
    </Alert>
  );
}

