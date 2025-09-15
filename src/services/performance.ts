import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import {
  DEFAULT_PERFORMANCE_BUDGET,
  DEFAULT_PERFORMANCE_MONITOR_CONFIG,
  PerformanceBudget,
  PerformanceMetrics,
  PerformanceMonitor,
  PerformanceMonitorConfig,
  WebVitals,
  checkPerformanceBudget,
  calculatePerformanceScore,
} from '../models/performance.enhanced';

// Lightweight internal state (not yet persisted; store integration will handle later tasks)
interface InternalState {
  webVitals: Partial<WebVitals>;
  budget: PerformanceBudget;
  config: PerformanceMonitorConfig;
  listeners: Array<(metric: keyof WebVitals, value: number) => void>;
  budgetListeners: Array<(result: any) => void>;
  timings: Record<string, number>;
  started: boolean;
}

const state: InternalState = {
  webVitals: {},
  budget: { ...DEFAULT_PERFORMANCE_BUDGET },
  config: { ...DEFAULT_PERFORMANCE_MONITOR_CONFIG },
  listeners: [],
  budgetListeners: [],
  timings: {},
  started: false,
};

// Utility to safely access performance entries
const getNavigationTiming = () => {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!nav) return undefined;
  return nav;
};

const generateMetrics = (): PerformanceMetrics => {
  const nav = getNavigationTiming();
  const now = Date.now();
  const page = window.location.pathname + window.location.search;
  const sessionId = sessionStorage.getItem('perf_session') || (() => {
    const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    sessionStorage.setItem('perf_session', id);
    return id;
  })();

  const webVitals: WebVitals = {
    cls: state.webVitals.cls ?? 0,
    fid: state.webVitals.fid ?? 0,
    lcp: state.webVitals.lcp ?? 0,
    fcp: state.webVitals.fcp ?? 0,
    ttfb: state.webVitals.ttfb ?? 0,
    tbt: 0, // Placeholder (would aggregate long tasks)
    si: 0, // Not directly from web-vitals; placeholder
    domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
    loadComplete: nav ? nav.loadEventEnd - nav.startTime : 0,
    firstPaint: 0,
    firstMeaningfulPaint: 0,
  };

  const metrics: PerformanceMetrics = {
    webVitals,
    navigationTiming: nav
      ? {
          fetchStart: nav.fetchStart,
          domainLookupStart: nav.domainLookupStart,
          domainLookupEnd: nav.domainLookupEnd,
          connectStart: nav.connectStart,
            connectEnd: nav.connectEnd,
          secureConnectionStart: nav.secureConnectionStart,
          requestStart: nav.requestStart,
          responseStart: nav.responseStart,
          responseEnd: nav.responseEnd,
          domLoading: (nav as any).domLoading || 0,
          domInteractive: nav.domInteractive,
          domContentLoadedEventStart: nav.domContentLoadedEventStart,
          domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
          domComplete: nav.domComplete,
          loadEventStart: nav.loadEventStart,
          loadEventEnd: nav.loadEventEnd,
          dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
          tcpConnect: nav.connectEnd - nav.connectStart,
          serverResponse: nav.responseEnd - nav.requestStart,
          pageLoad: nav.loadEventEnd - nav.startTime,
          domProcessing: nav.domComplete - nav.domInteractive,
          totalTime: nav.loadEventEnd - nav.startTime,
        }
      : {
          fetchStart: 0,
          domainLookupStart: 0,
          domainLookupEnd: 0,
          connectStart: 0,
          connectEnd: 0,
          requestStart: 0,
          responseStart: 0,
          responseEnd: 0,
          domLoading: 0,
          domInteractive: 0,
          domContentLoadedEventStart: 0,
          domContentLoadedEventEnd: 0,
          domComplete: 0,
          loadEventStart: 0,
          loadEventEnd: 0,
          dnsLookup: 0,
          tcpConnect: 0,
          serverResponse: 0,
          pageLoad: 0,
          domProcessing: 0,
          totalTime: 0,
        },
    resourceTiming: [],
    paintTiming: {
      firstPaint: 0,
      firstContentfulPaint: webVitals.fcp,
      firstMeaningfulPaint: undefined,
      largestContentfulPaint: webVitals.lcp,
    },
    memoryUsage: undefined,
    networkInfo: (navigator as any).connection
      ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
          saveData: (navigator as any).connection.saveData,
        }
      : undefined,
    appMetrics: {
      timeToFirstSignIn: undefined,
      timeToFirstAssignment: undefined,
      timeToFirstRender: performance.timing ? performance.timing.responseEnd - performance.timing.requestStart : 0,
      timeToInteractive: nav ? nav.domInteractive - nav.startTime : 0,
      navigationTime: nav ? nav.loadEventEnd - nav.startTime : 0,
      routeChangeTime: undefined,
      componentRenderTime: {},
      componentMountTime: {},
      bundleSize: 0,
      chunksLoaded: 0,
      codeSplittingEfficiency: 0,
      cacheHitRate: undefined,
      serviceWorkerCacheHits: undefined,
      jsErrors: 0,
      networkErrors: 0,
      unhandledRejections: 0,
    },
    timestamp: new Date(now).toISOString(),
    sessionId,
    userId: undefined,
    page,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      orientation: window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait',
    },
    connection: {
      type: (navigator as any).connection?.type || 'unknown',
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0,
    },
  };

  return metrics;
};

const notifyWebVital = (metric: keyof WebVitals, value: number) => {
  state.listeners.forEach(l => {
    try { l(metric, value); } catch { /* ignore listener errors */ }
  });
};

const performanceMonitor: PerformanceMonitor = {
  startMonitoring() {
    if (state.started || !state.config.enabled) return;
    state.started = true;
    // Register web-vitals observers
    onCLS((r: Metric) => { state.webVitals.cls = r.value; notifyWebVital('cls', r.value); });
    // Web Vitals v5: INP replaces FID; map to fid field for legacy model compatibility
    onINP((r: Metric) => { state.webVitals.fid = r.value; notifyWebVital('fid', r.value); });
    onLCP((r: Metric) => { state.webVitals.lcp = r.value; notifyWebVital('lcp', r.value); });
    onFCP((r: Metric) => { state.webVitals.fcp = r.value; notifyWebVital('fcp', r.value); });
    onTTFB((r: Metric) => { state.webVitals.ttfb = r.value; notifyWebVital('ttfb', r.value); });
  },
  stopMonitoring() {
    // web-vitals does not expose a direct unsubscribe API for all metrics; rely on page lifecycle.
    state.started = false;
  },
  async collectMetrics() {
    return generateMetrics();
  },
  async reportMetrics(metrics: PerformanceMetrics) {
    if (state.config.debug) {
      // eslint-disable-next-line no-console
      console.debug('[performance] metrics', metrics);
    }
    const results = checkPerformanceBudget(metrics, state.budget);
    results.forEach(r => {
      if (r.status === 'failed') {
        state.budgetListeners.forEach(bl => {
          try { bl(r); } catch { /* ignore */ }
        });
      }
    });
  },
  trackWebVitals() {
    this.startMonitoring();
  },
  onWebVital(callback) {
    state.listeners.push(callback);
    return () => {
      state.listeners = state.listeners.filter(l => l !== callback);
    };
  },
  trackCustomMetric(name: string, value: number) {
    if (name in state.webVitals) {
      // @ts-expect-error dynamic assignment to partial webVitals
      state.webVitals[name] = value;
      notifyWebVital(name as keyof WebVitals, value);
    }
  },
  startTiming(name: string) {
    const start = performance.now();
    state.timings[name] = start;
    return () => {
      const end = performance.now();
      const duration = end - start;
      this.trackCustomMetric(name as keyof WebVitals as string, duration);
      return duration;
    };
  },
  setBudgets(budgets: Partial<PerformanceBudget>) {
    state.budget = { ...state.budget, ...budgets };
  },
  checkBudgets(metrics: PerformanceMetrics) {
    return checkPerformanceBudget(metrics, state.budget);
  },
  onBudgetExceeded(callback) {
    state.budgetListeners.push(callback);
    return () => {
      state.budgetListeners = state.budgetListeners.filter(l => l !== callback);
    };
  },
  enableAnalytics(_provider, _config) {
    // Placeholder for future integration (GA4 / custom endpoint)
  },
  disableAnalytics() {
    // Placeholder
  },
  configure(config) {
    state.config = { ...state.config, ...config };
  },
  getConfig() {
    return state.config;
  },
};

export const performanceService = performanceMonitor;
export type { PerformanceMetrics };

// Convenience helper to get a quick snapshot plus score
export const getCurrentPerformanceSnapshot = async () => {
  const metrics = await performanceService.collectMetrics();
  const score = calculatePerformanceScore(metrics.webVitals);
  return { metrics, score };
};

export default performanceService;