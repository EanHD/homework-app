import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// T007: Selector tests skeleton
// Imports will fail until selectors are implemented in T009
import {
  getAssignmentsForToday,
  getIncompleteAssignmentIds,
  byDueDateAscending,
  progressPercent,
  streakDays,
} from '@/store/selectors';

type Assignment = {
  id: string;
  title: string;
  classId: string;
  dueAt: string; // ISO
  completed?: boolean;
};

type State = {
  classes: { id: string; name: string }[];
  assignments: Assignment[];
};

const makeId = (n: number) => `id-${n}`;

describe('Selectors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-10T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('getAssignmentsForToday returns only items due today', () => {
    const state: State = {
      classes: [{ id: 'c1', name: 'Math' }],
      assignments: [
        { id: makeId(1), title: 'Today A', classId: 'c1', dueAt: '2025-03-10T18:00:00Z' },
        { id: makeId(2), title: 'Tomorrow', classId: 'c1', dueAt: '2025-03-11T09:00:00Z' },
      ],
    };
    const today = getAssignmentsForToday(state);
    expect(today.map(a => a.id)).toContain('id-1');
    expect(today.map(a => a.id)).not.toContain('id-2');
  });

  it('getIncompleteAssignmentIds returns only incomplete IDs', () => {
    const state: State = {
      classes: [],
      assignments: [
        { id: makeId(1), title: 'A', classId: 'c', dueAt: '2025-03-12T12:00:00Z' },
        { id: makeId(2), title: 'B', classId: 'c', dueAt: '2025-03-12T13:00:00Z', completed: true },
      ],
    };
    const ids = getIncompleteAssignmentIds(state);
    expect(ids).toEqual(['id-1']);
  });

  it('byDueDateAscending sorts by dueAt', () => {
    const list: Assignment[] = [
      { id: makeId(2), title: 'B', classId: 'c', dueAt: '2025-03-12T13:00:00Z' },
      { id: makeId(1), title: 'A', classId: 'c', dueAt: '2025-03-12T12:00:00Z' },
    ];
    const sorted = byDueDateAscending(list);
    expect(sorted[0].id).toBe('id-1');
  });

  it('progressPercent returns 0–100 based on today completions', () => {
    const state: State = {
      classes: [],
      assignments: [
        { id: makeId(1), title: 'A', classId: 'c', dueAt: '2025-03-10T10:00:00Z', completed: true },
        { id: makeId(2), title: 'B', classId: 'c', dueAt: '2025-03-10T15:00:00Z', completed: false },
        { id: makeId(3), title: 'C', classId: 'c', dueAt: '2025-03-11T10:00:00Z', completed: false },
      ],
    };
    const p = progressPercent(state);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(100);
  });

  it('streakDays counts consecutive days with ≥1 completion', () => {
    const state: State = {
      classes: [],
      assignments: [
        { id: makeId(1), title: 'Prev day done', classId: 'c', dueAt: '2025-03-09T12:00:00Z', completed: true },
        { id: makeId(2), title: 'Today done', classId: 'c', dueAt: '2025-03-10T12:00:00Z', completed: true },
        { id: makeId(3), title: 'Future', classId: 'c', dueAt: '2025-03-11T12:00:00Z', completed: false },
      ],
    };
    const s = streakDays(state);
    expect(s).toBeGreaterThanOrEqual(2);
  });
});

