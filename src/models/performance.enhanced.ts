/**
 * Enhanced Performance Model
 *
 * Provides comprehensive type definitions for Web Vitals tracking,
 * performance budgets, analytics reporting, and performance monitoring for v1 release
 */

// Core Web Vitals Types
export interface WebVitals {
  // Core Web Vitals
  cls: number; // Cumulative Layout Shift (0-1, target < 0.1)
  fid: number; // First Input Delay (milliseconds, target < 100ms)
  lcp: number; // Largest Contentful Paint (milliseconds, target < 2500ms)

  // Supporting metrics
  fcp: number; // First Contentful Paint (milliseconds, target < 1800ms)
  ttfb: number; // Time to First Byte (milliseconds, target < 600ms)
  tbt: number; // Total Blocking Time (milliseconds, target < 200ms)
  si: number; // Speed Index (milliseconds, target < 3400ms)

  // Additional metrics
  domContentLoaded: number; // DOM Content Loaded time
  loadComplete: number; // Full page load time
  firstPaint: number; // First Paint time
  firstMeaningfulPaint: number; // First Meaningful Paint time
}

// Performance Metrics Types
export interface PerformanceMetrics {
  // Web Vitals
  webVitals: WebVitals;

  // Custom application metrics
  navigationTiming: NavigationTiming;
  resourceTiming: ResourceTiming[];
  paintTiming: PaintTiming;
  memoryUsage?: MemoryUsage;
  networkInfo?: NetworkInfo;

  // Application-specific metrics
  appMetrics: AppPerformanceMetrics;

  // Metadata
  timestamp: string;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
  viewport: ViewportInfo;
  connection: ConnectionInfo;
}

export interface NavigationTiming {
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart?: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;

  // Calculated metrics
  dnsLookup: number;
  tcpConnect: number;
  serverResponse: number;
  pageLoad: number;
  domProcessing: number;
  totalTime: number;
}

export interface ResourceTiming {
  name: string;
  initiatorType: string;
  startTime: number;
  duration: number;
  fetchStart: number;
  domainLookupStart?: number;
  domainLookupEnd?: number;
  connectStart?: number;
  connectEnd?: number;
  secureConnectionStart?: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  transferSize?: number;
  encodedBodySize?: number;
  decodedBodySize?: number;
  nextHopProtocol?: string;
}

export interface PaintTiming {
  firstPaint: number;
  firstContentfulPaint: number;
  firstMeaningfulPaint?: number;
  largestContentfulPaint?: number;
}

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedMemory?: number; // Chrome only
  availableMemory?: number; // Chrome only
}

export interface NetworkInfo {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number; // Mbps
  rtt: number; // milliseconds
  saveData: boolean;
}

export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation?: 'portrait' | 'landscape';
}

export interface ConnectionInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface AppPerformanceMetrics {
  // User interaction metrics
  timeToFirstSignIn?: number;
  timeToFirstAssignment?: number;
  timeToFirstRender: number;
  timeToInteractive: number;

  // Navigation metrics
  navigationTime: number;
  routeChangeTime?: number;

  // Component metrics
  componentRenderTime: Record<string, number>;
  componentMountTime: Record<string, number>;

  // Bundle metrics
  bundleSize: number;
  chunksLoaded: number;
  codeSplittingEfficiency: number;

  // Cache metrics
  cacheHitRate?: number;
  serviceWorkerCacheHits?: number;

  // Error metrics
  jsErrors: number;
  networkErrors: number;
  unhandledRejections: number;
}

// Performance Budget Types
export interface PerformanceBudget {
  // Core Web Vitals budgets
  lcp: number; // milliseconds
  fid: number; // milliseconds
  cls: number; // score (0-1)
  fcp: number; // milliseconds
  ttfb: number; // milliseconds
  tbt: number; // milliseconds

  // Bundle budgets
  bundleSize: number; // bytes
  initialBundleSize: number; // bytes
  vendorBundleSize: number; // bytes

  // Resource budgets
  totalRequests: number;
  imageSize: number; // bytes
  fontSize: number; // bytes
  cssSize: number; // bytes
  jsSize: number; // bytes

  // Custom budgets
  customBudgets: Record<string, number>;
}

export interface BudgetResult {
  metric: string;
  budget: number;
  actual: number;
  status: 'passed' | 'warning' | 'failed';
  difference: number;
  percentage: number;
}

export interface PerformanceBudgetReport {
  timestamp: string;
  budgets: PerformanceBudget;
  results: BudgetResult[];
  overallStatus: 'passed' | 'warning' | 'failed';
  recommendations: string[];
}

// Performance Analytics Types
export interface PerformanceAnalytics {
  // Summary statistics
  summary: PerformanceSummary;

  // Trend analysis
  trends: PerformanceTrends;

  // Distribution analysis
  distributions: PerformanceDistributions;

  // User experience scores
  scores: PerformanceScores;

  // Time range
  timeRange: {
    start: string;
    end: string;
    granularity: 'minute' | 'hour' | 'day' | 'week';
  };

  // Filters
  filters: {
    page?: string[];
    device?: string[];
    browser?: string[];
    country?: string[];
  };
}

export interface PerformanceSummary {
  totalSessions: number;
  averageLCP: number;
  averageFID: number;
  averageCLS: number;
  p75LCP: number;
  p75FID: number;
  p75CLS: number;
  goodLCP: number; // percentage
  goodFID: number; // percentage
  goodCLS: number; // percentage
  poorLCP: number; // percentage
  poorFID: number; // percentage
  poorCLS: number; // percentage
}

export interface PerformanceTrends {
  lcp: TrendData;
  fid: TrendData;
  cls: TrendData;
  pageLoad: TrendData;
  jsErrors: TrendData;
}

export interface TrendData {
  data: Array<{ timestamp: string; value: number }>;
  change: number; // percentage change
  trend: 'improving' | 'degrading' | 'stable';
  confidence: number; // 0-1
}

export interface PerformanceDistributions {
  lcp: DistributionData;
  fid: DistributionData;
  cls: DistributionData;
  pageLoad: DistributionData;
}

export interface DistributionData {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface PerformanceScores {
  overall: number; // 0-100
  webVitals: number; // 0-100
  userExperience: number; // 0-100
  technical: number; // 0-100
  accessibility: number; // 0-100
}

// Performance Monitoring Types
export interface PerformanceMonitor {
  // Core monitoring methods
  startMonitoring(): void;
  stopMonitoring(): void;
  collectMetrics(): Promise<PerformanceMetrics>;
  reportMetrics(metrics: PerformanceMetrics): Promise<void>;

  // Web Vitals tracking
  trackWebVitals(): void;
  onWebVital(callback: (metric: keyof WebVitals, value: number) => void): () => void;

  // Custom metrics
  trackCustomMetric(name: string, value: number): void;
  startTiming(name: string): () => number; // returns end timing function

  // Performance budgets
  setBudgets(budgets: Partial<PerformanceBudget>): void;
  checkBudgets(metrics: PerformanceMetrics): BudgetResult[];
  onBudgetExceeded(callback: (result: BudgetResult) => void): () => void;

  // Analytics integration
  enableAnalytics(provider: 'google' | 'custom', config?: any): void;
  disableAnalytics(): void;

  // Configuration
  configure(config: PerformanceMonitorConfig): void;
  getConfig(): PerformanceMonitorConfig;
}

export interface PerformanceMonitorConfig {
  enabled: boolean;
  samplingRate: number; // 0-1
  reportInterval: number; // milliseconds
  batchSize: number;
  maxRetries: number;
  timeout: number; // milliseconds
  debug: boolean;
  environment: 'development' | 'staging' | 'production';
}

// Performance Alert Types
export interface PerformanceAlert {
  id: string;
  type: 'budget_exceeded' | 'regression' | 'anomaly' | 'threshold';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  threshold: number;
  actual: number;
  message: string;
  recommendations: string[];
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  context: {
    page: string;
    userAgent: string;
    sessionId: string;
    userId?: string;
  };
}

export interface PerformanceAlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  duration: number; // minutes
  severity: PerformanceAlert['severity'];
  enabled: boolean;
  cooldown: number; // minutes
  channels: ('console' | 'analytics' | 'webhook')[];
}

// Performance Optimization Types
export interface PerformanceOptimization {
  id: string;
  type: 'bundle_splitting' | 'image_optimization' | 'caching' | 'lazy_loading' | 'code_splitting' | 'compression';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  metrics: {
    before: number;
    after?: number;
    improvement?: number;
  };
  implementation: {
    files: string[];
    changes: string[];
    rollback?: string[];
  };
  createdAt: string;
  completedAt?: string;
}

// Performance Report Types
export interface PerformanceReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  timeRange: {
    start: string;
    end: string;
  };
  summary: PerformanceSummary;
  trends: PerformanceTrends;
  alerts: PerformanceAlert[];
  optimizations: PerformanceOptimization[];
  recommendations: PerformanceRecommendation[];
  generatedAt: string;
}

export interface PerformanceRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'web_vitals' | 'bundle' | 'resources' | 'code' | 'infrastructure';
  title: string;
  description: string;
  impact: string;
  effort: string;
  implementation: string[];
  metrics: Record<string, number>;
}

// Real User Monitoring Types
export interface RUMEvent {
  id: string;
  type: 'page_view' | 'user_interaction' | 'error' | 'performance_metric';
  timestamp: string;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
  viewport: ViewportInfo;
  connection: ConnectionInfo;
  data: Record<string, any>;
}

export interface RUMSession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  interactions: number;
  errors: number;
  performanceScore: number;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
  };
}

// Default Values
export const DEFAULT_WEB_VITALS_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
  tbt: { good: 200, poor: 600 },
  si: { good: 3400, poor: 5800 },
} as const;

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800,
  ttfb: 600,
  tbt: 200,
  bundleSize: 512000, // 500KB
  initialBundleSize: 256000, // 250KB
  vendorBundleSize: 1024000, // 1MB
  totalRequests: 50,
  imageSize: 1048576, // 1MB
  fontSize: 102400, // 100KB
  cssSize: 51200, // 50KB
  jsSize: 1024000, // 1MB
  customBudgets: {},
};

export const DEFAULT_PERFORMANCE_MONITOR_CONFIG: PerformanceMonitorConfig = {
  enabled: true,
  samplingRate: 1.0,
  reportInterval: 30000, // 30 seconds
  batchSize: 10,
  maxRetries: 3,
  timeout: 5000,
  debug: false,
  environment: 'development',
};

// Utility Functions
export const isWebVital = (metric: string): metric is keyof WebVitals => {
  return ['cls', 'fid', 'lcp', 'fcp', 'ttfb', 'tbt', 'si', 'domContentLoaded', 'loadComplete', 'firstPaint', 'firstMeaningfulPaint'].includes(metric);
};

export const getWebVitalRating = (metric: keyof WebVitals, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = DEFAULT_WEB_VITALS_THRESHOLDS[metric as keyof typeof DEFAULT_WEB_VITALS_THRESHOLDS];
  if (!thresholds) return 'good';

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

export const calculatePerformanceScore = (metrics: Partial<WebVitals>): number => {
  const weights = { lcp: 0.25, fid: 0.25, cls: 0.25, fcp: 0.15, ttfb: 0.10 };
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([metric, weight]) => {
    const value = metrics[metric as keyof WebVitals];
    if (value !== undefined) {
      const rating = getWebVitalRating(metric as keyof WebVitals, value);
      const score = rating === 'good' ? 100 : rating === 'needs-improvement' ? 50 : 0;
      totalScore += score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};

export const checkPerformanceBudget = (metrics: PerformanceMetrics, budget: PerformanceBudget): BudgetResult[] => {
  const results: BudgetResult[] = [];

  // Web Vitals budgets
  if (metrics.webVitals.lcp > budget.lcp) {
    results.push({
      metric: 'lcp',
      budget: budget.lcp,
      actual: metrics.webVitals.lcp,
      status: 'failed',
      difference: metrics.webVitals.lcp - budget.lcp,
      percentage: ((metrics.webVitals.lcp - budget.lcp) / budget.lcp) * 100,
    });
  }

  if (metrics.webVitals.fid > budget.fid) {
    results.push({
      metric: 'fid',
      budget: budget.fid,
      actual: metrics.webVitals.fid,
      status: 'failed',
      difference: metrics.webVitals.fid - budget.fid,
      percentage: ((metrics.webVitals.fid - budget.fid) / budget.fid) * 100,
    });
  }

  if (metrics.webVitals.cls > budget.cls) {
    results.push({
      metric: 'cls',
      budget: budget.cls,
      actual: metrics.webVitals.cls,
      status: 'failed',
      difference: metrics.webVitals.cls - budget.cls,
      percentage: ((metrics.webVitals.cls - budget.cls) / budget.cls) * 100,
    });
  }

  // Bundle size budgets
  if (metrics.appMetrics.bundleSize > budget.bundleSize) {
    results.push({
      metric: 'bundleSize',
      budget: budget.bundleSize,
      actual: metrics.appMetrics.bundleSize,
      status: 'failed',
      difference: metrics.appMetrics.bundleSize - budget.bundleSize,
      percentage: ((metrics.appMetrics.bundleSize - budget.bundleSize) / budget.bundleSize) * 100,
    });
  }

  // Custom budgets
  Object.entries(budget.customBudgets).forEach(([metric, budgetValue]) => {
    const actualValue = metrics.appMetrics[metric as keyof AppPerformanceMetrics] as number;
    if (actualValue && actualValue > budgetValue) {
      results.push({
        metric,
        budget: budgetValue,
        actual: actualValue,
        status: 'failed',
        difference: actualValue - budgetValue,
        percentage: ((actualValue - budgetValue) / budgetValue) * 100,
      });
    }
  });

  return results;
};

export const createPerformanceAlert = (
  type: PerformanceAlert['type'],
  metric: string,
  threshold: number,
  actual: number,
  context: PerformanceAlert['context']
): Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'> => {
  const severity = actual > threshold * 2 ? 'critical' : actual > threshold * 1.5 ? 'high' : 'medium';

  return {
    type,
    severity,
    metric,
    threshold,
    actual,
    message: `${metric} exceeded threshold: ${actual} > ${threshold}`,
    recommendations: generatePerformanceRecommendations(metric, actual, threshold),
    context,
  };
};

const generatePerformanceRecommendations = (metric: string, actual: number, threshold: number): string[] => {
  const recommendations: string[] = [];

  switch (metric) {
    case 'lcp':
      recommendations.push('Optimize largest contentful paint by improving image loading and reducing render-blocking resources');
      if (actual > 4000) {
        recommendations.push('Consider implementing critical CSS and deferring non-critical styles');
      }
      break;
    case 'fid':
      recommendations.push('Reduce JavaScript execution time and break up long tasks');
      recommendations.push('Use web workers for heavy computations');
      break;
    case 'cls':
      recommendations.push('Ensure images and ads have explicit dimensions');
      recommendations.push('Avoid inserting content above existing content');
      break;
    case 'bundleSize':
      recommendations.push('Implement code splitting and lazy loading');
      recommendations.push('Remove unused dependencies and tree-shake code');
      break;
    default:
      recommendations.push(`Optimize ${metric} performance`);
  }

  return recommendations;
};