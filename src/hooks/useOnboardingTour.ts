import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_ONBOARDING_STATE,
  DEFAULT_ONBOARDING_PREFERENCES,
  OnboardingHookReturn,
  OnboardingPreferences,
  OnboardingState,
  OnboardingTour,
  OnboardingStep,
  UseOnboardingOptions,
  calculateOnboardingProgress,
  isOnboardingTour,
} from '../models/onboarding.enhanced';

// LocalStorage keys (scoped so we can evolve later)
const STORAGE_KEYS = {
  STATE: 'onboarding_state_v1',
  EVENTS: 'onboarding_events_v1', // reserved for future analytics expansion
};

// Basic in‑memory cache to avoid repeated JSON parsing across hook instances
let cachedState: OnboardingState | null = null;

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
};

const loadState = (): OnboardingState => {
  if (cachedState) return cachedState;
  const persisted = safeParse<Partial<OnboardingState>>(localStorage.getItem(STORAGE_KEYS.STATE), {});
  // Merge persisted onto defaults carefully (avoid spreading undefined objects)
  const merged: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    ...persisted,
    preferences: {
      ...DEFAULT_ONBOARDING_PREFERENCES,
      ...persisted.preferences,
    },
    completedTours: persisted.completedTours || [],
    completedSteps: persisted.completedSteps || {},
    skippedSteps: persisted.skippedSteps || {},
    sessionId: persisted.sessionId || crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    lastActivityAt: new Date().toISOString(),
  };
  cachedState = merged;
  return merged;
};

const persistState = (state: OnboardingState) => {
  cachedState = state;
  try {
    localStorage.setItem(
      STORAGE_KEYS.STATE,
      JSON.stringify({
        // Only persist what we need to rehydrate (exclude volatile session fields)
        currentTour: state.currentTour ? { id: state.currentTour.id, version: state.currentTour.version } : undefined,
        currentStepIndex: state.currentStepIndex,
        completedTours: state.completedTours,
        completedSteps: state.completedSteps,
        skippedSteps: state.skippedSteps,
        preferences: state.preferences,
        sessionId: state.sessionId,
        lastActivityAt: state.lastActivityAt,
        analytics: state.analytics, // lightweight aggregate numbers
      })
    );
  } catch {
    // Silently ignore persistence errors (quota / privacy mode)
  }
};

// Utility: hydrate a lightweight stored tour reference with provided tours list
const resolveCurrentTour = (state: OnboardingState, tours: OnboardingTour[] | undefined): OnboardingTour | undefined => {
  if (!state.currentTour || !state.currentTour.id || !tours) return undefined;
  return tours.find(t => t.id === state.currentTour!.id);
};

export function useOnboardingTour(
  toursOrFactory?: OnboardingTour[] | (() => OnboardingTour[]),
  options?: UseOnboardingOptions
): OnboardingHookReturn {
  const { autoStart = true, tourId, onTourStart, onTourComplete, onStepChange, onError } = options || {};

  // We allow caller to pass tours (array or lazy factory). This could later be fetched async.
  const tours: OnboardingTour[] | undefined = (() => {
    if (!toursOrFactory) return undefined;
    try {
      return typeof toursOrFactory === 'function' ? (toursOrFactory as () => OnboardingTour[])() : toursOrFactory;
    } catch (e) {
      onError?.(e as Error);
      return undefined;
    }
  })();

  const [state, setState] = useState<OnboardingState>(() => loadState());
  const [currentTour, setCurrentTour] = useState<OnboardingTour | undefined>(() => resolveCurrentTour(loadState(), tours));
  const isMounted = useRef(false);

  // Derive current step object if tour present
  const currentStep: OnboardingStep | null = currentTour
    ? currentTour.steps[state.currentStepIndex] || null
    : null;

  // Derived progress
  const progress = calculateOnboardingProgress({ ...state, currentTour });

  // Internal helper to update state + persist
  const updateState = useCallback(
    (updater: (prev: OnboardingState) => OnboardingState) => {
      setState(prev => {
        const next = updater(prev);
        const persisted: OnboardingState = { ...next, currentTour };
        persistState(persisted);
        return next;
      });
    },
    [currentTour]
  );

  const selectTour = useCallback(
    (id?: string) => {
      if (!tours || !tours.length) return;
      const selected = id ? tours.find(t => t.id === id) : tours[0];
      if (!selected) return;
      setCurrentTour(selected);
      updateState(prev => ({ ...prev, currentTour: selected, currentStepIndex: 0 }));
    },
    [tours, updateState]
  );

  // Actions
  const startTour = useCallback(
    async (id?: string) => {
      try {
        if (!tours || tours.length === 0) return;
        selectTour(id || tourId);
        updateState(prev => ({
          ...prev,
          isActive: true,
          isPaused: false,
          startedAt: prev.startedAt || new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        }));
        const started = id ? tours.find(t => t.id === id) : resolveCurrentTour(loadState(), tours);
        if (started && isOnboardingTour(started)) onTourStart?.(started);
      } catch (e) {
        onError?.(e as Error);
      }
    },
    [tours, selectTour, tourId, onTourStart, onError, updateState]
  );

  const nextStep = useCallback(async () => {
    if (!currentTour) return;
    updateState(prev => {
      const nextIndex = Math.min(prev.currentStepIndex + 1, currentTour.steps.length - 1);
      const updated = { ...prev, currentStepIndex: nextIndex, lastActivityAt: new Date().toISOString() };
      return updated;
    });
  }, [currentTour, updateState]);

  const previousStep = useCallback(async () => {
    if (!currentTour) return;
    updateState(prev => ({
      ...prev,
      currentStepIndex: Math.max(prev.currentStepIndex - 1, 0),
      lastActivityAt: new Date().toISOString(),
    }));
  }, [currentTour, updateState]);

  const skipStep = useCallback(async () => {
    if (!currentTour) return;
    updateState(prev => {
      const skipped = prev.skippedSteps[currentTour.id] || [];
      if (!skipped.includes(prev.currentStepIndex)) skipped.push(prev.currentStepIndex);
      return { ...prev, skippedSteps: { ...prev.skippedSteps, [currentTour.id]: skipped }, lastActivityAt: new Date().toISOString() };
    });
    await nextStep();
  }, [currentTour, updateState, nextStep]);

  const completeTour = useCallback(async () => {
    if (!currentTour) return;
    updateState(prev => {
      const completedTours = prev.completedTours.includes(currentTour.id)
        ? prev.completedTours
        : [...prev.completedTours, currentTour.id];
      return {
        ...prev,
        isActive: false,
        completedTours,
        completedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };
    });
    onTourComplete?.(currentTour);
  }, [currentTour, updateState, onTourComplete]);

  const pauseTour = useCallback(() => {
    if (!currentTour) return;
    updateState(prev => ({ ...prev, isPaused: true, lastActivityAt: new Date().toISOString() }));
  }, [currentTour, updateState]);

  const resumeTour = useCallback(() => {
    if (!currentTour) return;
    updateState(prev => ({ ...prev, isPaused: false, lastActivityAt: new Date().toISOString() }));
  }, [currentTour, updateState]);

  const resetTour = useCallback(async () => {
    updateState(prev => ({
      ...prev,
      currentStepIndex: 0,
      isActive: false,
      isPaused: false,
      startedAt: undefined,
      completedAt: undefined,
      lastActivityAt: new Date().toISOString(),
    }));
    setCurrentTour(undefined);
  }, [updateState]);

  const updatePreferences = useCallback(async (preferences: Partial<OnboardingPreferences>) => {
    updateState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
      lastActivityAt: new Date().toISOString(),
    }));
  }, [updateState]);

  const submitFeedback = useCallback(async (_rating: number, _comment?: string) => {
    // Minimal stub – analytics feature not fully implemented yet.
    return Promise.resolve();
  }, []);

  // Inspector utilities
  const isStepCompleted = useCallback(
    (stepId: string) => {
      if (!currentTour) return false;
      const stepIndex = currentTour.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return false;
      return state.completedSteps[currentTour.id]?.includes(stepIndex) || false;
    },
    [currentTour, state.completedSteps]
  );

  const isTourCompleted = useCallback(
    (id: string) => state.completedTours.includes(id),
    [state.completedTours]
  );

  const getAvailableTours = useCallback(async () => {
    return Promise.resolve(tours || []);
  }, [tours]);

  // Record step completion when moving forward to a new step index
  useEffect(() => {
    if (!currentTour || !currentStep) return;
    updateState(prev => {
      const completed = prev.completedSteps[currentTour.id] || [];
      if (!completed.includes(prev.currentStepIndex)) {
        completed.push(prev.currentStepIndex);
      }
      return { ...prev, completedSteps: { ...prev.completedSteps, [currentTour.id]: completed } };
    });
    onStepChange?.(currentStep);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTour?.id, state.currentStepIndex]);

  // Auto‑start
  useEffect(() => {
    if (isMounted.current) return; // only once
    isMounted.current = true;
    if (autoStart && tours && tours.length > 0 && !state.isActive) {
      // Respect already completed tours; start only if not completed
      const firstTour = tourId ? tours.find(t => t.id === tourId) : tours[0];
      if (firstTour && !state.completedTours.includes(firstTour.id)) {
        startTour(firstTour.id);
      }
    }
  }, [autoStart, tours, state.isActive, state.completedTours, startTour, tourId]);

  return {
    // State
    state: { ...state, currentTour },
    currentStep,
    isActive: state.isActive,
    progress,
    // Actions
    startTour,
    nextStep,
    previousStep,
    skipStep,
    completeTour,
    pauseTour,
    resumeTour,
    resetTour,
    // Preferences
    updatePreferences,
    preferences: state.preferences,
    // Analytics
    submitFeedback,
    // Utilities
    isStepCompleted,
    isTourCompleted,
    getAvailableTours,
  } as OnboardingHookReturn;
}

export default useOnboardingTour;