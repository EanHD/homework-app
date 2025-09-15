/**
 * Enhanced Error Model
 *
 * Provides comprehensive type definitions for error categorization,
 * user-friendly messaging, retry strategies, and error tracking for v1 release
 */

// Core Error Types
export interface AppError {
  id: string;
  code: string;
  type: ErrorType;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  userMessage: string;
  description?: string;
  context: ErrorContext;
  cause?: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  fingerprint: string; // for deduplication
  tags: string[];
  metadata: Record<string, any>;
  retry?: RetryConfig;
  recovery?: RecoveryAction[];
}

export type ErrorType = 
  | 'ValidationError'
  | 'AuthenticationError'
  | 'AuthorizationError'
  | 'NetworkError'
  | 'DatabaseError'
  | 'ServerError'
  | 'ClientError'
  | 'NotFoundError'
  | 'TimeoutError'
  | 'RateLimitError'
  | 'ConfigurationError'
  | 'PermissionError'
  | 'IntegrationError'
  | 'UnknownError';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ErrorCategory = 
  | 'auth'
  | 'data'
  | 'network'
  | 'ui'
  | 'performance'
  | 'integration'
  | 'validation'
  | 'system'
  | 'user_action'
  | 'third_party';

export interface ErrorContext {
  // Application context
  version: string;
  environment: 'development' | 'staging' | 'production';
  feature: string;
  page: string;
  component?: string;
  action: string;

  // Technical context
  userAgent: string;
  url: string;
  referrer?: string;
  viewport: {
    width: number;
    height: number;
  };
  connection?: {
    type: string;
    effectiveType: string;
  };

  // User context
  isAuthenticated: boolean;
  userRole?: string;
  subscriptionTier?: string;
  locale: string;
  timezone: string;

  // State context
  appState?: Record<string, any>;
  formData?: Record<string, any>;
  queryParams?: Record<string, any>;
  localStorage?: Record<string, any>;

  // Performance context
  memoryUsage?: number;
  performanceMetrics?: {
    timing: number;
    memory: number;
    network: number;
  };
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'linear' | 'exponential';
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  jitter: boolean;
  retryCondition?: (error: AppError) => boolean;
  onRetry?: (attempt: number, error: AppError) => void;
}

export interface RecoveryAction {
  id: string;
  type: 'retry' | 'fallback' | 'redirect' | 'reload' | 'logout' | 'custom';
  label: string;
  description?: string;
  priority: number;
  enabled: boolean;
  automatic?: boolean;
  delay?: number; // milliseconds
  action?: () => void | Promise<void>;
  condition?: (error: AppError) => boolean;
}

// Error Logging Types
export interface ErrorLog {
  error: AppError;
  reported: boolean;
  reportedAt?: string;
  reportingService?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
  notes: string[];
}

export interface ErrorLogQuery {
  severity?: ErrorSeverity[];
  category?: ErrorCategory[];
  type?: ErrorType[];
  userId?: string;
  sessionId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  fingerprint?: string;
  tags?: string[];
  resolved?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'frequency';
  sortOrder?: 'asc' | 'desc';
}

export interface ErrorLogResult {
  logs: ErrorLog[];
  total: number;
  hasMore: boolean;
  aggregations: {
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    byType: Record<ErrorType, number>;
    byDate: Record<string, number>;
  };
}

// Error Analytics Types
export interface ErrorAnalytics {
  summary: ErrorSummary;
  trends: ErrorTrends;
  topErrors: TopErrorInfo[];
  userImpact: UserImpactMetrics;
  resolution: ResolutionMetrics;
  timeRange: {
    start: string;
    end: string;
    granularity: 'minute' | 'hour' | 'day' | 'week';
  };
}

export interface ErrorSummary {
  totalErrors: number;
  uniqueErrors: number;
  affectedUsers: number;
  errorRate: number; // errors per user session
  criticalErrors: number;
  resolvedErrors: number;
  avgResolutionTime: number; // minutes
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
}

export interface ErrorTrends {
  errorRate: TrendData;
  uniqueErrors: TrendData;
  resolution: TrendData;
  userImpact: TrendData;
}

export interface TrendData {
  data: Array<{ timestamp: string; value: number }>;
  change: number; // percentage change
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number; // 0-1
}

export interface TopErrorInfo {
  fingerprint: string;
  message: string;
  type: ErrorType;
  category: ErrorCategory;
  severity: ErrorSeverity;
  count: number;
  affectedUsers: number;
  firstSeen: string;
  lastSeen: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  resolved: boolean;
  avgResolutionTime?: number;
}

export interface UserImpactMetrics {
  totalAffectedUsers: number;
  criticallyAffectedUsers: number;
  userErrorRate: number;
  sessionErrorRate: number;
  bounceRateIncrease: number;
  satisfactionImpact: number;
  retentionImpact: number;
}

export interface ResolutionMetrics {
  totalResolved: number;
  averageResolutionTime: number;
  resolutionRate: number; // percentage
  escalationRate: number; // percentage
  reopenRate: number; // percentage
  resolutionsByCategory: Record<ErrorCategory, number>;
  resolutionTrends: Record<string, number>;
}

// Error Handling Types
export interface ErrorHandler {
  canHandle(error: Error | AppError): boolean;
  handle(error: Error | AppError): Promise<AppError>;
  priority: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: any;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: AppError, errorInfo: any) => void;
  onReset?: () => void;
}

export interface ErrorFallbackProps {
  error: AppError;
  resetError: () => void;
  retry?: () => void;
}

export interface GlobalErrorState {
  errors: AppError[];
  currentError: AppError | null;
  isShowingErrorDialog: boolean;
  dismissedErrors: string[];
  suppressedCategories: ErrorCategory[];
  reportingEnabled: boolean;
  config: ErrorHandlingConfig;
}

export interface ErrorHandlingConfig {
  enabled: boolean;
  autoReport: boolean;
  maxErrors: number;
  suppressDuplicates: boolean;
  suppressionWindow: number; // minutes
  notificationTypes: ErrorNotificationType[];
  severityThresholds: Record<ErrorSeverity, boolean>;
  categories: Record<ErrorCategory, ErrorCategoryConfig>;
  integrations: ErrorIntegrationConfig[];
}

export interface ErrorCategoryConfig {
  enabled: boolean;
  autoReport: boolean;
  userNotification: boolean;
  retryable: boolean;
  defaultRetryConfig?: RetryConfig;
  fallbackActions: RecoveryAction[];
}

export interface ErrorIntegrationConfig {
  type: 'sentry' | 'bugsnag' | 'rollbar' | 'custom';
  enabled: boolean;
  dsn?: string;
  apiKey?: string;
  config?: Record<string, any>;
}

export type ErrorNotificationType = 'toast' | 'banner' | 'modal' | 'console' | 'none';

// Error Service Types
export interface ErrorService {
  // Error creation and handling
  createError(type: ErrorType, message: string, context?: Partial<ErrorContext>): AppError;
  handleError(error: Error | AppError): Promise<void>;
  reportError(error: AppError): Promise<void>;

  // Error logging
  logError(error: AppError): Promise<void>;
  getErrors(query?: ErrorLogQuery): Promise<ErrorLogResult>;
  resolveError(errorId: string, resolution?: string): Promise<void>;
  acknowledgeError(errorId: string): Promise<void>;

  // Error analytics
  getAnalytics(timeRange?: { start: string; end: string }): Promise<ErrorAnalytics>;
  getTopErrors(limit?: number): Promise<TopErrorInfo[]>;

  // Configuration
  updateConfig(config: Partial<ErrorHandlingConfig>): Promise<void>;
  getConfig(): Promise<ErrorHandlingConfig>;

  // Notifications
  showErrorNotification(error: AppError): void;
  dismissError(errorId: string): void;
  suppressCategory(category: ErrorCategory, duration?: number): void;

  // Retry and recovery
  retryAction(errorId: string): Promise<void>;
  executeRecoveryAction(errorId: string, actionId: string): Promise<void>;
}

// Specific Error Definitions
export interface ValidationError extends AppError {
  type: 'ValidationError';
  field?: string;
  value?: any;
  constraints: string[];
  validationRule: string;
}

export interface NetworkError extends AppError {
  type: 'NetworkError';
  status?: number;
  statusText?: string;
  response?: any;
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
  timeout?: boolean;
  offline?: boolean;
}

export interface AuthenticationError extends AppError {
  type: 'AuthenticationError';
  provider?: string;
  reason: 'invalid_credentials' | 'token_expired' | 'session_invalid' | 'account_locked' | 'unknown';
  redirectUrl?: string;
}

export interface AuthorizationError extends AppError {
  type: 'AuthorizationError';
  resource: string;
  action: string;
  requiredPermissions: string[];
  userPermissions: string[];
}

// Default Values
export const DEFAULT_ERROR_HANDLING_CONFIG: ErrorHandlingConfig = {
  enabled: true,
  autoReport: true,
  maxErrors: 100,
  suppressDuplicates: true,
  suppressionWindow: 5, // 5 minutes
  notificationTypes: ['toast'],
  severityThresholds: {
    critical: true,
    high: true,
    medium: true,
    low: false,
    info: false,
  },
  categories: {
    auth: {
      enabled: true,
      autoReport: true,
      userNotification: true,
      retryable: false,
      fallbackActions: [],
    },
    data: {
      enabled: true,
      autoReport: true,
      userNotification: true,
      retryable: true,
      defaultRetryConfig: {
        enabled: true,
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 30000,
        jitter: true,
      },
      fallbackActions: [],
    },
    network: {
      enabled: true,
      autoReport: true,
      userNotification: true,
      retryable: true,
      defaultRetryConfig: {
        enabled: true,
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 30000,
        jitter: true,
      },
      fallbackActions: [],
    },
    ui: {
      enabled: true,
      autoReport: false,
      userNotification: false,
      retryable: false,
      fallbackActions: [],
    },
    performance: {
      enabled: true,
      autoReport: true,
      userNotification: false,
      retryable: false,
      fallbackActions: [],
    },
    integration: {
      enabled: true,
      autoReport: true,
      userNotification: true,
      retryable: true,
      defaultRetryConfig: {
        enabled: true,
        maxAttempts: 2,
        backoffStrategy: 'linear',
        baseDelay: 2000,
        maxDelay: 10000,
        jitter: false,
      },
      fallbackActions: [],
    },
    validation: {
      enabled: true,
      autoReport: false,
      userNotification: true,
      retryable: false,
      fallbackActions: [],
    },
    system: {
      enabled: true,
      autoReport: true,
      userNotification: true,
      retryable: false,
      fallbackActions: [],
    },
    user_action: {
      enabled: true,
      autoReport: false,
      userNotification: true,
      retryable: true,
      fallbackActions: [],
    },
    third_party: {
      enabled: true,
      autoReport: true,
      userNotification: true,
      retryable: true,
      defaultRetryConfig: {
        enabled: true,
        maxAttempts: 2,
        backoffStrategy: 'fixed',
        baseDelay: 3000,
        maxDelay: 3000,
        jitter: false,
      },
      fallbackActions: [],
    },
  },
  integrations: [],
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  enabled: true,
  maxAttempts: 3,
  backoffStrategy: 'exponential',
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: true,
};

export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  SESSION_INVALID: 'Your session is invalid. Please sign in again.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked. Please try again later or contact support.',

  // Authorization errors
  INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action.",
  RESOURCE_ACCESS_DENIED: "You don't have access to this resource.",

  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',
  SERVER_ERROR: 'A server error occurred. Our team has been notified.',
  NOT_FOUND: 'The requested resource was not found.',

  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_FORMAT: 'The format is invalid.',
  VALUE_TOO_SHORT: 'Value is too short.',
  VALUE_TOO_LONG: 'Value is too long.',

  // General errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  MAINTENANCE_MODE: 'The service is temporarily unavailable for maintenance.',
} as const;

// Utility Functions
export const createError = (
  type: ErrorType,
  message: string,
  options: {
    code?: string;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    userMessage?: string;
    context?: Partial<ErrorContext>;
    cause?: string;
    metadata?: Record<string, any>;
  } = {}
): AppError => {
  const {
    code = type,
    severity = 'medium',
    category = 'system',
    userMessage = message,
    context = {},
    cause,
    metadata = {},
  } = options;

  const timestamp = new Date().toISOString();
  const fingerprint = generateErrorFingerprint(type, message, context);

  return {
    id: generateId(),
    code,
    type,
    severity,
    category,
    message,
    userMessage,
    context: {
      version: '1.0.0',
      environment: 'development',
      feature: 'unknown',
      page: window?.location?.pathname || 'unknown',
      action: 'unknown',
      userAgent: navigator?.userAgent || 'unknown',
      url: window?.location?.href || 'unknown',
      viewport: {
        width: window?.innerWidth || 0,
        height: window?.innerHeight || 0,
      },
      isAuthenticated: false,
      locale: navigator?.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...context,
    },
    cause,
    timestamp,
    sessionId: getSessionId(),
    fingerprint,
    tags: [],
    metadata,
  };
};

export const generateErrorFingerprint = (type: ErrorType, message: string, context: Partial<ErrorContext>): string => {
  const components = [
    type,
    message.replace(/\d+/g, '[NUMBER]').replace(/[a-f0-9-]{36}/g, '[UUID]'),
    context.page || 'unknown',
    context.component || 'unknown',
  ];
  
  return btoa(components.join('|')).slice(0, 16);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const getSessionId = (): string => {
  // In a real app, this would come from your session management
  return sessionStorage.getItem('sessionId') || generateId();
};

export const isRetryableError = (error: AppError): boolean => {
  const retryableTypes: ErrorType[] = [
    'NetworkError',
    'TimeoutError',
    'ServerError',
    'DatabaseError',
    'IntegrationError',
  ];

  return retryableTypes.includes(error.type);
};

export const shouldSuppressError = (error: AppError, suppressedErrors: string[], suppressionWindow: number): boolean => {
  const now = Date.now();
  const errorTime = new Date(error.timestamp).getTime();
  const windowMs = suppressionWindow * 60 * 1000;

  return suppressedErrors.includes(error.fingerprint) && (now - errorTime) < windowMs;
};

export const calculateRetryDelay = (attempt: number, config: RetryConfig): number => {
  let delay: number;

  switch (config.backoffStrategy) {
    case 'fixed':
      delay = config.baseDelay;
      break;
    case 'linear':
      delay = config.baseDelay * attempt;
      break;
    case 'exponential':
      delay = config.baseDelay * Math.pow(2, attempt - 1);
      break;
    default:
      delay = config.baseDelay;
  }

  if (config.jitter) {
    delay += Math.random() * 1000;
  }

  return Math.min(delay, config.maxDelay);
};

export const formatErrorForUser = (error: AppError): string => {
  // Return user-friendly message based on error type and context
  if (error.userMessage) {
    return error.userMessage;
  }

  // Fallback to predefined messages
  switch (error.type) {
    case 'AuthenticationError':
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    case 'AuthorizationError':
      return ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS;
    case 'NetworkError':
      return ERROR_MESSAGES.NETWORK_ERROR;
    case 'TimeoutError':
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    case 'ValidationError':
      return ERROR_MESSAGES.INVALID_FORMAT;
    case 'RateLimitError':
      return ERROR_MESSAGES.RATE_LIMITED;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Type Guards
export const isAppError = (obj: any): obj is AppError => {
  return obj && typeof obj === 'object' && 'id' in obj && 'type' in obj && 'severity' in obj;
};

export const isValidationError = (error: AppError): error is ValidationError => {
  return error.type === 'ValidationError';
};

export const isNetworkError = (error: AppError): error is NetworkError => {
  return error.type === 'NetworkError';
};

export const isAuthenticationError = (error: AppError): error is AuthenticationError => {
  return error.type === 'AuthenticationError';
};

export const isAuthorizationError = (error: AppError): error is AuthorizationError => {
  return error.type === 'AuthorizationError';
};