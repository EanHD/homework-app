import localforage from 'localforage';
import type { Assignment, Class, State } from './types';

export type PersistedState = Partial<State> | null;

const STORAGE_KEY = 'homework-buddy/state/v1';

// Configure localforage instance (IndexedDB preferred, fallback to WebSQL/localStorage)
const storage = localforage.createInstance({
  name: 'homework-buddy',
  storeName: 'app-state',
  description: 'Homework Buddy application state',
});

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function validClass(c: any): c is Class {
  return (
    isObject(c) && typeof c.id === 'string' && typeof c.name === 'string' &&
    typeof c.color === 'string' && typeof c.emoji === 'string'
  );
}

function validAssignment(a: any): a is Assignment {
  return (
    isObject(a) && typeof a.id === 'string' && typeof a.title === 'string' &&
    typeof a.classId === 'string' && typeof a.dueAt === 'string' &&
    typeof a.completed === 'boolean' && ('notes' in a) && ('remindAtMinutes' in a)
  );
}

function sanitizeLoadedState(raw: unknown): PersistedState {
  if (!isObject(raw)) return null;
  const out: Partial<State> = {};
  if (Array.isArray(raw.classes)) {
    out.classes = raw.classes.filter(validClass);
  }
  if (Array.isArray(raw.assignments)) {
    out.assignments = raw.assignments.filter(validAssignment);
  }
  if (isObject(raw.preferences)) {
    out.preferences = raw.preferences as State['preferences'];
  }
  if (!out.classes && !out.assignments && !out.preferences) return null;
  return out;
}

export async function loadState(): Promise<PersistedState> {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    return sanitizeLoadedState(raw as unknown);
  } catch {
    return null;
  }
}

export async function saveState(state: State): Promise<void> {
  const payload: PersistedState = {
    classes: state.classes,
    assignments: state.assignments,
    preferences: state.preferences,
  };
  try {
    await storage.setItem(STORAGE_KEY, payload);
  } catch {
    // ignore persistence errors to avoid disrupting UX
  }
}
