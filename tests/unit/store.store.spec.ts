import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '@/store/app';
import { toggleDone } from '@/store/repository';

// Mock persistence to keep state in-memory for repository operations
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

describe('AppStore reactivity: toggleDone', () => {
  beforeEach(() => {
    // reset store (do not replace to keep methods)
    useAppStore.setState({ classes: [], assignments: [], lastChangeToken: 0 }, false);
    memoryState = { classes: [], assignments: [], preferences: {} };
  });

  it('sets and unsets completedAt and completed; selectors recompute', async () => {
    const now = new Date('2025-03-10T12:00:00Z');
    const a1 = { id: 'a1', title: 'T', classId: 'c1', dueAt: now.toISOString(), completed: false, notes: null, remindAtMinutes: null };
    memoryState.assignments = [a1];
    useAppStore.setState({ assignments: [a1 as any] }, false);

    // toggle to done
    const persisted1 = await toggleDone('a1');
    useAppStore.setState({ assignments: persisted1.assignments as any }, false);
    let s = useAppStore.getState();
    expect(s.assignments[0].completed).toBe(true);
    expect(s.assignments[0].completedAt).toBeTruthy();
    // progress should show 1/1
    const p1 = s.countTodayProgress(now);
    expect(p1.total).toBe(1);
    expect(p1.completed).toBe(1);
    expect(p1.pct).toBe(100);

    // toggle back to not done
    const persisted2 = await toggleDone('a1');
    useAppStore.setState({ assignments: persisted2.assignments as any }, false);
    s = useAppStore.getState();
    expect(s.assignments[0].completed).toBe(false);
    expect(s.assignments[0].completedAt).toBeNull();
    const p2 = s.countTodayProgress(now);
    expect(p2.total).toBe(1);
    expect(p2.completed).toBe(0);
    expect(p2.pct).toBe(0);
  });
});
