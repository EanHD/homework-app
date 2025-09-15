import { useEffect, useRef, useState } from 'react';
import performanceService, { getCurrentPerformanceSnapshot } from '@/services/performance';
import { usePerformanceStore } from '@/store/performance';

export interface PerformanceTargetResult {
  initialLoadMet: boolean | null;
  transitionMet: boolean | null;
  interactionMet: boolean | null;
  initialLoadTime?: number;
  lastRouteChangeTime?: number;
  lastInteractionDelay?: number;
  checkedAt?: string;
}

const INITIAL_LOAD_TARGET = 3000; // ms
const TRANSITION_TARGET = 1000; // ms
const INTERACTION_TARGET = 200; // ms

/**
 * Hook to validate high‑level performance targets required for T037:
 *  - Initial load under 3s (uses navigation timing pageLoad or loadComplete)
 *  - Route transitions under 1s (consumer calls markRouteStart/markRouteEnd)
 *  - Interaction feedback under 200ms (consumer wraps interactions)
 *
 * Provides minimal imperative API; avoids coupling directly to router.
 */
export function usePerformanceTargetsValidation(autoCheckInitialLoad = true) {
  const [results, setResults] = useState<PerformanceTargetResult>({
    initialLoadMet: null,
    transitionMet: null,
    interactionMet: null,
  });

  const routeStartRef = useRef<number | null>(null);
  const interactionStartRef = useRef<number | null>(null);
  const storeIngest = usePerformanceStore(s => s.ingestSnapshot);

  // Initial load check once after mount
  useEffect(() => {
    if (!autoCheckInitialLoad) return;
    let cancelled = false;
    (async () => {
      const { metrics } = await getCurrentPerformanceSnapshot();
      // Prefer navigationTiming.pageLoad; fallback to webVitals.loadComplete
      const loadMs = metrics.navigationTiming.pageLoad || metrics.webVitals.loadComplete || 0;
      const initialLoadMet = loadMs > 0 ? loadMs <= INITIAL_LOAD_TARGET : false;
      if (!cancelled) {
        setResults(prev => ({ ...prev, initialLoadMet, initialLoadTime: loadMs, checkedAt: new Date().toISOString() }));
        storeIngest(metrics); // snapshot for historical context
      }
    })();
    return () => { cancelled = true; };
  }, [autoCheckInitialLoad, storeIngest]);

  const markRouteStart = () => {
    routeStartRef.current = performance.now();
  };

  const markRouteEnd = () => {
    if (routeStartRef.current == null) return;
    const duration = performance.now() - routeStartRef.current;
    const met = duration <= TRANSITION_TARGET;
    setResults(prev => ({ ...prev, transitionMet: met, lastRouteChangeTime: duration, checkedAt: new Date().toISOString() }));
    routeStartRef.current = null;
    return duration;
  };

  const startInteraction = () => {
    interactionStartRef.current = performance.now();
  };

  const endInteraction = () => {
    if (interactionStartRef.current == null) return;
    const duration = performance.now() - interactionStartRef.current;
    const met = duration <= INTERACTION_TARGET;
    setResults(prev => ({ ...prev, interactionMet: met, lastInteractionDelay: duration, checkedAt: new Date().toISOString() }));
    interactionStartRef.current = null;
    return duration;
  };

  // Optional: subscribe to web vitals (no thresholds here, just ensure monitoring started)
  useEffect(() => {
    performanceService.startMonitoring();
  }, []);

  return {
    results,
    markRouteStart,
    markRouteEnd,
    startInteraction,
    endInteraction,
    constants: {
      INITIAL_LOAD_TARGET,
      TRANSITION_TARGET,
      INTERACTION_TARGET,
    },
  } as const;
}

export default usePerformanceTargetsValidation;
