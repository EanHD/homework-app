import dayjs from 'dayjs';
import type { Assignment, Class, ID, Selectors, State } from './types';

// Compare calendar day in UTC to avoid environment-dependent timezone drift in tests
const isSameUtcDay = (iso: string, nowDate = new Date()): boolean => {
  const d = new Date(iso);
  const n = nowDate;
  return (
    d.getUTCFullYear() === n.getUTCFullYear() &&
    d.getUTCMonth() === n.getUTCMonth() &&
    d.getUTCDate() === n.getUTCDate()
  );
};

export function getAssignmentsForToday(state: State): Assignment[] {
  return state.assignments.filter((a) => !a.completed && isSameUtcDay(a.dueAt));
}

export function getIncompleteAssignmentIds(state: State): ID[] {
  return state.assignments.filter((a) => !a.completed).map((a) => a.id);
}

export function byDueDateAscending(list: Assignment[]): Assignment[] {
  return [...list].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function progressPercent(state: State): number {
  const today = state.assignments.filter((a) => isSameUtcDay(a.dueAt));
  if (today.length === 0) return 0;
  const done = today.filter((a) => a.completed).length;
  const pct = Math.round((done / today.length) * 100);
  return Math.max(0, Math.min(100, pct));
}

export function streakDays(state: State): number {
  // Approximate using dueAt UTC day for completed items
  const toKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  const completedDays = new Set(
    state.assignments
      .filter((a) => a.completed)
      .map((a) => toKey(new Date(a.dueAt)))
  );
  let count = 0;
  const cursor = new Date();
  while (completedDays.has(toKey(cursor))) {
    count += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}

export function getClassMap(state: State): Record<ID, Class> {
  return state.classes.reduce<Record<ID, Class>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});
}

export const selectors: Selectors = {
  getAssignmentsForToday,
  getIncompleteAssignmentIds,
  byDueDateAscending,
  progressPercent,
  streakDays,
  getClassMap,
};
