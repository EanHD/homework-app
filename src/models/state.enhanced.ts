/**
 * Enhanced State Model
 *
 * Provides comprehensive type definitions for Zustand store state,
 * premium UI state management, and onboarding flow tracking for v1 release
 */

// UI State Types
export type UITheme = 'light' | 'dark' | 'auto';
export type UIMode = 'default' | 'premium' | 'minimal';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface UIState {
  // Theme and appearance
  theme: UITheme;
  mode: UIMode;
  colorScheme: 'light' | 'dark';

  // Layout and responsiveness
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarOpen: boolean;
  drawerOpen: boolean;

  // Loading and feedback states
  isLoading: boolean;
  loadingMessage?: string;
  globalError: string | null;
  globalSuccess: string | null;

  // Modal and overlay states
  activeModal: string | null;
  modalData: Record<string, any> | null;
  activeOverlay: string | null;

  // Focus and accessibility
  focusedElement: string | null;
  announcements: string[];
  skipLinks: boolean;

  // Premium UI features
  animationsEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

// Performance State Types
export interface PerformanceState {
  // Web Vitals
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay
  lcp: number | null; // Largest Contentful Paint
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte

  // Custom metrics
  timeToFirstSignIn: number | null;
  timeToFirstAssignment: number | null;
  navigationTime: number | null;
  componentRenderTime: number | null;

  // Performance budgets
  budgets: {
    lcp: number;
    fid: number;
    cls: number;
    bundleSize: number;
  };

  // Performance monitoring
  isMonitoringEnabled: boolean;
  samplingRate: number;
  lastReportAt: string | null;
  performanceAlerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Onboarding State Types
export type OnboardingStep =
  | 'welcome'
  | 'create-assignment'
  | 'set-notifications'
  | 'customize-theme'
  | 'explore-features'
  | 'complete';

export interface OnboardingState {
  // Tour progress
  currentStep: OnboardingStep | null;
  completedSteps: OnboardingStep[];
  isActive: boolean;
  isCompleted: boolean;

  // Tour configuration
  showTour: boolean;
  tourCentered: boolean;
  tourPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  tourSize: 'small' | 'medium' | 'large';

  // Step-specific data
  stepData: Record<OnboardingStep, OnboardingStepData>;

  // User preferences
  skipTour: boolean;
  remindLater: boolean;
  completedAt: string | null;
}

export interface OnboardingStepData {
  title: string;
  description: string;
  targetElement?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  showSkip: boolean;
  showPrevious: boolean;
  showNext: boolean;
  actionRequired: boolean;
  completed: boolean;
  metadata?: Record<string, any>;
}

// Notification State Types
export interface NotificationState {
  // Notification settings
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showPreview: boolean;

  // Notification preferences
  types: {
    assignmentDue: boolean;
    assignmentCreated: boolean;
    assignmentUpdated: boolean;
    systemUpdates: boolean;
    reminders: boolean;
  };

  // Push notification state
  pushSupported: boolean;
  pushGranted: boolean;
  pushDenied: boolean;
  subscription: PushSubscription | null;

  // Notification history
  recentNotifications: NotificationItem[];
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  type: 'assignment' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

// Error State Types
export interface ErrorState {
  // Global error tracking
  currentError: AppError | null;
  errorHistory: AppError[];
  errorCount: number;

  // Error reporting
  reportingEnabled: boolean;
  lastReportAt: string | null;
  reportQueue: AppError[];

  // Error recovery
  retryAttempts: Record<string, number>;
  recoveryActions: Record<string, ErrorRecoveryAction>;
}

export interface AppError {
  id: string;
  type: 'auth' | 'network' | 'validation' | 'permission' | 'unknown';
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  resolved: boolean;
  recoveryAction?: ErrorRecoveryAction;
}

export interface ErrorRecoveryAction {
  type: 'retry' | 'refresh' | 'logout' | 'reload' | 'navigate';
  label: string;
  action: () => void | Promise<void>;
  maxAttempts?: number;
}

// App State - Main Store State
export interface AppState {
  // Core state slices
  ui: UIState;
  performance: PerformanceState;
  onboarding: OnboardingState;
  notifications: NotificationState;
  errors: ErrorState;

  // App-level state
  isInitialized: boolean;
  isOnline: boolean;
  lastActivityAt: string;
  version: string;
  buildId: string;

  // Feature flags
  features: {
    oauthEnabled: boolean;
    performanceMonitoring: boolean;
    advancedNotifications: boolean;
    premiumUI: boolean;
    onboardingTour: boolean;
    debugMode: boolean;
  };

  // App configuration
  config: {
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
    apiUrl: string;
    version: string;
    buildDate: string;
  };
}

// Store Actions Types
export interface UIStateActions {
  setTheme: (theme: UITheme) => void;
  setMode: (mode: UIMode) => void;
  setScreenSize: (size: ScreenSize) => void;
  toggleSidebar: () => void;
  toggleDrawer: () => void;
  setLoading: (loading: boolean, message?: string) => void;
  setGlobalError: (error: string | null) => void;
  setGlobalSuccess: (success: string | null) => void;
  showModal: (modalId: string, data?: Record<string, any>) => void;
  hideModal: () => void;
  addAnnouncement: (message: string) => void;
  clearAnnouncements: () => void;
  setFocusedElement: (elementId: string | null) => void;
  setPremiumFeatures: (enabled: boolean) => void;
}

export interface PerformanceStateActions {
  updateMetric: (metric: keyof PerformanceState, value: number) => void;
  setBudgets: (budgets: Partial<PerformanceState['budgets']>) => void;
  addPerformanceAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  resolvePerformanceAlert: (alertId: string) => void;
  clearPerformanceAlerts: () => void;
  setMonitoringEnabled: (enabled: boolean) => void;
  setSamplingRate: (rate: number) => void;
  reportPerformance: () => void;
}

export interface OnboardingStateActions {
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep) => void;
  skipTour: () => void;
  remindLater: () => void;
  setTourPosition: (position: OnboardingState['tourPosition']) => void;
  setTourCentered: (centered: boolean) => void;
  updateStepData: (step: OnboardingStep, data: Partial<OnboardingStepData>) => void;
}

export interface NotificationStateActions {
  enableNotifications: () => void;
  disableNotifications: () => void;
  setNotificationType: (type: keyof NotificationState['types'], enabled: boolean) => void;
  requestPushPermission: () => Promise<void>;
  setPushSubscription: (subscription: PushSubscription | null) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

export interface ErrorStateActions {
  setError: (error: Omit<AppError, 'id' | 'timestamp' | 'resolved'>) => void;
  clearError: () => void;
  addErrorToHistory: (error: AppError) => void;
  clearErrorHistory: () => void;
  setReportingEnabled: (enabled: boolean) => void;
  reportError: (errorId: string) => void;
  retryAction: (actionId: string) => void;
  setRecoveryAction: (actionId: string, action: ErrorRecoveryAction) => void;
}

export interface AppStateActions {
  initialize: () => Promise<void>;
  setOnline: (online: boolean) => void;
  updateActivity: () => void;
  setFeatureFlag: (feature: keyof AppState['features'], enabled: boolean) => void;
  updateConfig: (config: Partial<AppState['config']>) => void;
  reset: () => void;
}

// Combined Store Interface
export interface AppStore extends AppState, UIStateActions, PerformanceStateActions, OnboardingStateActions, NotificationStateActions, ErrorStateActions, AppStateActions {}

// Store Selectors
export type AppStateSelector<T> = (state: AppState) => T;

// Default State Values
export const DEFAULT_UI_STATE: UIState = {
  theme: 'auto',
  mode: 'default',
  colorScheme: 'light',
  screenSize: 'md',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  sidebarOpen: false,
  drawerOpen: false,
  isLoading: false,
  globalError: null,
  globalSuccess: null,
  activeModal: null,
  modalData: null,
  activeOverlay: null,
  focusedElement: null,
  announcements: [],
  skipLinks: false,
  animationsEnabled: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
};

export const DEFAULT_PERFORMANCE_STATE: PerformanceState = {
  cls: null,
  fid: null,
  lcp: null,
  fcp: null,
  ttfb: null,
  timeToFirstSignIn: null,
  timeToFirstAssignment: null,
  navigationTime: null,
  componentRenderTime: null,
  budgets: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    bundleSize: 512000,
  },
  isMonitoringEnabled: true,
  samplingRate: 1.0,
  lastReportAt: null,
  performanceAlerts: [],
};

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  currentStep: null,
  completedSteps: [],
  isActive: false,
  isCompleted: false,
  showTour: true,
  tourCentered: true,
  tourPosition: 'center',
  tourSize: 'medium',
  stepData: {
    welcome: {
      title: 'Welcome to Homework App!',
      description: 'Let\'s get you started with the basics.',
      position: 'center',
      showSkip: true,
      showPrevious: false,
      showNext: true,
      actionRequired: false,
      completed: false,
    },
    'create-assignment': {
      title: 'Create Your First Assignment',
      description: 'Add an assignment to get started.',
      targetElement: '[data-tour="create-assignment"]',
      position: 'bottom',
      showSkip: true,
      showPrevious: true,
      showNext: true,
      actionRequired: true,
      completed: false,
    },
    'set-notifications': {
      title: 'Set Up Notifications',
      description: 'Get reminded when assignments are due.',
      targetElement: '[data-tour="notifications"]',
      position: 'top',
      showSkip: true,
      showPrevious: true,
      showNext: true,
      actionRequired: false,
      completed: false,
    },
    'customize-theme': {
      title: 'Customize Your Theme',
      description: 'Make the app feel like yours.',
      targetElement: '[data-tour="theme-settings"]',
      position: 'right',
      showSkip: true,
      showPrevious: true,
      showNext: true,
      actionRequired: false,
      completed: false,
    },
    'explore-features': {
      title: 'Explore Features',
      description: 'Discover all the powerful features available.',
      position: 'center',
      showSkip: true,
      showPrevious: true,
      showNext: true,
      actionRequired: false,
      completed: false,
    },
    complete: {
      title: 'You\'re All Set!',
      description: 'Enjoy using Homework App!',
      position: 'center',
      showSkip: false,
      showPrevious: true,
      showNext: false,
      actionRequired: false,
      completed: false,
    },
  },
  skipTour: false,
  remindLater: false,
  completedAt: null,
};

export const DEFAULT_NOTIFICATION_STATE: NotificationState = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  showPreview: true,
  types: {
    assignmentDue: true,
    assignmentCreated: true,
    assignmentUpdated: true,
    systemUpdates: true,
    reminders: true,
  },
  pushSupported: false,
  pushGranted: false,
  pushDenied: false,
  subscription: null,
  recentNotifications: [],
  unreadCount: 0,
};

export const DEFAULT_ERROR_STATE: ErrorState = {
  currentError: null,
  errorHistory: [],
  errorCount: 0,
  reportingEnabled: true,
  lastReportAt: null,
  reportQueue: [],
  retryAttempts: {},
  recoveryActions: {},
};

export const DEFAULT_APP_STATE: AppState = {
  ui: DEFAULT_UI_STATE,
  performance: DEFAULT_PERFORMANCE_STATE,
  onboarding: DEFAULT_ONBOARDING_STATE,
  notifications: DEFAULT_NOTIFICATION_STATE,
  errors: DEFAULT_ERROR_STATE,
  isInitialized: false,
  isOnline: true,
  lastActivityAt: new Date().toISOString(),
  version: '1.0.0',
  buildId: 'dev',
  features: {
    oauthEnabled: false,
    performanceMonitoring: false,
    advancedNotifications: false,
    premiumUI: false,
    onboardingTour: false,
    debugMode: false,
  },
  config: {
    environment: 'development',
    baseUrl: '/',
    apiUrl: '',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
  },
};

// Type Guards
export const isOnboardingStep = (value: string): value is OnboardingStep => {
  return ['welcome', 'create-assignment', 'set-notifications', 'customize-theme', 'explore-features', 'complete'].includes(value);
};

export const isUITheme = (value: string): value is UITheme => {
  return ['light', 'dark', 'auto'].includes(value);
};

export const isUIMode = (value: string): value is UIMode => {
  return ['default', 'premium', 'minimal'].includes(value);
};

export const isScreenSize = (value: string): value is ScreenSize => {
  return ['xs', 'sm', 'md', 'lg', 'xl'].includes(value);
};

// Utility Functions
export const createPerformanceAlert = (
  type: PerformanceAlert['type'],
  metric: string,
  value: number,
  threshold: number,
  message: string
): Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'> => ({
  type,
  metric,
  value,
  threshold,
  message,
});

export const createAppError = (
  type: AppError['type'],
  code: string,
  message: string,
  details?: Record<string, any>
): Omit<AppError, 'id' | 'timestamp' | 'resolved'> => ({
  type,
  code,
  message,
  details,
});

export const getScreenSizeFromWidth = (width: number): ScreenSize => {
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  return 'xl';
};

export const isMobileScreen = (size: ScreenSize): boolean => {
  return ['xs', 'sm'].includes(size);
};

export const isTabletScreen = (size: ScreenSize): boolean => {
  return size === 'md';
};

export const isDesktopScreen = (size: ScreenSize): boolean => {
  return ['lg', 'xl'].includes(size);
};