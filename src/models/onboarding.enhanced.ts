/**
 * Enhanced Onboarding Model
 *
 * Provides comprehensive type definitions for user onboarding tours,
 * progress tracking, completion states, and user experience optimization for v1 release
 */

// Core Onboarding Types
export interface OnboardingTour {
  id: string;
  name: string;
  title: string;
  description: string;
  version: string;
  targetAudience: 'new_users' | 'existing_users' | 'premium_features';
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: OnboardingStep[];
  conditions: OnboardingCondition[];
  analytics: OnboardingAnalytics;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface OnboardingStep {
  id: string;
  tourId: string;
  order: number;
  title: string;
  content: string;
  media?: OnboardingMedia;
  target: OnboardingTarget;
  actions: OnboardingAction[];
  conditions: OnboardingCondition[];
  analytics: StepAnalytics;
  timeout?: number; // milliseconds
  skippable: boolean;
  required: boolean;
}

export interface OnboardingTarget {
  type: 'element' | 'page' | 'component' | 'global';
  selector?: string; // CSS selector for element targeting
  page?: string; // Route/page identifier
  component?: string; // Component name
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'auto';
  offset?: {
    x: number;
    y: number;
  };
}

export interface OnboardingMedia {
  type: 'image' | 'video' | 'gif' | 'icon';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface OnboardingAction {
  id: string;
  type: 'next' | 'previous' | 'skip' | 'complete' | 'custom';
  label: string;
  primary: boolean;
  disabled?: boolean;
  action?: () => void | Promise<void>;
  conditions?: OnboardingCondition[];
}

export interface OnboardingCondition {
  type: 'user_property' | 'app_state' | 'feature_flag' | 'time_based' | 'interaction';
  property: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: any;
  negate?: boolean;
}

// Onboarding State Types
export interface OnboardingState {
  // Current session state
  currentTour?: OnboardingTour;
  currentStepIndex: number;
  isActive: boolean;
  isPaused: boolean;

  // Progress tracking
  completedTours: string[];
  completedSteps: Record<string, number[]>; // tourId -> step indices
  skippedSteps: Record<string, number[]>; // tourId -> step indices

  // User preferences
  preferences: OnboardingPreferences;

  // Analytics and metrics
  analytics: UserOnboardingAnalytics;

  // Session metadata
  sessionId: string;
  startedAt?: string;
  lastActivityAt: string;
  completedAt?: string;
}

export interface OnboardingPreferences {
  enabled: boolean;
  autoStart: boolean;
  showProgress: boolean;
  allowSkip: boolean;
  theme: 'light' | 'dark' | 'auto';
  animationSpeed: 'slow' | 'normal' | 'fast';
  position: 'center' | 'corner';
  reducedMotion: boolean;
  language: string;
  dismissedTours: string[];
  completedTours: string[];
}

export interface UserOnboardingAnalytics {
  toursStarted: number;
  toursCompleted: number;
  toursSkipped: number;
  totalStepsViewed: number;
  totalStepsCompleted: number;
  totalStepsSkipped: number;
  averageCompletionTime: number; // milliseconds
  averageStepsPerSession: number;
  bounceRate: number; // percentage of tours started but not completed
  engagementScore: number; // 0-100 based on interactions
  lastTourCompletedAt?: string;
  favoriteTourTypes: string[];
  problematicSteps: Record<string, number>; // stepId -> failure count
}

// Onboarding Analytics Types
export interface OnboardingAnalytics {
  totalViews: number;
  totalCompletions: number;
  totalSkips: number;
  completionRate: number;
  averageDuration: number;
  stepCompletionRates: Record<string, number>;
  dropOffPoints: Record<string, number>; // step index -> drop-off count
  userSatisfaction?: number; // 1-5 scale
  feedback: OnboardingFeedback[];
  abTestResults?: ABTestResult[];
}

export interface StepAnalytics {
  views: number;
  completions: number;
  skips: number;
  averageTime: number;
  interactionRate: number;
  errorRate: number;
  feedback: StepFeedback[];
}

export interface OnboardingFeedback {
  id: string;
  userId?: string;
  tourId: string;
  stepId?: string;
  rating: number; // 1-5
  comment?: string;
  category: 'content' | 'timing' | 'usability' | 'design' | 'functionality';
  timestamp: string;
  userAgent: string;
  sessionId: string;
}

export interface StepFeedback {
  type: 'helpful' | 'confusing' | 'too_long' | 'too_short' | 'perfect';
  count: number;
  comments: string[];
}

export interface ABTestResult {
  testId: string;
  variantA: string;
  variantB: string;
  metric: string;
  winner: 'A' | 'B' | 'tie';
  confidence: number;
  sampleSize: number;
  startDate: string;
  endDate: string;
}

// Onboarding Service Types
export interface OnboardingService {
  // Tour management
  getAvailableTours(userId?: string): Promise<OnboardingTour[]>;
  getTour(tourId: string): Promise<OnboardingTour | null>;
  createTour(tour: Omit<OnboardingTour, 'id' | 'createdAt' | 'updatedAt'>): Promise<OnboardingTour>;
  updateTour(tourId: string, updates: Partial<OnboardingTour>): Promise<OnboardingTour>;
  deleteTour(tourId: string): Promise<void>;

  // State management
  getUserState(userId?: string): Promise<OnboardingState>;
  updateUserState(userId: string | undefined, state: Partial<OnboardingState>): Promise<OnboardingState>;
  resetUserState(userId?: string): Promise<OnboardingState>;

  // Tour execution
  startTour(tourId: string, userId?: string): Promise<OnboardingState>;
  nextStep(userId?: string): Promise<OnboardingStep | null>;
  previousStep(userId?: string): Promise<OnboardingStep | null>;
  skipStep(userId?: string): Promise<OnboardingStep | null>;
  completeTour(userId?: string): Promise<void>;

  // Analytics
  trackEvent(event: OnboardingEvent): Promise<void>;
  getAnalytics(tourId?: string): Promise<OnboardingAnalytics>;
  submitFeedback(feedback: Omit<OnboardingFeedback, 'id' | 'timestamp'>): Promise<void>;

  // Configuration
  updatePreferences(userId: string | undefined, preferences: Partial<OnboardingPreferences>): Promise<OnboardingPreferences>;
  getPreferences(userId?: string): Promise<OnboardingPreferences>;
}

export interface OnboardingEvent {
  type: 'tour_started' | 'tour_completed' | 'tour_skipped' | 'step_viewed' | 'step_completed' | 'step_skipped' | 'action_clicked' | 'feedback_submitted';
  tourId: string;
  stepId?: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Onboarding UI Types
export interface OnboardingUIState {
  isVisible: boolean;
  currentStep: OnboardingStep | null;
  tour: OnboardingTour | null;
  position: {
    x: number;
    y: number;
  };
  overlay: {
    enabled: boolean;
    opacity: number;
    blur: boolean;
  };
  tooltip: {
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
    width?: number;
    maxWidth?: number;
    showArrow: boolean;
    offset: number;
  };
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  progress: {
    show: boolean;
    current: number;
    total: number;
    percentage: number;
  };
}

export interface OnboardingUIConfig {
  theme: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      border: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        title: string;
        content: string;
        button: string;
      };
      fontWeight: {
        normal: string;
        bold: string;
      };
    };
    spacing: {
      padding: string;
      margin: string;
      borderRadius: string;
    };
    shadows: {
      tooltip: string;
      overlay: string;
    };
  };
  animations: {
    fadeIn: {
      duration: number;
      easing: string;
    };
    slideIn: {
      duration: number;
      easing: string;
      direction: 'up' | 'down' | 'left' | 'right';
    };
    highlight: {
      duration: number;
      easing: string;
      color: string;
    };
  };
  zIndex: {
    overlay: number;
    tooltip: number;
    highlight: number;
  };
}

// Onboarding Hook Types
export interface UseOnboardingOptions {
  autoStart?: boolean;
  tourId?: string;
  userId?: string;
  onTourStart?: (tour: OnboardingTour) => void;
  onTourComplete?: (tour: OnboardingTour) => void;
  onStepChange?: (step: OnboardingStep) => void;
  onError?: (error: Error) => void;
}

export interface OnboardingHookReturn {
  // State
  state: OnboardingState;
  currentStep: OnboardingStep | null;
  isActive: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };

  // Actions
  startTour: (tourId?: string) => Promise<void>;
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  skipStep: () => Promise<void>;
  completeTour: () => Promise<void>;
  pauseTour: () => void;
  resumeTour: () => void;
  resetTour: () => Promise<void>;

  // Preferences
  updatePreferences: (preferences: Partial<OnboardingPreferences>) => Promise<void>;
  preferences: OnboardingPreferences;

  // Analytics
  submitFeedback: (rating: number, comment?: string) => Promise<void>;

  // Utilities
  isStepCompleted: (stepId: string) => boolean;
  isTourCompleted: (tourId: string) => boolean;
  getAvailableTours: () => Promise<OnboardingTour[]>;
}

// Default Values
export const DEFAULT_ONBOARDING_PREFERENCES: OnboardingPreferences = {
  enabled: true,
  autoStart: true,
  showProgress: true,
  allowSkip: true,
  theme: 'auto',
  animationSpeed: 'normal',
  position: 'center',
  reducedMotion: false,
  language: 'en',
  dismissedTours: [],
  completedTours: [],
};

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  currentStepIndex: 0,
  isActive: false,
  isPaused: false,
  completedTours: [],
  completedSteps: {},
  skippedSteps: {},
  preferences: DEFAULT_ONBOARDING_PREFERENCES,
  analytics: {
    toursStarted: 0,
    toursCompleted: 0,
    toursSkipped: 0,
    totalStepsViewed: 0,
    totalStepsCompleted: 0,
    totalStepsSkipped: 0,
    averageCompletionTime: 0,
    averageStepsPerSession: 0,
    bounceRate: 0,
    engagementScore: 0,
    favoriteTourTypes: [],
    problematicSteps: {},
  },
  sessionId: '',
  lastActivityAt: new Date().toISOString(),
};

export const DEFAULT_ONBOARDING_UI_CONFIG: OnboardingUIConfig = {
  theme: {
    colors: {
      primary: '#228be6',
      secondary: '#868e96',
      background: '#ffffff',
      text: '#212529',
      border: '#dee2e6',
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: {
        title: '1.25rem',
        content: '1rem',
        button: '0.875rem',
      },
      fontWeight: {
        normal: '400',
        bold: '600',
      },
    },
    spacing: {
      padding: '1rem',
      margin: '0.5rem',
      borderRadius: '0.375rem',
    },
    shadows: {
      tooltip: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overlay: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  },
  animations: {
    fadeIn: {
      duration: 300,
      easing: 'ease-out',
    },
    slideIn: {
      duration: 300,
      easing: 'ease-out',
      direction: 'up',
    },
    highlight: {
      duration: 500,
      easing: 'ease-in-out',
      color: '#228be6',
    },
  },
  zIndex: {
    overlay: 1000,
    tooltip: 1001,
    highlight: 999,
  },
};

// Utility Functions
export const isOnboardingConditionMet = (condition: OnboardingCondition, context: Record<string, any>): boolean => {
  const { property, operator, value, negate = false } = condition;
  const actualValue = getNestedProperty(context, property);

  let result = false;

  switch (operator) {
    case 'equals':
      result = actualValue === value;
      break;
    case 'not_equals':
      result = actualValue !== value;
      break;
    case 'contains':
      result = Array.isArray(actualValue) ? actualValue.includes(value) : String(actualValue).includes(String(value));
      break;
    case 'greater_than':
      result = Number(actualValue) > Number(value);
      break;
    case 'less_than':
      result = Number(actualValue) < Number(value);
      break;
    case 'exists':
      result = actualValue !== undefined && actualValue !== null;
      break;
    case 'not_exists':
      result = actualValue === undefined || actualValue === null;
      break;
  }

  return negate ? !result : result;
};

export const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const calculateOnboardingProgress = (state: OnboardingState): { current: number; total: number; percentage: number } => {
  if (!state.currentTour) {
    return { current: 0, total: 0, percentage: 0 };
  }

  const total = state.currentTour.steps.length;
  const current = Math.min(state.currentStepIndex + 1, total);

  return {
    current,
    total,
    percentage: total > 0 ? Math.round((current / total) * 100) : 0,
  };
};

export const shouldShowOnboardingTour = (tour: OnboardingTour, state: OnboardingState, context: Record<string, any>): boolean => {
  // Check if tour is active
  if (!tour.isActive) return false;

  // Check if user has already completed this tour
  if (state.completedTours.includes(tour.id)) return false;

  // Check if user has dismissed this tour
  if (state.preferences.dismissedTours.includes(tour.id)) return false;

  // Check tour conditions
  for (const condition of tour.conditions) {
    if (!isOnboardingConditionMet(condition, context)) {
      return false;
    }
  }

  return true;
};

export const getNextAvailableTour = (tours: OnboardingTour[], state: OnboardingState, context: Record<string, any>): OnboardingTour | null => {
  // Sort tours by priority
  const sortedTours = [...tours].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Find first available tour
  for (const tour of sortedTours) {
    if (shouldShowOnboardingTour(tour, state, context)) {
      return tour;
    }
  }

  return null;
};

export const generateOnboardingAnalytics = (events: OnboardingEvent[]): UserOnboardingAnalytics => {
  const analytics: UserOnboardingAnalytics = {
    toursStarted: 0,
    toursCompleted: 0,
    toursSkipped: 0,
    totalStepsViewed: 0,
    totalStepsCompleted: 0,
    totalStepsSkipped: 0,
    averageCompletionTime: 0,
    averageStepsPerSession: 0,
    bounceRate: 0,
    engagementScore: 0,
    favoriteTourTypes: [],
    problematicSteps: {},
  };

  const tourSessions: Record<string, { startTime?: number; endTime?: number; steps: number; completed: boolean }> = {};
  const stepFailures: Record<string, number> = {};

  for (const event of events) {
    switch (event.type) {
      case 'tour_started':
        analytics.toursStarted++;
        tourSessions[event.sessionId] = { steps: 0, completed: false };
        break;

      case 'tour_completed':
        analytics.toursCompleted++;
        if (tourSessions[event.sessionId]) {
          tourSessions[event.sessionId].completed = true;
          if (tourSessions[event.sessionId].startTime && event.timestamp) {
            const duration = new Date(event.timestamp).getTime() - tourSessions[event.sessionId].startTime!;
            analytics.averageCompletionTime = (analytics.averageCompletionTime + duration) / 2;
          }
        }
        break;

      case 'tour_skipped':
        analytics.toursSkipped++;
        break;

      case 'step_viewed':
        analytics.totalStepsViewed++;
        if (tourSessions[event.sessionId]) {
          tourSessions[event.sessionId].steps++;
        }
        break;

      case 'step_completed':
        analytics.totalStepsCompleted++;
        break;

      case 'step_skipped':
        analytics.totalStepsSkipped++;
        if (event.stepId) {
          stepFailures[event.stepId] = (stepFailures[event.stepId] || 0) + 1;
        }
        break;
    }
  }

  // Calculate derived metrics
  analytics.averageStepsPerSession = analytics.toursStarted > 0 ? analytics.totalStepsViewed / analytics.toursStarted : 0;
  analytics.bounceRate = analytics.toursStarted > 0 ? ((analytics.toursStarted - analytics.toursCompleted) / analytics.toursStarted) * 100 : 0;
  analytics.engagementScore = Math.min(100, Math.max(0, 100 - analytics.bounceRate));
  analytics.problematicSteps = stepFailures;

  return analytics;
};

// Type Guards
export const isOnboardingTour = (obj: any): obj is OnboardingTour => {
  return obj && typeof obj === 'object' && 'id' in obj && 'steps' in obj && 'version' in obj;
};

export const isOnboardingStep = (obj: any): obj is OnboardingStep => {
  return obj && typeof obj === 'object' && 'id' in obj && 'order' in obj && 'target' in obj;
};

export const isOnboardingState = (obj: any): obj is OnboardingState => {
  return obj && typeof obj === 'object' && 'currentStepIndex' in obj && 'completedTours' in obj && 'preferences' in obj;
};

export const isOnboardingEvent = (obj: any): obj is OnboardingEvent => {
  return obj && typeof obj === 'object' && 'type' in obj && 'tourId' in obj && 'timestamp' in obj;
};