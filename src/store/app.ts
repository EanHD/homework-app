import { create } from 'zustand';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import type { Class, Assignment, State, ID } from './types';
import { loadState, saveState } from './persistence';
import { toggleDone as repoToggleDone } from './repository';

type Filter = 'all' | 'overdue' | 'due-soon' | 'done';

export type AppStoreState = {
  classes: Class[];
  assignments: Assignment[];
  lastChangeToken: number;
};

export type AppStoreActions = {
  loadAll: () => Promise<void>;
  addClass: (input: Omit<Class, 'id'>) => Promise<Class>;
  updateClass: (input: Partial<Omit<Class, 'id'>> & { id: ID }) => Promise<void>;
  deleteClass: (id: ID) => Promise<void>;

  addAssignment: (input: Omit<Assignment, 'id' | 'completed' | 'completedAt' | 'archivedAt'> & { completed?: boolean }) => Promise<Assignment>;
  updateAssignment: (input: Partial<Omit<Assignment, 'id'>> & { id: ID }) => Promise<void>;
  deleteAssignment: (id: ID) => Promise<void>;
  toggleDone: (id: ID) => Promise<void>;
  restoreAssignment: (assignment: Assignment) => Promise<void>;

  // Selectors as methods for convenience
  selectToday: (now?: Date) => Assignment[];
  selectUpcoming: (now?: Date, opts?: { includeDone?: boolean; filter?: Filter }) => Assignment[];
  countTodayProgress: (now?: Date) => { total: number; completed: number; pct: number };
};

type AppStore = AppStoreState & AppStoreActions;

const isArchived = (a: Assignment) => !!a.archivedAt;

// UI-facing day comparisons should use local day to match user expectations
const isSameLocalDay = (d: Date, n: Date) =>
  d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();

const byDueAsc = (a: Assignment, b: Assignment) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();

function backfill(a: Assignment): Assignment {
  return { completedAt: null, archivedAt: null, ...a };
}

export const useAppStore = create<AppStore>()((set, get) => ({
  classes: [],
  assignments: [],
  lastChangeToken: 0,

  async loadAll() {
    const persisted = (await loadState()) as State | null;
    const classes = persisted?.classes ?? [];
    const assignments = (persisted?.assignments ?? []).map(backfill);
    set({ classes, assignments, lastChangeToken: Date.now() });
  },

  async addClass(input) {
    const c: Class = { id: nanoid(), ...input };
    const next: State = { classes: [...get().classes, c], assignments: get().assignments, preferences: {} } as unknown as State;
    await saveState(next);
    set({ classes: next.classes, lastChangeToken: Date.now() });
    return c;
  },

  async updateClass(input) {
    const nextClasses = get().classes.map((c) => (c.id === input.id ? { ...c, ...input } : c));
    const next: State = { classes: nextClasses, assignments: get().assignments, preferences: {} } as unknown as State;
    await saveState(next);
    set({ classes: nextClasses, lastChangeToken: Date.now() });
  },

  async deleteClass(id) {
    const nextClasses = get().classes.filter((c) => c.id !== id);
    const nextAssignments = get().assignments.filter((a) => a.classId !== id);
    const next: State = { classes: nextClasses, assignments: nextAssignments, preferences: {} } as unknown as State;
    await saveState(next);
    set({ classes: nextClasses, assignments: nextAssignments, lastChangeToken: Date.now() });
  },

  async addAssignment(input) {
    const a: Assignment = backfill({ id: nanoid(), completed: input.completed ?? false, ...input } as Assignment);
    const nextAssignments = [...get().assignments, a];
    const next: State = { classes: get().classes, assignments: nextAssignments, preferences: {} } as unknown as State;
    await saveState(next);
    set({ assignments: nextAssignments, lastChangeToken: Date.now() });
    return a;
  },

  async updateAssignment(input) {
    const nextAssignments = get().assignments.map((a) => (a.id === input.id ? ({ ...a, ...input } as Assignment) : a));
    const next: State = { classes: get().classes, assignments: nextAssignments, preferences: {} } as unknown as State;
    await saveState(next);
    set({ assignments: nextAssignments, lastChangeToken: Date.now() });
  },

  async deleteAssignment(id) {
    const nextAssignments = get().assignments.filter((a) => a.id !== id);
    const next: State = { classes: get().classes, assignments: nextAssignments, preferences: {} } as unknown as State;
    await saveState(next);
    set({ assignments: nextAssignments, lastChangeToken: Date.now() });
  },

  async toggleDone(id) {
    const persisted = await repoToggleDone(id); // toggle + persist
    const assignments = (persisted.assignments ?? []).map(backfill);
    set({ assignments, lastChangeToken: Date.now() });
  },

  async restoreAssignment(assignment) {
    const nextAssignments = [...get().assignments, backfill(assignment)];
    const next: State = { classes: get().classes, assignments: nextAssignments, preferences: {} } as unknown as State;
    await saveState(next);
    set({ assignments: nextAssignments, lastChangeToken: Date.now() });
  },

  selectToday(now = new Date()) {
    const n = now;
    const items = get().assignments.filter((a) => !isArchived(a) && isSameLocalDay(new Date(a.dueAt), n));
    return items.sort(byDueAsc);
  },

  selectUpcoming(now = new Date(), opts?: { includeDone?: boolean; filter?: Filter }) {
    const includeDone = opts?.includeDone ?? true;
    const filter = opts?.filter ?? 'all';
    const n = now;
    const list = get().assignments.filter((a) => !isArchived(a));
    return list
      .filter((a) => {
        const due = new Date(a.dueAt).getTime();
        const nowMs = n.getTime();
        switch (filter) {
          case 'overdue':
            return !a.completed && due < nowMs;
          case 'due-soon': {
            const diff = new Date(a.dueAt).getTime() - nowMs;
            return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000 && !a.completed;
          }
          case 'done':
            return a.completed;
          case 'all':
          default:
            return includeDone ? true : !a.completed;
        }
      })
      .sort(byDueAsc);
  },

  countTodayProgress(now = new Date()) {
    const today = get().selectToday(now);
    const total = today.length;
    const completed = today.filter((a) => a.completed).length;
    const pct = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    return { total, completed, pct };
  },
}));

// Utilities (optional direct exports)
export function groupByDate(assignments: Assignment[]) {
  const map = new Map<string, Assignment[]>();
  for (const a of assignments) {
    const key = dayjs(a.dueAt).format('ddd, MMM D');
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  return Array.from(map.entries());
}
