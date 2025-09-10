import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/app';
import type { Assignment, Class } from '@/store/types';

// Helper to create test assignments
function createAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'test-id',
    title: 'Test Assignment',
    classId: 'class-1',
    dueAt: new Date().toISOString(),
    completed: false,
    notes: null,
    remindAtMinutes: null,
    completedAt: null,
    archivedAt: null,
    ...overrides,
  };
}

function createClass(overrides: Partial<Class> = {}): Class {
  return {
    id: 'class-1',
    name: 'Test Class',
    color: '#1E88E5',
    emoji: '📚',
    ...overrides,
  };
}

describe('Store Selectors', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      classes: [],
      assignments: [],
      lastChangeToken: 0,
      seenOnboarding: false,
      lastUndo: null,
    });
  });

  describe('selectToday', () => {
    it('returns assignments due today', () => {
      const today = new Date('2025-09-09T12:00:00Z');
      const todayAssignment = createAssignment({
        id: 'today-1',
        dueAt: '2025-09-09T15:00:00Z', // Today
      });
      const tomorrowAssignment = createAssignment({
        id: 'tomorrow-1',
        dueAt: '2025-09-10T15:00:00Z', // Tomorrow
      });

      useAppStore.setState({
        assignments: [todayAssignment, tomorrowAssignment],
        classes: [createClass()],
        lastChangeToken: 1,
        seenOnboarding: false,
        lastUndo: null,
      });

      const todayItems = useAppStore.getState().selectToday(today);
      expect(todayItems).toHaveLength(1);
      expect(todayItems[0].id).toBe('today-1');
    });

    it('excludes archived assignments', () => {
      const today = new Date('2025-09-09T12:00:00Z');
      const activeAssignment = createAssignment({
        id: 'active-1',
        dueAt: '2025-09-09T15:00:00Z',
      });
      const archivedAssignment = createAssignment({
        id: 'archived-1',
        dueAt: '2025-09-09T16:00:00Z',
        archivedAt: '2025-09-08T10:00:00Z', // Archived yesterday
      });

      useAppStore.setState({
        assignments: [activeAssignment, archivedAssignment],
        classes: [createClass()],
        lastChangeToken: 1,
        seenOnboarding: false,
        lastUndo: null,
      });

      const todayItems = useAppStore.getState().selectToday(today);
      expect(todayItems).toHaveLength(1);
      expect(todayItems[0].id).toBe('active-1');
    });
  });

  describe('selectUpcoming', () => {
    it('returns upcoming assignments excluding done when includeDone=false', () => {
      const now = new Date('2025-09-09T12:00:00Z');
      const pendingAssignment = createAssignment({
        id: 'pending-1',
        dueAt: '2025-09-10T15:00:00Z',
        completed: false,
      });
      const completedAssignment = createAssignment({
        id: 'completed-1',
        dueAt: '2025-09-10T16:00:00Z',
        completed: true,
      });

      useAppStore.setState({
        assignments: [pendingAssignment, completedAssignment],
        classes: [createClass()],
        lastChangeToken: 1,
        seenOnboarding: false,
        lastUndo: null,
      });

      const upcoming = useAppStore.getState().selectUpcoming(now, { includeDone: false });
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].id).toBe('pending-1');
    });

    it('filters overdue assignments correctly', () => {
      const now = new Date('2025-09-09T12:00:00Z');
      const overdueAssignment = createAssignment({
        id: 'overdue-1',
        dueAt: '2025-09-08T15:00:00Z', // Yesterday
        completed: false,
      });
      const futureAssignment = createAssignment({
        id: 'future-1',
        dueAt: '2025-09-10T15:00:00Z', // Tomorrow
        completed: false,
      });

      useAppStore.setState({
        assignments: [overdueAssignment, futureAssignment],
        classes: [createClass()],
        lastChangeToken: 1,
        seenOnboarding: false,
        lastUndo: null,
      });

      const overdue = useAppStore.getState().selectUpcoming(now, { filter: 'overdue' });
      expect(overdue).toHaveLength(1);
      expect(overdue[0].id).toBe('overdue-1');
    });

    it('filters due-soon assignments correctly', () => {
      const now = new Date('2025-09-09T12:00:00Z');
      const dueSoonAssignment = createAssignment({
        id: 'due-soon-1',
        dueAt: '2025-09-12T15:00:00Z', // 3 days from now (within 7 days)
        completed: false,
      });
      const farFutureAssignment = createAssignment({
        id: 'far-future-1',
        dueAt: '2025-09-20T15:00:00Z', // 11 days from now (beyond 7 days)
        completed: false,
      });

      useAppStore.setState({
        assignments: [dueSoonAssignment, farFutureAssignment],
        classes: [createClass()],
        lastChangeToken: 1,
        seenOnboarding: false,
        lastUndo: null,
      });

      const dueSoon = useAppStore.getState().selectUpcoming(now, { filter: 'due-soon' });
      expect(dueSoon).toHaveLength(1);
      expect(dueSoon[0].id).toBe('due-soon-1');
    });
  });

  describe('countTodayProgress', () => {
    it('calculates progress correctly', () => {
      const today = new Date('2025-09-09T12:00:00Z');
      const assignment1 = createAssignment({
        id: 'today-1',
        dueAt: '2025-09-09T15:00:00Z',
        completed: true,
      });
      const assignment2 = createAssignment({
        id: 'today-2',
        dueAt: '2025-09-09T16:00:00Z',
        completed: false,
      });
      const assignment3 = createAssignment({
        id: 'today-3',
        dueAt: '2025-09-09T17:00:00Z',
        completed: true,
      });

      useAppStore.setState({
        assignments: [assignment1, assignment2, assignment3],
        classes: [createClass()],
        lastChangeToken: 1,
        seenOnboarding: false,
        lastUndo: null,
      });

      const progress = useAppStore.getState().countTodayProgress(today);
      expect(progress.total).toBe(3);
      expect(progress.completed).toBe(2);
      expect(progress.pct).toBe(67); // 2/3 * 100 = 66.67, rounded to 67
    });

    it('returns 0% when no assignments', () => {
      const today = new Date('2025-09-09T12:00:00Z');
      
      useAppStore.setState({
        assignments: [],
        classes: [],
        lastChangeToken: 1,
        seenOnboarding: false,
        lastUndo: null,
      });

      const progress = useAppStore.getState().countTodayProgress(today);
      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
      expect(progress.pct).toBe(0);
    });
  });
});
