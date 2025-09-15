/**
 * Enhanced TypeScript types for v1 release
 * Provides type definitions for OAuth integration, premium UI, performance monitoring
 */

// Re-export from individual type files for centralized access
// TODO: Uncomment as each type file is created in Phase 3.3
// export type { User, Session, AuthResult, OAuthProvider } from './auth';
// export type { AppState, UIState, PerformanceState } from './state';
// export type { AppConfig, OAuthConfig, PerformanceConfig } from './config';
// export type { EmailTemplate, EmailBranding } from './email';
// export type { PerformanceMetrics, WebVitals, CustomMetrics } from './performance';
// export type { OnboardingState, TourStep, OnboardingTour } from './onboarding';
// export type { ErrorLog, ErrorLevel, ErrorContext } from './errors';

// Global type augmentations
declare global {
  interface Window {
    __BUILD_ID__: string;
    __APP_VERSION__: string;
    __BUILD_DATE__: string;
  }

  // Vite environment variables
  interface ImportMetaEnv {
    readonly VITE_ENVIRONMENT: 'development' | 'staging' | 'production';
    readonly VITE_VERSION: string;
    readonly VITE_BUILD_DATE: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_GOOGLE_OAUTH_CLIENT_ID: string;
    readonly VITE_GOOGLE_OAUTH_ENABLED: string;
    readonly VITE_APPLE_SERVICE_ID: string;
    readonly VITE_APPLE_SIGNIN_ENABLED: string;
    readonly VITE_PERFORMANCE_MONITORING_ENABLED: string;
    readonly VITE_PERFORMANCE_SAMPLING_RATE: string;
    readonly VITE_ERROR_TRACKING_ENABLED: string;
    readonly VITE_BASE_URL: string;
    readonly VITE_GITHUB_PAGES_DOMAIN: string;
    readonly VITE_OAUTH_INTEGRATION_ENABLED: string;
    readonly VITE_PREMIUM_UI_ENABLED: string;
    readonly VITE_ADVANCED_NOTIFICATIONS_ENABLED: string;
    readonly VITE_ONBOARDING_TOUR_ENABLED: string;
    readonly VITE_DEBUG_MODE: string;
    readonly VITE_CONSOLE_LOGGING: string;
    readonly VITE_MOCK_DATA_ENABLED: string;
    readonly VITE_DEV_TOOLS_ENABLED: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Common utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Feature flag types
export interface FeatureFlags {
  oauthEnabled: boolean;
  performanceMonitoring: boolean;
  advancedNotifications: boolean;
  premiumUI: boolean;
  onboardingTour: boolean;
  debugMode: boolean;
  consoleLogging: boolean;
  mockData: boolean;
  devTools: boolean;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  timestamp: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

export {};