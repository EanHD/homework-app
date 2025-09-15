import { useEffect, useRef, useState, useCallback } from 'react';
import performanceService, { getCurrentPerformanceSnapshot, performanceService as svc } from '../services/performance';
import type { PerformanceMetrics, WebVitals } from '../models/performance.enhanced';

export interface UsePerformanceMetricsOptions {
  sampleInterval?: number; // ms between auto collection cycles
  enabled?: boolean;
  immediate?: boolean; // collect immediately on mount
  autoStartMonitoring?: boolean; // start web vitals observers
  onMetric?: (metric: keyof WebVitals, value: number) => void;
  onBudgetFail?: (metric: string, details: any) => void;
}

export interface UsePerformanceMetricsReturn {
  vitals: Partial<WebVitals>;
  lastMetrics?: PerformanceMetrics;
  score?: number;
  collecting: boolean;
  collect: () => Promise<void>;
  startTiming: (name: string) => () => number;
  configure: typeof svc.configure;
  setBudgets: typeof svc.setBudgets;
}

const DEFAULT_INTERVAL = 15000; // 15s – lighter than reportInterval

export function usePerformanceMetrics(options?: UsePerformanceMetricsOptions): UsePerformanceMetricsReturn {
  const {
    sampleInterval = DEFAULT_INTERVAL,
    enabled = true,
    immediate = true,
    autoStartMonitoring = true,
    onMetric,
    onBudgetFail,
  } = options || {};

  const [vitals, setVitals] = useState<Partial<WebVitals>>({});
  const [lastMetrics, setLastMetrics] = useState<PerformanceMetrics | undefined>();
  const [score, setScore] = useState<number | undefined>(undefined);
  const [collecting, setCollecting] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  // Collect snapshot
  const collect = useCallback(async () => {
    if (!enabled) return;
    setCollecting(true);
    try {
      const { metrics, score } = await getCurrentPerformanceSnapshot();
      setLastMetrics(metrics);
      setScore(score);
    } finally {
      setCollecting(false);
    }
  }, [enabled]);

  // Timing helper proxy
  const startTiming = useCallback((name: string) => performanceService.startTiming(name), []);

  // Setup listeners
  useEffect(() => {
    if (!enabled) return;
    if (autoStartMonitoring) {
      performanceService.startMonitoring();
    }

    const unsubscribeMetric = performanceService.onWebVital((metric, value) => {
      setVitals(prev => (prev[metric] === value ? prev : { ...prev, [metric]: value }));
      onMetric?.(metric, value);
    });

    const unsubscribeBudget = performanceService.onBudgetExceeded(result => {
      onBudgetFail?.(result.metric, result);
    });

    if (immediate && !mountedRef.current) {
      mountedRef.current = true;
      collect();
    }

    if (sampleInterval > 0) {
      intervalRef.current = window.setInterval(() => {
        collect();
      }, sampleInterval);
    }

    return () => {
      unsubscribeMetric();
      unsubscribeBudget();
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [enabled, autoStartMonitoring, immediate, sampleInterval, collect, onMetric, onBudgetFail]);

  return {
    vitals,
    lastMetrics,
    score,
    collecting,
    collect,
    startTiming,
    configure: performanceService.configure.bind(performanceService),
    setBudgets: performanceService.setBudgets.bind(performanceService),
  };
}

export default usePerformanceMetrics;