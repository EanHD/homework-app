import type { Assignment, Class, ID, Selectors, State, Store, StoreActions } from './types';
import { loadState, saveState } from './persistence';
import { selectors as realSelectors } from './selectors';

const nowId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type Listener = (s: State) => void;

const DEFAULT_STATE: State = {
  classes: [],
  assignments: [],
  preferences: {},
};

export function createStore(initial?: Partial<State>): Store {
  let state: State = { ...DEFAULT_STATE, ...initial } as State;
  const listeners = new Set<Listener>();
  let pristine = true;
  let saveTimer: any = null;

  const notify = () => {
    for (const l of listeners) l(state);
  };

  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void saveState(state);
    }, 150);
  };

  const setState = (updater: (prev: State) => State) => {
    state = updater(state);
    pristine = false;
    notify();
    scheduleSave();
  };

  // Hydrate async; only replace if still pristine to avoid clobbering user changes
  (async () => {
    try {
      const persisted = await loadState();
      if (persisted && pristine) {
        state = { ...DEFAULT_STATE, ...persisted } as State;
        notify();
      }
    } catch {
      // ignore hydration errors in scaffolding
    }
  })();

  const actions: StoreActions = {
    addClass(input) {
      const c: Class = { id: nowId(), ...input };
      setState(prev => ({ ...prev, classes: [...prev.classes, c] }));
      return c;
    },
    updateClass(input) {
      setState(prev => ({
        ...prev,
        classes: prev.classes.map(c => (c.id === input.id ? { ...c, ...input } : c)),
      }));
    },
    removeClass(id) {
      setState(prev => ({
        ...prev,
        classes: prev.classes.filter(c => c.id !== id),
      }));
    },

    addAssignment(input) {
      const a: Assignment = {
        id: nowId(),
        completed: input.completed ?? false,
        ...input,
      } as Assignment;
      setState(prev => ({ ...prev, assignments: [...prev.assignments, a] }));
      return a;
    },
    updateAssignment(input) {
      setState(prev => ({
        ...prev,
        assignments: prev.assignments.map(a => (a.id === input.id ? { ...a, ...input } : a)),
      }));
    },
    toggleComplete(id, value) {
      setState(prev => ({
        ...prev,
        assignments: prev.assignments.map(a =>
          a.id === id ? { ...a, completed: value ?? !a.completed } : a
        ),
      }));
    },
    removeAssignment(id) {
      setState(prev => ({
        ...prev,
        assignments: prev.assignments.filter(a => a.id !== id),
      }));
    },
  };

  const store: Store = {
    getState: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    actions,
    getSelectors: () => realSelectors,
  };

  return store;
}
