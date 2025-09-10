import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore, isWithinQuietHours } from '@/store/settings';

const STORAGE_KEY = 'homework-buddy/settings/v1';

describe('settings store', () => {
  beforeEach(() => {
    // Reset store and storage
    useSettingsStore.persist?.clearStorage?.();
    useSettingsStore.setState({
      notificationsEnabled: true,
      reminderOffset: 30,
      quietHours: { enabled: false, start: '22:00', end: '07:00' },
      theme: 'light',
      fontScale: 'normal',
    });
    localStorage.removeItem(STORAGE_KEY);
  });

  it('has sensible defaults and persists changes', () => {
    const s1 = useSettingsStore.getState();
    expect(s1.notificationsEnabled).toBe(true);
    expect(s1.reminderOffset).toBe(30);
    expect(s1.quietHours.enabled).toBe(false);

    useSettingsStore.getState().setNotificationsEnabled(false);
    useSettingsStore.getState().setReminderOffset(60);
    useSettingsStore.getState().setQuietHoursEnabled(true);
    useSettingsStore.getState().setQuietHoursRange('21:30', '06:45');
    useSettingsStore.getState().setTheme('dark');
    useSettingsStore.getState().setFontScale('large');

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw!);
    const json = persisted.state ?? persisted; // zustand persist stores under .state
    expect(json.notificationsEnabled).toBe(false);
    expect(json.reminderOffset).toBe(60);
    expect(json.quietHours).toEqual({ enabled: true, start: '21:30', end: '06:45' });
    expect(json.theme).toBe('dark');
    expect(json.fontScale).toBe('large');
  });

  it('quiet hours helper handles midnight wrap correctly', () => {
    // Simple window 22:00–07:00
    expect(isWithinQuietHours('22:00', '22:00', '07:00')).toBe(true);
    expect(isWithinQuietHours('23:59', '22:00', '07:00')).toBe(true);
    expect(isWithinQuietHours('00:00', '22:00', '07:00')).toBe(true);
    expect(isWithinQuietHours('06:59', '22:00', '07:00')).toBe(true);
    expect(isWithinQuietHours('07:00', '22:00', '07:00')).toBe(false);
    expect(isWithinQuietHours('21:59', '22:00', '07:00')).toBe(false);

    // Non-wrapping window 09:00–17:00
    expect(isWithinQuietHours('08:59', '09:00', '17:00')).toBe(false);
    expect(isWithinQuietHours('09:00', '09:00', '17:00')).toBe(true);
    expect(isWithinQuietHours('12:00', '09:00', '17:00')).toBe(true);
    expect(isWithinQuietHours('17:00', '09:00', '17:00')).toBe(false);
  });
});
