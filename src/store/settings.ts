import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type QuietHours = {
  enabled: boolean;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

export type SettingsState = {
  notificationsEnabled: boolean;
  reminderOffset: 10 | 30 | 60; // minutes before due
  quietHours: QuietHours;
  theme: 'light' | 'dark';
  fontScale: 'normal' | 'large';
};

export type SettingsActions = {
  setNotificationsEnabled: (v: boolean) => void;
  setReminderOffset: (minutes: 10 | 30 | 60) => void;
  setQuietHoursEnabled: (v: boolean) => void;
  setQuietHoursRange: (startHHmm: string, endHHmm: string) => void;
  setTheme: (mode: 'light' | 'dark') => void;
  setFontScale: (scale: 'normal' | 'large') => void;
};

export type SettingsStore = SettingsState & SettingsActions;

const DEFAULTS: SettingsState = {
  notificationsEnabled: true,
  reminderOffset: 30,
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  theme: 'light',
  fontScale: 'normal',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setNotificationsEnabled(v) {
        set({ notificationsEnabled: v });
      },

      setReminderOffset(minutes) {
        set({ reminderOffset: minutes });
      },

      setQuietHoursEnabled(v) {
        set((s) => ({ quietHours: { ...s.quietHours, enabled: v } }));
      },

      setQuietHoursRange(startHHmm, endHHmm) {
        set((s) => ({ quietHours: { ...s.quietHours, start: startHHmm, end: endHHmm } }));
      },

      setTheme(mode) {
        set({ theme: mode });
      },

      setFontScale(scale) {
        set({ fontScale: scale });
      },
    }),
    {
      name: 'homework-buddy/settings/v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        notificationsEnabled: s.notificationsEnabled,
        reminderOffset: s.reminderOffset,
        quietHours: s.quietHours,
        theme: s.theme,
        fontScale: s.fontScale,
      }),
    }
  )
);

// Optional helper for quiet-hours checks
export function isWithinQuietHours(
  timeHHmm: string,
  startHHmm: string,
  endHHmm: string
): boolean {
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  };
  const t = toMinutes(timeHHmm);
  const s = toMinutes(startHHmm);
  const e = toMinutes(endHHmm);
  if (s <= e) return t >= s && t < e;
  return t >= s || t < e; // wraps midnight
}

