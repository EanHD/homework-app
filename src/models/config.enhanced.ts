/**
 * Enhanced Configuration Model
 *
 * Provides comprehensive type definitions for environment-aware configuration,
 * OAuth settings, feature flags, and runtime configuration management for v1 release
 */

// Environment Types
export type Environment = 'development' | 'staging' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// Base Configuration Interface
export interface AppConfig {
  // Environment and deployment
  environment: Environment;
  version: string;
  buildId: string;
  buildDate: string;
  commitHash?: string;

  // URLs and endpoints
  baseUrl: string;
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;

  // OAuth configuration
  oauth: OAuthConfig;

  // Feature flags
  features: FeatureFlags;

  // Performance settings
  performance: PerformanceConfig;

  // UI/UX settings
  ui: UIConfig;

  // Notification settings
  notifications: NotificationConfig;

  // Error handling and logging
  logging: LoggingConfig;
  errorReporting: ErrorReportingConfig;

  // Security settings
  security: SecurityConfig;

  // Third-party integrations
  integrations: IntegrationConfig;

  // Development settings
  development: DevelopmentConfig;
}

// OAuth Configuration
export interface OAuthConfig {
  enabled: boolean;
  providers: Record<OAuthProvider, OAuthProviderConfig>;
  redirectUrl: string;
  stateParameter: boolean;
  pkceEnabled: boolean;
  autoRefresh: boolean;
  sessionTimeout: number; // minutes
}

export type OAuthProvider = 'google' | 'apple' | 'github' | 'discord';

export interface OAuthProviderConfig {
  enabled: boolean;
  clientId: string;
  clientSecret?: string; // Only in server-side config
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  redirectUri: string;
  additionalParams?: Record<string, string>;
}

// Feature Flags
export interface FeatureFlags {
  // Authentication
  oauthEnabled: boolean;
  magicLinkEnabled: boolean;
  passwordResetEnabled: boolean;

  // UI/UX
  premiumUIEnabled: boolean;
  animationsEnabled: boolean;
  onboardingTourEnabled: boolean;
  darkModeEnabled: boolean;

  // Notifications
  pushNotificationsEnabled: boolean;
  advancedNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;

  // Performance
  performanceMonitoringEnabled: boolean;
  bundleSplittingEnabled: boolean;
  lazyLoadingEnabled: boolean;

  // Development
  debugModeEnabled: boolean;
  consoleLoggingEnabled: boolean;
  mockDataEnabled: boolean;
  devToolsEnabled: boolean;

  // Advanced features
  offlineModeEnabled: boolean;
  dataExportEnabled: boolean;
  advancedSearchEnabled: boolean;
  bulkOperationsEnabled: boolean;
}

// Performance Configuration
export interface PerformanceConfig {
  // Web Vitals budgets
  budgets: {
    lcp: number; // milliseconds
    fid: number; // milliseconds
    cls: number; // score
    fcp: number; // milliseconds
    ttfb: number; // milliseconds
  };

  // Monitoring settings
  monitoring: {
    enabled: boolean;
    samplingRate: number; // 0.0 to 1.0
    reportInterval: number; // minutes
    batchSize: number;
  };

  // Optimization settings
  optimization: {
    codeSplitting: boolean;
    lazyLoading: boolean;
    imageOptimization: boolean;
    bundleAnalysis: boolean;
  };

  // Cache settings
  cache: {
    enabled: boolean;
    maxAge: number; // seconds
    staleWhileRevalidate: boolean;
  };
}

// UI Configuration
export interface UIConfig {
  // Theme settings
  theme: {
    defaultMode: 'light' | 'dark' | 'auto';
    allowUserOverride: boolean;
    premiumColors: boolean;
    customPalette?: Record<string, string>;
  };

  // Layout settings
  layout: {
    maxWidth: string;
    sidebarWidth: string;
    headerHeight: string;
    responsiveBreakpoints: Record<string, string>;
  };

  // Animation settings
  animations: {
    enabled: boolean;
    duration: number; // milliseconds
    easing: string;
    reducedMotion: boolean;
  };

  // Accessibility settings
  accessibility: {
    highContrast: boolean;
    fontScaling: boolean;
    keyboardNavigation: boolean;
    screenReader: boolean;
  };

  // Component settings
  components: {
    skeletonLoader: boolean;
    loadingStates: boolean;
    errorBoundaries: boolean;
    toastNotifications: boolean;
  };
}

// Notification Configuration
export interface NotificationConfig {
  // General settings
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showPreview: boolean;

  // Push notification settings
  push: {
    enabled: boolean;
    serverKey: string;
    vapidKey: string;
    defaultIcon: string;
    defaultBadge: string;
  };

  // Email notification settings
  email: {
    enabled: boolean;
    templates: Record<string, EmailTemplateConfig>;
    smtpConfig?: SMTPConfig; // Server-side only
  };

  // In-app notification settings
  inApp: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    duration: number; // milliseconds
    maxCount: number;
  };

  // Notification types
  types: {
    assignmentDue: NotificationTypeConfig;
    assignmentCreated: NotificationTypeConfig;
    assignmentUpdated: NotificationTypeConfig;
    systemUpdates: NotificationTypeConfig;
    reminders: NotificationTypeConfig;
  };
}

export interface NotificationTypeConfig {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  push: boolean;
  email: boolean;
  inApp: boolean;
  advanceNotice: number; // minutes before event
}

export interface EmailTemplateConfig {
  subject: string;
  template: string;
  variables: string[];
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Logging Configuration
export interface LoggingConfig {
  level: LogLevel;
  enabled: boolean;
  destinations: ('console' | 'remote' | 'file')[];
  format: 'json' | 'text';
  includeTimestamp: boolean;
  includeLevel: boolean;
  includeContext: boolean;
  maxFileSize: number; // bytes
  maxFiles: number;
}

// Error Reporting Configuration
export interface ErrorReportingConfig {
  enabled: boolean;
  provider: 'sentry' | 'rollbar' | 'custom' | null;
  dsn?: string;
  environment: Environment;
  release: string;
  sampleRate: number;
  includeUserContext: boolean;
  includeTags: boolean;
  beforeSend?: (error: any) => any;
}

// Security Configuration
export interface SecurityConfig {
  // Authentication
  auth: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    passwordPolicy: PasswordPolicy;
    mfaEnabled: boolean;
  };

  // API security
  api: {
    rateLimiting: boolean;
    corsEnabled: boolean;
    allowedOrigins: string[];
    csrfProtection: boolean;
  };

  // Content security
  content: {
    cspEnabled: boolean;
    cspDirectives: Record<string, string[]>;
    xFrameOptions: string;
    xContentTypeOptions: boolean;
  };

  // Data protection
  data: {
    encryptionEnabled: boolean;
    dataRetention: number; // days
    gdprCompliance: boolean;
    cookieSettings: CookieSettings;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventCommonPasswords: boolean;
  expirationDays: number;
}

export interface CookieSettings {
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number; // seconds
}

// Integration Configuration
export interface IntegrationConfig {
  // Analytics
  analytics: {
    enabled: boolean;
    provider: 'google' | 'mixpanel' | 'custom' | null;
    trackingId?: string;
    customDomain?: string;
  };

  // Monitoring
  monitoring: {
    enabled: boolean;
    provider: 'datadog' | 'newrelic' | 'custom' | null;
    apiKey?: string;
    appId?: string;
  };

  // CDN
  cdn: {
    enabled: boolean;
    provider: 'cloudflare' | 'aws' | 'custom' | null;
    domain?: string;
    apiKey?: string;
  };

  // Backup
  backup: {
    enabled: boolean;
    provider: 'aws' | 'gcp' | 'azure' | 'custom' | null;
    bucket?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

// Development Configuration
export interface DevelopmentConfig {
  // Hot reload
  hotReload: boolean;
  fastRefresh: boolean;

  // Debugging
  debugMode: boolean;
  devTools: boolean;
  reduxDevTools: boolean;

  // Mocking
  mockApi: boolean;
  mockData: boolean;

  // Testing
  testMode: boolean;
  coverageEnabled: boolean;

  // Logging
  consoleLogging: boolean;
  verboseLogging: boolean;

  // Performance
  performanceProfiling: boolean;
  memoryProfiling: boolean;
}

// Configuration Management
export interface ConfigManager {
  getConfig(): AppConfig;
  updateConfig(updates: Partial<AppConfig>): void;
  resetConfig(): void;
  validateConfig(config: AppConfig): ConfigValidationResult;
  loadFromEnvironment(): Promise<AppConfig>;
  saveToStorage(config: AppConfig): Promise<void>;
  loadFromStorage(): Promise<AppConfig | null>;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ConfigValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Environment Variable Mapping
export interface EnvironmentVariables {
  // App
  VITE_ENVIRONMENT: Environment;
  VITE_VERSION: string;
  VITE_BUILD_DATE: string;
  VITE_COMMIT_HASH?: string;

  // URLs
  VITE_BASE_URL: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;

  // OAuth
  VITE_OAUTH_INTEGRATION_ENABLED: string;
  VITE_GOOGLE_OAUTH_CLIENT_ID: string;
  VITE_GOOGLE_OAUTH_ENABLED: string;
  VITE_APPLE_SERVICE_ID: string;
  VITE_APPLE_SIGNIN_ENABLED: string;

  // Features
  VITE_PREMIUM_UI_ENABLED: string;
  VITE_PERFORMANCE_MONITORING_ENABLED: string;
  VITE_ONBOARDING_TOUR_ENABLED: string;
  VITE_ADVANCED_NOTIFICATIONS_ENABLED: string;

  // Development
  VITE_DEBUG_MODE: string;
  VITE_CONSOLE_LOGGING: string;
  VITE_MOCK_DATA_ENABLED: string;
  VITE_DEV_TOOLS_ENABLED: string;

  // Performance
  VITE_PERFORMANCE_SAMPLING_RATE: string;

  // Security
  VITE_ERROR_TRACKING_ENABLED: string;
}

// Default Configurations
export const DEFAULT_OAUTH_CONFIG: OAuthConfig = {
  enabled: false,
  providers: {
    google: {
      enabled: false,
      clientId: '',
      scopes: ['openid', 'email', 'profile'],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      redirectUri: '',
    },
    apple: {
      enabled: false,
      clientId: '',
      scopes: ['name', 'email'],
      authorizationUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
      redirectUri: '',
    },
    github: {
      enabled: false,
      clientId: '',
      scopes: ['user:email'],
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      redirectUri: '',
    },
    discord: {
      enabled: false,
      clientId: '',
      scopes: ['identify', 'email'],
      authorizationUrl: 'https://discord.com/api/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/oauth2/token',
      userInfoUrl: 'https://discord.com/api/users/@me',
      redirectUri: '',
    },
  },
  redirectUrl: '',
  stateParameter: true,
  pkceEnabled: true,
  autoRefresh: true,
  sessionTimeout: 60, // 1 hour
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  oauthEnabled: false,
  magicLinkEnabled: true,
  passwordResetEnabled: true,
  premiumUIEnabled: false,
  animationsEnabled: true,
  onboardingTourEnabled: false,
  darkModeEnabled: true,
  pushNotificationsEnabled: false,
  advancedNotificationsEnabled: false,
  emailNotificationsEnabled: false,
  performanceMonitoringEnabled: false,
  bundleSplittingEnabled: true,
  lazyLoadingEnabled: true,
  debugModeEnabled: false,
  consoleLoggingEnabled: false,
  mockDataEnabled: false,
  devToolsEnabled: false,
  offlineModeEnabled: false,
  dataExportEnabled: false,
  advancedSearchEnabled: false,
  bulkOperationsEnabled: false,
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  budgets: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 600,
  },
  monitoring: {
    enabled: false,
    samplingRate: 1.0,
    reportInterval: 5,
    batchSize: 10,
  },
  optimization: {
    codeSplitting: true,
    lazyLoading: true,
    imageOptimization: true,
    bundleAnalysis: false,
  },
  cache: {
    enabled: true,
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: true,
  },
};

export const DEFAULT_UI_CONFIG: UIConfig = {
  theme: {
    defaultMode: 'auto',
    allowUserOverride: true,
    premiumColors: false,
  },
  layout: {
    maxWidth: '1200px',
    sidebarWidth: '280px',
    headerHeight: '64px',
    responsiveBreakpoints: {
      xs: '576px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1400px',
    },
  },
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    reducedMotion: false,
  },
  accessibility: {
    highContrast: false,
    fontScaling: true,
    keyboardNavigation: true,
    screenReader: true,
  },
  components: {
    skeletonLoader: true,
    loadingStates: true,
    errorBoundaries: true,
    toastNotifications: true,
  },
};

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  showPreview: true,
  push: {
    enabled: false,
    serverKey: '',
    vapidKey: '',
    defaultIcon: '/icon.svg',
    defaultBadge: '/icon.svg',
  },
  email: {
    enabled: false,
    templates: {},
  },
  inApp: {
    enabled: true,
    position: 'top-right',
    duration: 5000,
    maxCount: 5,
  },
  types: {
    assignmentDue: {
      enabled: true,
      sound: true,
      vibration: true,
      push: false,
      email: false,
      inApp: true,
      advanceNotice: 60, // 1 hour
    },
    assignmentCreated: {
      enabled: true,
      sound: false,
      vibration: false,
      push: false,
      email: false,
      inApp: true,
      advanceNotice: 0,
    },
    assignmentUpdated: {
      enabled: true,
      sound: false,
      vibration: false,
      push: false,
      email: false,
      inApp: true,
      advanceNotice: 0,
    },
    systemUpdates: {
      enabled: true,
      sound: false,
      vibration: false,
      push: false,
      email: false,
      inApp: true,
      advanceNotice: 0,
    },
    reminders: {
      enabled: true,
      sound: true,
      vibration: true,
      push: false,
      email: false,
      inApp: true,
      advanceNotice: 15, // 15 minutes
    },
  },
};

export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  level: 'info',
  enabled: true,
  destinations: ['console'],
  format: 'text',
  includeTimestamp: true,
  includeLevel: true,
  includeContext: true,
  maxFileSize: 10485760, // 10MB
  maxFiles: 5,
};

export const DEFAULT_ERROR_REPORTING_CONFIG: ErrorReportingConfig = {
  enabled: false,
  provider: null,
  environment: 'development',
  release: '1.0.0',
  sampleRate: 1.0,
  includeUserContext: true,
  includeTags: true,
};

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  auth: {
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
      preventCommonPasswords: true,
      expirationDays: 90,
    },
    mfaEnabled: false,
  },
  api: {
    rateLimiting: true,
    corsEnabled: true,
    allowedOrigins: [],
    csrfProtection: true,
  },
  content: {
    cspEnabled: true,
    cspDirectives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': ["'self'"],
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: true,
  },
  data: {
    encryptionEnabled: false,
    dataRetention: 365, // 1 year
    gdprCompliance: false,
    cookieSettings: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
    },
  },
};

export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  analytics: {
    enabled: false,
    provider: null,
  },
  monitoring: {
    enabled: false,
    provider: null,
  },
  cdn: {
    enabled: false,
    provider: null,
  },
  backup: {
    enabled: false,
    provider: null,
    frequency: 'daily',
  },
};

export const DEFAULT_DEVELOPMENT_CONFIG: DevelopmentConfig = {
  hotReload: true,
  fastRefresh: true,
  debugMode: false,
  devTools: false,
  reduxDevTools: false,
  mockApi: false,
  mockData: false,
  testMode: false,
  coverageEnabled: false,
  consoleLogging: false,
  verboseLogging: false,
  performanceProfiling: false,
  memoryProfiling: false,
};

// Utility Functions
export const isOAuthProvider = (value: string): value is OAuthProvider => {
  return ['google', 'apple', 'github', 'discord'].includes(value);
};

export const isEnvironment = (value: string): value is Environment => {
  return ['development', 'staging', 'production'].includes(value);
};

export const isLogLevel = (value: string): value is LogLevel => {
  return ['debug', 'info', 'warn', 'error', 'silent'].includes(value);
};

export const createDefaultConfig = (environment: Environment = 'development'): AppConfig => ({
  environment,
  version: '1.0.0',
  buildId: 'dev',
  buildDate: new Date().toISOString(),
  baseUrl: '/',
  apiUrl: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  oauth: DEFAULT_OAUTH_CONFIG,
  features: DEFAULT_FEATURE_FLAGS,
  performance: DEFAULT_PERFORMANCE_CONFIG,
  ui: DEFAULT_UI_CONFIG,
  notifications: DEFAULT_NOTIFICATION_CONFIG,
  logging: DEFAULT_LOGGING_CONFIG,
  errorReporting: DEFAULT_ERROR_REPORTING_CONFIG,
  security: DEFAULT_SECURITY_CONFIG,
  integrations: DEFAULT_INTEGRATION_CONFIG,
  development: DEFAULT_DEVELOPMENT_CONFIG,
});

export const mergeConfig = (base: AppConfig, overrides: Partial<AppConfig>): AppConfig => {
  return {
    ...base,
    ...overrides,
    oauth: { ...base.oauth, ...overrides.oauth },
    features: { ...base.features, ...overrides.features },
    performance: { ...base.performance, ...overrides.performance },
    ui: { ...base.ui, ...overrides.ui },
    notifications: { ...base.notifications, ...overrides.notifications },
    logging: { ...base.logging, ...overrides.logging },
    errorReporting: { ...base.errorReporting, ...overrides.errorReporting },
    security: { ...base.security, ...overrides.security },
    integrations: { ...base.integrations, ...overrides.integrations },
    development: { ...base.development, ...overrides.development },
  };
};

export const validateConfig = (config: AppConfig): ConfigValidationResult => {
  const errors: ConfigValidationError[] = [];
  const warnings: ConfigValidationWarning[] = [];

  // Validate required fields
  if (!config.supabaseUrl) {
    errors.push({
      field: 'supabaseUrl',
      message: 'Supabase URL is required',
      code: 'MISSING_SUPABASE_URL',
    });
  }

  if (!config.supabaseAnonKey) {
    errors.push({
      field: 'supabaseAnonKey',
      message: 'Supabase anonymous key is required',
      code: 'MISSING_SUPABASE_KEY',
    });
  }

  // Validate OAuth configuration
  if (config.features.oauthEnabled) {
    const enabledProviders = Object.entries(config.oauth.providers)
      .filter(([, provider]) => provider.enabled);

    if (enabledProviders.length === 0) {
      warnings.push({
        field: 'oauth.providers',
        message: 'OAuth is enabled but no providers are configured',
        code: 'NO_OAUTH_PROVIDERS',
      });
    }

    enabledProviders.forEach(([name, provider]) => {
      if (!provider.clientId) {
        errors.push({
          field: `oauth.providers.${name}.clientId`,
          message: `Client ID is required for ${name} OAuth provider`,
          code: 'MISSING_OAUTH_CLIENT_ID',
        });
      }
    });
  }

  // Validate performance budgets
  const { budgets } = config.performance;
  if (budgets.lcp < 1000) {
    warnings.push({
      field: 'performance.budgets.lcp',
      message: 'LCP budget is very aggressive (< 1s)',
      code: 'AGGRESSIVE_LCP_BUDGET',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};