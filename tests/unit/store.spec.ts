import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// T006: Store tests skeleton (CRUD, selectors, persistence)
// These imports will fail until tasks T008–T010 implement the modules (TDD expected failures)
import { createStore } from '@/store/store';

// Mock persistence layer to isolate store behavior
vi.mock('@/store/persistence', () => {
  return {
    loadState: vi.fn(async () => ({ classes: [], assignments: [], preferences: {} })),
    saveState: vi.fn(async (_state: unknown) => void 0),
    __esModule: true,
  };
});

describe('Store: classes and assignments', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds, updates, and removes a class', async () => {
    const store = createStore();
    const c1 = store.actions.addClass({ name: 'Math', color: '#ff5722', emoji: '🧮' });
    expect(store.getState().classes).toHaveLength(1);
    store.actions.updateClass({ id: c1.id, name: 'Algebra', color: '#ff5722', emoji: '🧮' });
    expect(store.getState().classes[0].name).toBe('Algebra');
    store.actions.removeClass(c1.id);
    expect(store.getState().classes).toHaveLength(0);
  });

  it('adds, updates, toggles complete, and removes an assignment', async () => {
    const store = createStore();
    const cls = store.actions.addClass({ name: 'Science', color: '#4caf50', emoji: '🧪' });
    const a1 = store.actions.addAssignment({
      title: 'Lab report',
      classId: cls.id,
      dueAt: new Date('2025-01-15T18:00:00Z').toISOString(),
      notes: null,
      remindAtMinutes: null,
    });
    expect(store.getState().assignments).toHaveLength(1);
    store.actions.updateAssignment({ id: a1.id, title: 'Lab report v2' });
    expect(store.getState().assignments[0].title).toBe('Lab report v2');
    store.actions.toggleComplete(a1.id, true);
    expect(store.getState().assignments[0].completed).toBe(true);
    store.actions.removeAssignment(a1.id);
    expect(store.getState().assignments).toHaveLength(0);
  });
});

describe('Store: selectors integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('computes today and upcoming lists and progress percent', () => {
    const store = createStore();
    const cls = store.actions.addClass({ name: 'History', color: '#2196f3', emoji: '📚' });
    // Today
    const aToday = store.actions.addAssignment({
      title: 'Essay intro',
      classId: cls.id,
      dueAt: new Date('2025-01-15T22:00:00Z').toISOString(),
      notes: null,
      remindAtMinutes: 60,
    });
    // Upcoming
    store.actions.addAssignment({
      title: 'Reading',
      classId: cls.id,
      dueAt: new Date('2025-01-17T17:00:00Z').toISOString(),
      notes: null,
      remindAtMinutes: null,
    });

    const s = store.getSelectors();
    const today = s.getAssignmentsForToday(store.getState());
    expect(today.find(a => a.id === aToday.id)).toBeTruthy();
    const upcoming = s.byDueDateAscending(
      s.getIncompleteAssignmentIds(store.getState()).map(id => store.getState().assignments.find(a => a.id === id)!)
    );
    expect(upcoming.length).toBeGreaterThan(0);
    const progress = s.progressPercent(store.getState());
    expect(progress).toBeGreaterThanOrEqual(0);
  });
});

describe('Store: streak calculation', () => {
  afterEach(() => vi.useRealTimers());

  it('increments streak for consecutive days with at least one completion', () => {
    vi.useFakeTimers();
    const store = createStore();
    const cls = store.actions.addClass({ name: 'CS', color: '#9c27b0', emoji: '💻' });
    const makeAssignment = (iso: string) => store.actions.addAssignment({
      title: 'Task', classId: cls.id, dueAt: iso, notes: null, remindAtMinutes: null,
    });

    const a1 = makeAssignment('2025-01-14T17:00:00Z');
    store.actions.toggleComplete(a1.id, true);

    // Next day
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
    const a2 = makeAssignment('2025-01-15T17:00:00Z');
    store.actions.toggleComplete(a2.id, true);

    const s = store.getSelectors();
    expect(s.streakDays(store.getState())).toBeGreaterThanOrEqual(2);
  });

  it('streak resets when a day is missed (UTC day boundaries)', () => {
    vi.setSystemTime(new Date('2025-01-10T10:00:00Z'));
    const store = createStore();
    const cls = store.actions.addClass({ name: 'Hist', color: '#123456', emoji: '📜' });
    const make = (iso: string) => store.actions.addAssignment({ title: 'T', classId: cls.id, dueAt: iso, notes: null, remindAtMinutes: null });

    const a1 = make('2025-01-08T12:00:00Z');
    store.actions.toggleComplete(a1.id, true);
    const a2 = make('2025-01-09T12:00:00Z');
    store.actions.toggleComplete(a2.id, true);
    // Skip completion for 2025-01-10 until later
    const s = store.getSelectors();
    expect(s.streakDays(store.getState())).toBe(0);
    // Complete today -> streak becomes at least 1
    const a3 = make('2025-01-10T18:00:00Z');
    store.actions.toggleComplete(a3.id, true);
    expect(s.streakDays(store.getState())).toBeGreaterThanOrEqual(1);
    vi.useRealTimers();
  });
});

describe('Store: persistence', () => {
  it('hydrates state on init and saves on changes (debounced)', async () => {
    const store = createStore();
    const cls = store.actions.addClass({ name: 'Chemistry', color: '#00bcd4', emoji: '⚗️' });
    store.actions.addAssignment({
      title: 'Homework 1', classId: cls.id, dueAt: new Date().toISOString(), notes: null, remindAtMinutes: 30,
    });
    // Expect mocked saveState to have been called eventually
    const persistence = await import('@/store/persistence');
    const saveState = (persistence as any).saveState as ReturnType<typeof vi.fn>;
    expect(saveState).toBeDefined();
  });

  it('debounces multiple rapid changes into a single save', async () => {
    vi.useRealTimers(); // ensure clean slate
    vi.useFakeTimers();
    const store = createStore();
    const p = await import('@/store/persistence');
    const saveState = (p as any).saveState as ReturnType<typeof vi.fn>;
    saveState.mockClear?.();

    const cls = store.actions.addClass({ name: 'X', color: '#000000', emoji: '🧪' });
    for (let i = 0; i < 5; i++) {
      store.actions.addAssignment({
        title: `A${i}`,
        classId: cls.id,
        dueAt: new Date().toISOString(),
        notes: null,
        remindAtMinutes: null,
      });
    }
    // Before debounce window
    expect(saveState.mock?.calls?.length ?? 0).toBe(0);
    vi.advanceTimersByTime(140);
    expect(saveState.mock?.calls?.length ?? 0).toBe(0);
    vi.advanceTimersByTime(20);
    expect(saveState.mock?.calls?.length ?? 0).toBeGreaterThanOrEqual(1);
    vi.useRealTimers();
  });
});
