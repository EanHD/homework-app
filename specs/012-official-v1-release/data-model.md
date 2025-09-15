# Data Model: Official v1 Release

## Enhanced Authentication Model

```typescript
interface User {
  id: string;
  email: string;
  
  // OAuth provider information
  provider: 'email' | 'google' | 'apple';
  providerId?: string;
  providerData?: {
    name?: string;
    picture?: string;
    locale?: string;
  };
  
  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    onboardingCompleted: boolean;
    language: string;
  };
  
  // Timestamps
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}
```

## Enhanced App State Model

```typescript
interface AppState {
  // Authentication state
  auth: {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // UI state
  ui: {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    onboardingTour: {
      isActive: boolean;
      currentStep: number;
      completed: boolean;
    };
    notifications: {
      enabled: boolean;
      permission: NotificationPermission;
    };
  };
  
  // Performance tracking
  performance: {
    loadTimes: Record<string, number>;
    errors: ErrorLog[];
    metrics: PerformanceMetrics;
  };
  
  // Feature flags for v1
  features: {
    oauthEnabled: boolean;
    performanceMonitoring: boolean;
    advancedNotifications: boolean;
  };
}
```

## Configuration Model

```typescript
interface AppConfig {
  // Environment configuration
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildDate: string;
  
  // Service configuration
  supabase: {
    url: string;
    anonKey: string;
    oauth: {
      google: {
        enabled: boolean;
        clientId: string;
      };
      apple: {
        enabled: boolean;
        serviceId: string;
      };
    };
  };
  
  // Performance configuration
  performance: {
    targets: PerformanceTargets;
    monitoring: boolean;
    budgets: PerformanceBudgets;
  };
  
  // Feature configuration
  features: Record<string, boolean>;
}
```

## Email Template Model

```typescript
interface EmailTemplate {
  id: string;
  type: 'magic_link' | 'confirmation' | 'password_reset';
  
  // Template content
  subject: string;
  htmlBody: string;
  textBody: string;
  
  // Template variables
  variables: string[]; // e.g., ['user_name', 'action_url', 'company_name']
  
  // Branding
  branding: {
    logoUrl: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    linkColor: string;
  };
  
  // Metadata
  version: string;
  updatedAt: string;
  isActive: boolean;
}
```

## Performance Metrics Model

```typescript
interface PerformanceMetrics {
  // Web Vitals
  webVitals: {
    FCP: number; // First Contentful Paint
    LCP: number; // Largest Contentful Paint
    FID: number; // First Input Delay
    CLS: number; // Cumulative Layout Shift
    TTFB: number; // Time to First Byte
  };
  
  // Custom metrics
  custom: {
    appInitTime: number;
    routeTransitionTime: Record<string, number>;
    apiResponseTimes: Record<string, number[]>;
    renderTimes: Record<string, number>;
  };
  
  // Resource metrics
  resources: {
    bundleSize: number;
    cacheHitRate: number;
    memoryUsage: number;
    networkRequests: number;
  };
  
  // Error tracking
  errors: {
    count: number;
    types: Record<string, number>;
    lastOccurrence: string;
  };
}
```

## Enhanced Onboarding Model

```typescript
interface OnboardingState {
  // Tour progress
  tourProgress: {
    started: boolean;
    completed: boolean;
    currentStep: number;
    totalSteps: number;
    skipped: boolean;
  };
  
  // User journey tracking
  journey: {
    firstVisit: string;
    featuresIntroduced: string[];
    interactionCount: number;
    completionTime?: number;
  };
  
  // Preferences discovered during onboarding
  discoveredPreferences: {
    preferredTheme?: 'light' | 'dark';
    notificationPreference?: boolean;
    primaryUseCase?: string;
  };
}
```

## Error Tracking Model

```typescript
interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  
  // Error details
  message: string;
  stack?: string;
  source: string; // component or service name
  userId?: string;
  
  // Context
  context: {
    url: string;
    userAgent: string;
    viewport: { width: number; height: number };
    route: string;
    action?: string; // user action that triggered error
  };
  
  // Environment
  environment: {
    version: string;
    browser: string;
    os: string;
    device: 'mobile' | 'tablet' | 'desktop';
  };
  
  // Resolution
  resolved: boolean;
  resolution?: string;
}
```

## Existing Models (Preserved)

The following existing models remain unchanged to maintain backward compatibility:

- `Assignment` model (homework assignments)
- `Class` model (school classes/subjects)
- `Notification` model (app notifications)
- Local storage models for offline functionality
- Service worker cache models

## Data Migration Strategy

```typescript
interface MigrationPlan {
  // User preference migration
  userPreferences: {
    from: 'localStorage';
    to: 'supabase.auth.user_metadata';
    fields: ['theme', 'onboardingCompleted', 'notifications'];
  };
  
  // OAuth user data integration
  oauthIntegration: {
    preserveExistingUsers: true;
    linkAccounts: 'by_email';
    fallbackToMagicLink: true;
  };
  
  // Performance data initialization
  performanceTracking: {
    initializeMetrics: true;
    historicalData: false; // Start fresh for v1
    samplingRate: 0.1; // 10% of users for performance tracking
  };
}
```