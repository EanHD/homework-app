import { create } from 'zustand';
import type { WebVitals, PerformanceMetrics, PerformanceBudget } from '@/models/performance.enhanced';
import { DEFAULT_PERFORMANCE_BUDGET, calculatePerformanceScore, checkPerformanceBudget } from '@/models/performance.enhanced';

export interface PerformanceSnapshot {
  id: string;
  timestamp: string;
  metrics: PerformanceMetrics;
  score: number;
}

export interface PerformanceStoreState {
  vitals: Partial<WebVitals>;
  score: number | null;
  snapshots: PerformanceSnapshot[];
  maxSnapshots: number;
  budget: PerformanceBudget;
  failedBudgets: string[]; // list of metric names currently failing (last snapshot)
  lastUpdated?: string;
  monitoring: boolean;
}

export interface PerformanceStoreActions {
  updateWebVital: (metric: keyof WebVitals, value: number) => void;
  ingestSnapshot: (metrics: PerformanceMetrics) => void;
  setBudgets: (budget: Partial<PerformanceBudget>) => void;
  clear: () => void;
  setMonitoring: (on: boolean) => void;
}

type PerformanceStore = PerformanceStoreState & PerformanceStoreActions;

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const usePerformanceStore = create<PerformanceStore>()((set, get) => ({
  vitals: {},
  score: null,
  snapshots: [],
  maxSnapshots: 25,
  budget: { ...DEFAULT_PERFORMANCE_BUDGET },
  failedBudgets: [],
  monitoring: false,

  updateWebVital(metric, value) {
    set(state => {
      const nextVitals = { ...state.vitals, [metric]: value };
      const score = calculatePerformanceScore(nextVitals as WebVitals);
      return { vitals: nextVitals, score, lastUpdated: new Date().toISOString() };
    });
  },

  ingestSnapshot(metrics) {
    const score = calculatePerformanceScore(metrics.webVitals);
    const id = genId();
    const snapshot: PerformanceSnapshot = { id, timestamp: metrics.timestamp, metrics, score };
    set(state => {
      const next = [...state.snapshots, snapshot];
      if (next.length > state.maxSnapshots) next.shift();
      const budgetResults = checkPerformanceBudget(metrics, state.budget);
      const failed = budgetResults.filter(r => r.status === 'failed').map(r => r.metric);
      return { snapshots: next, score, failedBudgets: failed, lastUpdated: metrics.timestamp };
    });
  },

  setBudgets(budget) {
    set(state => ({ budget: { ...state.budget, ...budget } }));
  },

  clear() {
    set({ vitals: {}, score: null, snapshots: [], failedBudgets: [], lastUpdated: undefined });
  },

  setMonitoring(on) {
    set({ monitoring: on });
  },
}));

// Convenience selectors
export const selectVitals = (s: PerformanceStore) => s.vitals;
export const selectPerformanceScore = (s: PerformanceStore) => s.score;
export const selectFailedBudgets = (s: PerformanceStore) => s.failedBudgets;
export const selectLatestSnapshot = (s: PerformanceStore) => (s.snapshots.length ? s.snapshots[s.snapshots.length - 1] : null);

export default usePerformanceStore;