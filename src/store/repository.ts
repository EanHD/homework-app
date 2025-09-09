import { loadState, saveState } from './persistence';
import type { Assignment, ID, State } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

function toggleAssignmentDone(a: Assignment, nowIso: string): Assignment {
  if (a.completed) {
    return { ...a, completed: false, completedAt: null };
  }
  return { ...a, completed: true, completedAt: nowIso };
}

export async function toggleDone(id: ID): Promise<State> {
  const state = (await loadState()) as State | null;
  if (!state) return await saveAndReturn((s) => s); // nothing to do
  const nowIso = new Date().toISOString();
  const next: State = {
    ...state,
    assignments: state.assignments.map((a) => (a.id === id ? toggleAssignmentDone(a, nowIso) : a)),
  } as State;
  await saveState(next);
  return next;
}

export async function archiveCompletedOlderThan(days = 90): Promise<State | null> {
  const state = (await loadState()) as State | null;
  if (!state) return null;
  const cutoff = Date.now() - days * DAY_MS;
  const nowIso = new Date().toISOString();
  let changed = false;
  const nextAssignments = state.assignments.map((a) => {
    if (a.archivedAt) return a;
    if (!a.completedAt) return a;
    const t = Date.parse(a.completedAt);
    if (!Number.isFinite(t)) return a;
    if (t < cutoff) {
      changed = true;
      return { ...a, archivedAt: nowIso };
    }
    return a;
  });
  if (changed) {
    const next: State = { ...state, assignments: nextAssignments } as State;
    await saveState(next);
    return next;
  }
  return state;
}

async function saveAndReturn(updater: (s: State) => State): Promise<State> {
  const state = (await loadState()) as State | null;
  const base: State =
    state ?? ({ classes: [], assignments: [], preferences: {} } as unknown as State);
  const next = updater(base);
  await saveState(next);
  return next;
}

// Boot-time cleanup helper
export async function bootCleanup(): Promise<void> {
  try {
    await archiveCompletedOlderThan(90);
  } catch {
    // ignore cleanup errors
  }
}

