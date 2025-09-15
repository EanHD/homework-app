import {
  AppError,
  ErrorLog,
  ErrorLogQuery,
  ErrorLogResult,
  ErrorHandlingConfig,
  DEFAULT_ERROR_HANDLING_CONFIG,
  createError,
  isAppError,
  generateErrorFingerprint,
  calculateRetryDelay,
  isRetryableError,
  formatErrorForUser,
} from '../models/errors.enhanced';

type ErrorListener = (error: AppError) => void;
type LogListener = (log: ErrorLog) => void;

interface InternalState {
  config: ErrorHandlingConfig;
  errors: AppError[];
  logs: ErrorLog[];
  listeners: Set<ErrorListener>;
  logListeners: Set<LogListener>;
  suppressedFingerprints: Record<string, number>; // fingerprint -> timestamp
}

const state: InternalState = {
  config: { ...DEFAULT_ERROR_HANDLING_CONFIG },
  errors: [],
  logs: [],
  listeners: new Set(),
  logListeners: new Set(),
  suppressedFingerprints: {},
};

// Utility: suppression check
const isSuppressed = (fingerprint: string): boolean => {
  if (!state.config.suppressDuplicates) return false;
  const ts = state.suppressedFingerprints[fingerprint];
  if (!ts) return false;
  const windowMs = state.config.suppressionWindow * 60 * 1000;
  return Date.now() - ts < windowMs;
};

const rememberSuppression = (fingerprint: string) => {
  state.suppressedFingerprints[fingerprint] = Date.now();
};

// Core logging
const logInternal = (error: AppError): ErrorLog => {
  const log: ErrorLog = {
    error,
    reported: false,
    acknowledged: false,
    resolved: false,
    notes: [],
  };
  state.logs.push(log);
  // Trim log buffer
  if (state.logs.length > state.config.maxErrors) state.logs.shift();
  state.logListeners.forEach(l => {
    try { l(log); } catch { /* ignore */ }
  });
  return log;
};

// Public API
export const errorTrackingService = {
  onError(listener: ErrorListener) {
    state.listeners.add(listener);
    return () => state.listeners.delete(listener);
  },
  onLog(listener: LogListener) {
    state.logListeners.add(listener);
    return () => state.logListeners.delete(listener);
  },
  getConfig(): ErrorHandlingConfig {
    return state.config;
  },
  async updateConfig(partial: Partial<ErrorHandlingConfig>) {
    state.config = { ...state.config, ...partial };
  },
  create(type: AppError['type'], message: string, context?: Partial<AppError['context']>): AppError {
    return createError(type, message, { context });
  },
  async capture(error: unknown, options?: { context?: Partial<AppError['context']>; severity?: AppError['severity']; category?: AppError['category']; userMessage?: string }) {
    let appError: AppError;
    if (isAppError(error)) {
      appError = error;
    } else if (error instanceof Error) {
      appError = createError('UnknownError', error.message, { context: options?.context });
      appError.stack = error.stack;
    } else {
      appError = createError('UnknownError', String(error), { context: options?.context });
    }

    if (options?.severity) appError.severity = options.severity;
    if (options?.category) appError.category = options.category;
    if (options?.userMessage) appError.userMessage = options.userMessage;

    // Suppression
    if (isSuppressed(appError.fingerprint)) return appError;
    rememberSuppression(appError.fingerprint);

    state.errors.push(appError);
    if (state.errors.length > state.config.maxErrors) state.errors.shift();
    logInternal(appError);
    state.listeners.forEach(l => { try { l(appError); } catch { /* ignore */ } });
    return appError;
  },
  async getErrors(query?: ErrorLogQuery): Promise<ErrorLogResult> {
    let logs = [...state.logs];
    if (query?.severity) logs = logs.filter(l => query.severity!.includes(l.error.severity));
    if (query?.category) logs = logs.filter(l => query.category!.includes(l.error.category));
    if (query?.type) logs = logs.filter(l => query.type!.includes(l.error.type));
    if (query?.fingerprint) logs = logs.filter(l => l.error.fingerprint === query.fingerprint);
    if (query?.userId) logs = logs.filter(l => l.error.userId === query.userId);
    if (query?.sessionId) logs = logs.filter(l => l.error.sessionId === query.sessionId);
    if (query?.resolved !== undefined) logs = logs.filter(l => l.resolved === query.resolved);

    const total = logs.length;
    const limit = query?.limit ?? 100;
    const offset = query?.offset ?? 0;
    const paged = logs.slice(offset, offset + limit);

    const aggregations = {
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<AppError['severity'], number>,
      byCategory: {} as Record<AppError['category'], number>,
      byType: {} as Record<AppError['type'], number>,
      byDate: {} as Record<string, number>,
    };
    logs.forEach(l => {
      aggregations.bySeverity[l.error.severity]++;
      aggregations.byCategory[l.error.category] = (aggregations.byCategory[l.error.category] || 0) + 1;
      aggregations.byType[l.error.type] = (aggregations.byType[l.error.type] || 0) + 1;
      const day = l.error.timestamp.slice(0, 10);
      aggregations.byDate[day] = (aggregations.byDate[day] || 0) + 1;
    });

    return { logs: paged, total, hasMore: offset + limit < total, aggregations };
  },
  async resolve(errorId: string, resolution?: string) {
    const log = state.logs.find(l => l.error.id === errorId);
    if (log) {
      log.resolved = true;
      log.resolvedAt = new Date().toISOString();
      log.resolution = resolution;
    }
  },
  async acknowledge(errorId: string) {
    const log = state.logs.find(l => l.error.id === errorId);
    if (log) {
      log.acknowledged = true;
      log.acknowledgedAt = new Date().toISOString();
    }
  },
  formatUserMessage(error: AppError) {
    return formatErrorForUser(error);
  },
};

// Global listeners (attach once)
let globalAttached = false;
const attachGlobalHandlers = () => {
  if (globalAttached) return;
  globalAttached = true;
  window.addEventListener('error', evt => {
    if (evt.error) errorTrackingService.capture(evt.error, { category: 'system' });
  });
  window.addEventListener('unhandledrejection', evt => {
    if ((evt as PromiseRejectionEvent).reason) {
      errorTrackingService.capture((evt as PromiseRejectionEvent).reason, { category: 'system' });
    }
  });
};

attachGlobalHandlers();

export default errorTrackingService;