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

// Export data to JSON format
export async function exportData(): Promise<{ version: string; exportedAt: string; classes: any[]; assignments: any[] }> {
  const state = (await loadState()) as State | null;
  if (!state) {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      classes: [],
      assignments: [],
    };
  }
  
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    classes: state.classes,
    assignments: state.assignments,
  };
}

// Import data with merge strategy
export async function importData(payload: { version?: string; classes?: any[]; assignments?: any[] }): Promise<{ success: boolean; classesAdded: number; assignmentsAdded: number; errors: string[] }> {
  try {
    const state = (await loadState()) as State | null;
    const currentState: State = state ?? ({ classes: [], assignments: [], preferences: {} } as unknown as State);
    
    const errors: string[] = [];
    let classesAdded = 0;
    let assignmentsAdded = 0;
    
    // Validate version
    if (payload.version && payload.version !== '1.0') {
      errors.push(`Unsupported version: ${payload.version}`);
    }
    
    // Merge classes
    const existingClassIds = new Set(currentState.classes.map(c => c.id));
    const newClasses = (payload.classes || []).filter(c => {
      if (!c.id || !c.name) {
        errors.push('Invalid class data: missing id or name');
        return false;
      }
      return !existingClassIds.has(c.id);
    });
    classesAdded = newClasses.length;
    
    // Merge assignments
    const existingAssignmentIds = new Set(currentState.assignments.map(a => a.id));
    const newAssignments = (payload.assignments || []).filter(a => {
      if (!a.id || !a.title || !a.classId) {
        errors.push('Invalid assignment data: missing required fields');
        return false;
      }
      return !existingAssignmentIds.has(a.id);
    });
    assignmentsAdded = newAssignments.length;
    
    // Save merged state
    const mergedState: State = {
      ...currentState,
      classes: [...currentState.classes, ...newClasses],
      assignments: [...currentState.assignments, ...newAssignments],
    } as State;
    
    await saveState(mergedState);
    
    return {
      success: errors.length === 0,
      classesAdded,
      assignmentsAdded,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      classesAdded: 0,
      assignmentsAdded: 0,
      errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

