import { selectors } from './selectors';
import type { Assignment, Store } from './types';
import { showNotification } from './notifications';

const ONE_MIN = 60 * 1000;
const WINDOW_AHEAD = 24 * 60 * ONE_MIN; // schedule up to 24h ahead

function triggerTime(a: Assignment): number {
  const due = new Date(a.dueAt).getTime();
  const offset = (a.remindAtMinutes ?? 0) * ONE_MIN;
  return Math.max(0, due - offset);
}

export function createScheduler(store: Store) {
  const timeouts = new Map<string, number>();

  const cancelAll = () => {
    for (const [, t] of timeouts) clearTimeout(t);
    timeouts.clear();
  };

  const scheduleFor = (a: Assignment) => {
    if (a.completed) return;
    const t = triggerTime(a);
    const now = Date.now();
    if (t <= now) {
      void notifyAssignment(a);
      return;
    }
    const delta = t - now;
    if (delta > WINDOW_AHEAD) return; // defer far-future scheduling
    const handle = setTimeout(() => {
      void notifyAssignment(a);
      timeouts.delete(a.id);
    }, delta) as unknown as number;
    timeouts.set(a.id, handle);
  };

  const notifyAssignment = async (a: Assignment) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const state = store.getState();
    const classMap = selectors.getClassMap(state);
    const cls = classMap[a.classId];
    const due = new Date(a.dueAt);
    const hh = String(due.getHours()).padStart(2, '0');
    const mm = String(due.getMinutes()).padStart(2, '0');
    const when = `${due.toLocaleDateString()} ${hh}:${mm}`;
    const title = `Due: ${a.title}`;
    const body = cls ? `${cls.emoji} ${cls.name} • ${when}` : when;
    await showNotification(title, { body, tag: `assignment-${a.id}` });
  };

  const checkNow = () => {
    cancelAll();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        // Don't schedule timers when permission not granted
        return;
      }
    }
    const state = store.getState();
    const ids = selectors.getIncompleteAssignmentIds(state);
    ids
      .map((id) => state.assignments.find((x) => x.id === id)!)
      .filter(Boolean)
      .forEach((a) => scheduleFor(a));
  };

  return {
    checkNow,
    cancelAll,
    start() {
      // Initial schedule
      checkNow();
      // Subscribe to store changes to reschedule
      const unsubscribe = store.subscribe(() => {
        checkNow();
      });
      return unsubscribe;
    },
  };
}
