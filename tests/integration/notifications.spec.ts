import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore } from '@/store/store';
import { createScheduler } from '@/store/scheduler';
import { useSettingsStore } from '@/store/settings';

// Mock showNotification to track calls
vi.mock('@/store/notifications', () => ({
  showNotification: vi.fn(async () => {})
}));
import { showNotification } from '@/store/notifications';

describe('scheduler respects settings', () => {
  beforeEach(() => {
    // Ensure Notification API exists and is granted
    // @ts-ignore
    global.Notification = { permission: 'granted' } as any;
    // reset settings
    useSettingsStore.setState({
      notificationsEnabled: true,
      reminderOffset: 30,
      quietHours: { enabled: false, start: '22:00', end: '07:00' },
      theme: 'light',
      fontScale: 'normal',
    });
  });

  it('does not schedule or fire when notifications are disabled', () => {
    useSettingsStore.getState().setNotificationsEnabled(false);
    const store = createStore({
      assignments: [
        {
          id: 'a1',
          title: 'Immediate',
          classId: 'c1',
          dueAt: new Date(Date.now() - 60_000).toISOString(), // past, would trigger now
          completed: false,
          notes: null,
          remindAtMinutes: 0,
        } as any,
      ],
      classes: [{ id: 'c1', name: 'Test', color: '#000', emoji: '🧪' } as any],
    });
    const scheduler = createScheduler(store);
    scheduler.checkNow();
    expect(showNotification).not.toHaveBeenCalled();
  });
});
