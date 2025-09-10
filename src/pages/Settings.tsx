import { useRef, useState } from 'react';
import { Button, Card, Group, Select, Stack, Switch, Text, Title, SegmentedControl, Divider, Alert, Badge } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconDownload, IconUpload, IconTrash, IconPlayerPlay, IconRosetteDiscountCheck } from '@tabler/icons-react';
import { useSettingsStore } from '@/store/settings';
import { useAppStore } from '@/store/app';
import { base64UrlToUint8Array } from '@/utils/webpush';
import { getRuntimeConfig } from '@/config';
import { getOrCreateUserId } from '@/utils/userId';
import { postSubscribe, deleteSubscription } from '@/services/pushApi';
import pkg from '../../package.json';
import { saveState } from '@/store/persistence';
import type { State, Class, Assignment } from '@/store/types';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Group justify="space-between" mt="md" mb="xs">
      <Title order={4}>{children}</Title>
    </Group>
  );
}

export default function SettingsPage() {
  // Settings store
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const reminderOffset = useSettingsStore((s) => s.reminderOffset);
  const quietHours = useSettingsStore((s) => s.quietHours);
  const theme = useSettingsStore((s) => s.theme);
  const fontScale = useSettingsStore((s) => s.fontScale);

  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setReminderOffset = useSettingsStore((s) => s.setReminderOffset);
  const setQuietHoursEnabled = useSettingsStore((s) => s.setQuietHoursEnabled);
  const setQuietHoursRange = useSettingsStore((s) => s.setQuietHoursRange);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setFontScale = useSettingsStore((s) => s.setFontScale);

  // App store actions
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const addClass = useAppStore((s) => s.addClass);
  const addAssignment = useAppStore((s) => s.addAssignment);
  const captureUndo = useAppStore((s) => s.captureUndo);
  const performUndo = useAppStore((s) => s.performUndo);
  const loadAll = useAppStore((s) => s.loadAll);

  // File import ref
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission>(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [subEndpoint, setSubEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const ts = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `homework-buddy-backup-${ts}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    notifications.show({ message: 'Exported backup JSON', color: 'blue' });
  };

  const readFileAsText = (file: File): Promise<string> => {
    // Prefer modern File.text(); fallback to FileReader for older environments/tests
    if (typeof (file as any).text === 'function') {
      return (file as any).text();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.readAsText(file);
    });
  };

  const onImport = async (file?: File | null) => {
    try {
      setImporting(true);
      const f = file ?? fileRef.current?.files?.[0];
      if (!f) return;
      const text = await readFileAsText(f);
      const result = await importData(text);
      if (result.success) {
        notifications.show({ message: `Imported ${result.classesAdded} classes, ${result.assignmentsAdded} assignments`, color: 'green' });
      } else {
        notifications.show({ message: result.errors.join('\n') || 'Import failed', color: 'red' });
      }
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onClearAll = async () => {
    if (!confirm('Clear all classes and assignments? You can Undo right after.')) return;
    await captureUndo();
    const next: State = { classes: [], assignments: [], preferences: {} } as unknown as State;
    await saveState(next);
    await loadAll();
    const id = `undo-clear-${Date.now()}`;
    notifications.show({
      id,
      message: (
        <Group justify="space-between">
          <span>All data cleared</span>
          <Button size="xs" variant="light" onClick={async () => { await performUndo(); notifications.update({ id, message: 'Restored', autoClose: 2000 }); }}>Undo</Button>
        </Group>
      ),
      color: 'red',
      autoClose: 10000,
    });
  };

  const onReplayTour = () => {
    // Trigger onboarding again on next render
    useAppStore.setState({ seenOnboarding: false });
    notifications.show({ message: 'Onboarding tour will replay', color: 'blue' });
  };

  const onAddSample = async () => {
    // Minimal sample data
    const math = await addClass({ name: 'Math', emoji: '📐', color: '#4CAF50' });
    const eng = await addClass({ name: 'English', emoji: '📚', color: '#1E88E5' });
    const now = new Date();
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const tomorrow9 = new Date();
    tomorrow9.setDate(tomorrow9.getDate() + 1);
    tomorrow9.setHours(9, 0, 0, 0);
    await addAssignment({ title: 'Finish problem set', classId: math.id, dueAt: in2h, notes: null, remindAtMinutes: 30, completed: false });
    await addAssignment({ title: 'Read chapter 3', classId: eng.id, dueAt: tomorrow9.toISOString(), notes: null, remindAtMinutes: 60, completed: false });
    notifications.show({ message: 'Sample data added', color: 'green' });
  };

  return (
    <Stack gap="lg">
      <Title order={3}>Settings</Title>

      {/* Notifications */}
      <Card withBorder radius="md" p="md">
        <SectionTitle>Notifications</SectionTitle>
        <Stack>
          <Switch
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.currentTarget.checked)}
            label="Enable notifications"
            aria-label="Enable notifications"
          />

          <Group gap="sm">
            <Badge color={perm === 'granted' ? 'green' : perm === 'denied' ? 'red' : 'gray'}>
              Permission: {perm}
            </Badge>
            {subEndpoint && <Badge color="blue">Subscribed</Badge>}
            {!('Notification' in window) && <Badge color="gray">Not supported</Badge>}
          </Group>

          <Group gap="md" wrap="wrap">
            <Button
              onClick={async () => {
                if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
                setBusy(true);
                try {
                  const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('/homework-app/sw.js', { scope: '/homework-app/' }));
                  let permission: NotificationPermission = Notification.permission;
                  if (permission === 'default') permission = await Notification.requestPermission();
                  setPerm(permission);
                  if (permission !== 'granted') return;
                  const cfg = await getRuntimeConfig();
                  const publicKey = cfg.vapidPublic as string | undefined;
                  if (!publicKey) { notifications.show({ message: 'Missing VAPID public key configuration', color: 'red' }); return; }
                  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(publicKey) as unknown as BufferSource });
                  const json = sub.toJSON() as any;
                  setSubEndpoint(json?.endpoint ?? null);
                  await postSubscribe({ userId: getOrCreateUserId(), endpoint: json.endpoint, keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth } });
                  notifications.show({ message: 'Push notifications enabled', color: 'green' });
                } catch (e) {
                  notifications.show({ message: 'Failed to enable push', color: 'red' });
                } finally {
                  setBusy(false);
                }
              }}
              loading={busy}
            >
              Enable push notifications
            </Button>
            <Button
              variant="default"
              onClick={async () => {
                try {
                  const reg = await navigator.serviceWorker.getRegistration();
                  const sub = await reg?.pushManager.getSubscription();
                  const endpoint = sub?.endpoint;
                  await sub?.unsubscribe();
                  setSubEndpoint(null);
                  if (endpoint) await deleteSubscription({ userId: getOrCreateUserId(), endpoint });
                  notifications.show({ message: 'Unsubscribed', color: 'blue' });
                } catch {
                  notifications.show({ message: 'Failed to unsubscribe', color: 'red' });
                }
              }}
            >
              Unsubscribe
            </Button>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              variant="default"
              onClick={async () => {
                try {
                  const now = Date.now() + 60_000;
                  const id = 'test-notification';
                  const { postSchedule } = await import('@/services/pushApi');
                  await postSchedule({ userId: getOrCreateUserId(), assignmentId: id, title: 'Test notification', body: 'This is a test', sendAt: new Date(now).toISOString(), url: '/homework-app/#/main' });
                  notifications.show({ message: 'Test notification scheduled for 60s', color: 'blue' });
                } catch {
                  notifications.show({ message: 'Failed to schedule test', color: 'red' });
                }
              }}
            >
              Send test notification
            </Button>
          </Group>

          <Group wrap="wrap" gap="md">
            <Select
              label="Default reminder offset"
              aria-label="Default reminder offset"
              data={[
                { value: '10', label: '10 minutes before' },
                { value: '30', label: '30 minutes before' },
                { value: '60', label: '1 hour before' },
              ]}
              value={String(reminderOffset)}
              onChange={(v) => v && setReminderOffset(parseInt(v, 10) as 10 | 30 | 60)}
              w={280}
            />
          </Group>

          <Divider my="sm" />

          <Switch
            checked={quietHours.enabled}
            onChange={(e) => setQuietHoursEnabled(e.currentTarget.checked)}
            label="Quiet hours (do not disturb)"
            aria-label="Quiet hours"
          />
          <Group gap="md" wrap="wrap">
            <TimeInput
              label="Start"
              aria-label="Quiet hours start time"
              value={quietHours.start}
              onChange={(event) => setQuietHoursRange(event.currentTarget.value, quietHours.end)}
              disabled={!quietHours.enabled}
            />
            <TimeInput
              label="End"
              aria-label="Quiet hours end time"
              value={quietHours.end}
              onChange={(event) => setQuietHoursRange(quietHours.start, event.currentTarget.value)}
              disabled={!quietHours.enabled}
            />
          </Group>

          <Alert icon={<IconAlertCircle size={16} />} variant="light" color="gray">
            Reminders require the app to be open due to platform limitations. Quiet hours suppress reminders that would occur within the selected window, including across midnight.
          </Alert>
        </Stack>
      </Card>

      {/* Appearance */}
      <Card withBorder radius="md" p="md">
        <SectionTitle>Appearance</SectionTitle>
        <Stack>
          <Switch
            checked={theme === 'dark'}
            onChange={(e) => setTheme(e.currentTarget.checked ? 'dark' : 'light')}
            label="Dark mode"
            aria-label="Dark mode"
          />
          <SegmentedControl
            aria-label="Font size"
            value={fontScale}
            onChange={(v) => setFontScale(v as 'normal' | 'large')}
            data={[
              { label: 'Normal', value: 'normal' },
              { label: 'Large', value: 'large' },
            ]}
          />
        </Stack>
      </Card>

      {/* Data */}
      <Card withBorder radius="md" p="md">
        <SectionTitle>Data</SectionTitle>
        <Group gap="md" wrap="wrap">
          <Button leftSection={<IconDownload size={16} />} onClick={onExport} aria-label="Export JSON">
            Export JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => onImport(e.currentTarget.files?.[0])}
          />
          <Button
            leftSection={<IconUpload size={16} />}
            variant="default"
            loading={importing}
            onClick={() => fileRef.current?.click()}
            aria-label="Import JSON"
          >
            Import JSON
          </Button>

          <Button color="red" leftSection={<IconTrash size={16} />} onClick={onClearAll} aria-label="Clear all data">
            Clear all
          </Button>
        </Group>
      </Card>

      {/* Onboarding */}
      <Card withBorder radius="md" p="md">
        <SectionTitle>Onboarding</SectionTitle>
        <Group gap="md" wrap="wrap">
          <Button leftSection={<IconPlayerPlay size={16} />} variant="default" onClick={onReplayTour} aria-label="Replay tour">
            Replay tour
          </Button>
          <Button leftSection={<IconRosetteDiscountCheck size={16} />} onClick={onAddSample} aria-label="Add sample data">
            Add sample data
          </Button>
        </Group>
      </Card>

      {/* About */}
      <Card withBorder radius="md" p="md">
        <SectionTitle>About</SectionTitle>
        <Text>Homework Buddy</Text>
        <Text size="sm" c="dimmed">Version {pkg.version}</Text>
        <Text size="sm" mt="xs">Made with ❤️ by Ean</Text>
      </Card>
    </Stack>
  );
}
