import { describe, it, expect, vi, beforeEach } from 'vitest';
import { archiveCompletedOlderThan } from '@/store/repository';

let memoryState: any = null;
vi.mock('@/store/persistence', () => {
  return {
    loadState: vi.fn(async () => memoryState),
    saveState: vi.fn(async (s: any) => {
      memoryState = s;
    }),
    __esModule: true,
  };
});

describe('Archive cleanup', () => {
  beforeEach(() => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    const recent = new Date().toISOString();
    memoryState = {
      classes: [],
      assignments: [
        { id: 'old', title: 'Old', classId: 'c', dueAt: recent, completed: true, completedAt: old, archivedAt: null, notes: null, remindAtMinutes: null },
        { id: 'new', title: 'New', classId: 'c', dueAt: recent, completed: true, completedAt: recent, archivedAt: null, notes: null, remindAtMinutes: null },
      ],
      preferences: {},
    };
  });

  it('archives items completed > 90 days ago', async () => {
    await archiveCompletedOlderThan(90);
    expect(memoryState.assignments.find((a: any) => a.id === 'old').archivedAt).toBeTruthy();
    expect(memoryState.assignments.find((a: any) => a.id === 'new').archivedAt).toBeNull();
  });
});

