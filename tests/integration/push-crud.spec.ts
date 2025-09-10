import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Keep persistence in-memory (hoisted mocks need to be declared before imports)
let memoryState: any = { classes: [], assignments: [], preferences: {} };
vi.mock('@/store/persistence', () => ({
  loadState: vi.fn(async () => memoryState),
  saveState: vi.fn(async (s: any) => { memoryState = s; }),
  __esModule: true,
}));

// Mock push API
const postSchedule = vi.fn(async () => ({ ok: true }));
vi.mock('@/services/pushApi', () => ({
  postSchedule,
  __esModule: true,
}));

// Fix user id generator
vi.mock('@/utils/userId', () => ({ getOrCreateUserId: () => 'test-user', __esModule: true }));

import { useAppStore } from '@/store/app';
import { useSettingsStore } from '@/store/settings';

describe('push scheduling on CRUD', () => {
  const baseNow = new Date('2025-05-01T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseNow);
    // reset stores without replacing methods
    useAppStore.setState({ classes: [], assignments: [], lastChangeToken: 0 }, false);
    useSettingsStore.setState({
      notificationsEnabled: true,
      reminderOffset: 30,
      quietHours: { enabled: false, start: '22:00', end: '07:00' },
      theme: 'light',
      fontScale: 'normal',
    } as any, false);
    memoryState = { classes: [], assignments: [], preferences: {} };
    postSchedule.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules on addAssignment when reminder present', async () => {
    const dueAt = new Date(baseNow.getTime() + 2 * 60 * 60 * 1000).toISOString(); // +2h
    const a = await useAppStore.getState().addAssignment({
      title: 'Test A',
      classId: 'c1',
      dueAt,
      notes: null,
      remindAtMinutes: 15,
      completed: false,
    } as any);
    expect(a).toBeTruthy();
    expect(postSchedule).toHaveBeenCalledTimes(1);
    const call = postSchedule.mock.calls[0][0];
    expect(call.userId).toBe('test-user');
    expect(call.assignmentId).toBe(a.id);
    // sendAt should be dueAt - 15min (but not earlier than now)
    const expected = new Date(new Date(dueAt).getTime() - 15 * 60_000).toISOString();
    expect(call.sendAt.startsWith(expected.slice(0, 16))).toBe(true);
  });

  it('reschedules on updateAssignment and cancels when no reminder', async () => {
    const dueAt = new Date(baseNow.getTime() + 60 * 60 * 1000).toISOString(); // +1h
    const a = await useAppStore.getState().addAssignment({
      title: 'Test B',
      classId: 'c1',
      dueAt,
      notes: null,
      remindAtMinutes: 30,
      completed: false,
    } as any);
    postSchedule.mockClear();

    // update dueAt and reminder
    const newDue = new Date(baseNow.getTime() + 90 * 60 * 1000).toISOString(); // +90m
    await useAppStore.getState().updateAssignment({ id: a.id, dueAt: newDue, remindAtMinutes: 10 });
    expect(postSchedule).toHaveBeenCalledTimes(1);
    let call = postSchedule.mock.calls[0][0];
    const expected = new Date(new Date(newDue).getTime() - 10 * 60_000).toISOString();
    expect(call.sendAt.startsWith(expected.slice(0, 16))).toBe(true);

    // remove reminder → cancel
    postSchedule.mockClear();
    await useAppStore.getState().updateAssignment({ id: a.id, remindAtMinutes: null as any });
    expect(postSchedule).toHaveBeenCalledTimes(1);
    call = postSchedule.mock.calls[0][0];
    expect(call.cancel).toBe(true);
  });

  it('cancels on deleteAssignment', async () => {
    const dueAt = new Date(baseNow.getTime() + 60 * 60 * 1000).toISOString();
    const a = await useAppStore.getState().addAssignment({
      title: 'Test C',
      classId: 'c1',
      dueAt,
      notes: null,
      remindAtMinutes: 5,
      completed: false,
    } as any);
    postSchedule.mockClear();
    await useAppStore.getState().deleteAssignment(a.id);
    expect(postSchedule).toHaveBeenCalledTimes(1);
    const call = postSchedule.mock.calls[0][0];
    expect(call.assignmentId).toBe(a.id);
    expect(call.cancel).toBe(true);
  });
});
