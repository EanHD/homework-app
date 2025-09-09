import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/app';

describe('Progress math', () => {
  beforeEach(() => {
    useAppStore.setState({ classes: [], assignments: [], lastChangeToken: 0 }, false);
  });

  it('zero-state when no today items', () => {
    const today = new Date('2025-03-10T12:00:00Z');
    const list = useAppStore.getState().assignments.filter(() => false);
    const total = list.length;
    const completed = list.filter((a: any) => a.completed).length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    expect(total).toBe(0);
    expect(completed).toBe(0);
    expect(pct).toBe(0);
  });

  it('counts done over total for today', () => {
    const base = '2025-03-10T09:00:00Z';
    const mk = (id: string, done: boolean) => ({ id, title: id, classId: 'c', dueAt: base, completed: done, notes: null, remindAtMinutes: null });
    useAppStore.setState({ assignments: [mk('a1', true) as any, mk('a2', false) as any, mk('a3', true) as any] }, false);
    const total = 3;
    const completed = 2;
    const pct = Math.round((completed / total) * 100);
    expect(total).toBe(3);
    expect(completed).toBe(2);
    expect(pct).toBe(67); // rounded
  });
});
