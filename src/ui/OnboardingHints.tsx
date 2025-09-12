import { useState, useEffect, useRef } from 'react';
import { Popover, Text, Button, Group, Stack, Box } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import { useAppStore } from '@/store/app';

export interface OnboardingHintsProps {
  /** Whether onboarding should be shown (when not yet seen) */
  enabled?: boolean;
  /** Called when "Add sample data" is clicked */
  onAddSampleData?: () => void;
  /** Called when onboarding is completed or skipped */
  onComplete?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the target element
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'navigation',
    title: 'Welcome to Homework Buddy! 📚',
    description: 'Navigate between Today, Upcoming, and Classes using the tabs below. Each view helps you stay organized.',
    target: '[data-onboarding="navigation"]',
    placement: 'top',
  },
  {
    id: 'add-button',
    title: 'Add Your First Assignment ✨',
    description: 'Click the + button to create your first assignment. You can also create classes to organize your work.',
    target: '[data-onboarding="add-button"]',
    placement: 'bottom',
  },
  {
    id: 'filters',
    title: 'Stay Focused with Filters 🎯',
    description: 'Use filters to view only what matters right now: overdue tasks, today\'s work, or completed items.',
    target: '[data-onboarding="filters"]',
    placement: 'bottom',
  },
];

export default function OnboardingHints({ 
  enabled = true, 
  onAddSampleData, 
  onComplete 
}: OnboardingHintsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const seenOnboarding = useAppStore((s) => s.seenOnboarding);
  const markOnboardingSeen = useAppStore((s) => s.markOnboardingSeen);

  useEffect(() => {
    if (enabled && !seenOnboarding) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        setIsActive(true);
        // Focus the first button for keyboard navigation
        setTimeout(() => {
          firstButtonRef.current?.focus();
        }, reducedMotion ? 0 : 200);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled, seenOnboarding, reducedMotion]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    markOnboardingSeen();
    onComplete?.();
  };

  const handleSkip = () => {
    setIsActive(false);
    markOnboardingSeen();
    onComplete?.();
  };

  const handleAddSampleData = () => {
    onAddSampleData?.();
    handleComplete();
  };

  // Don't render if onboarding is disabled, already seen, or not active
  if (!enabled || seenOnboarding || !isActive) {
    return null;
  }

  // Find target element and ensure it's visible in viewport
  const targetElement = document.querySelector(currentStepData.target) as HTMLElement | null;
  if (!targetElement) {
    // If target element is not found, skip to next step or complete
    setTimeout(() => {
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }, 100);
    return null;
  }

  // Scroll target into view and center it for clarity
  try {
    targetElement.scrollIntoView({ block: 'center', inline: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
  } catch {}

  return (
    <Popover
      opened={isActive}
      position={currentStepData.placement}
      width={320}
      shadow="lg"
      withArrow={!reducedMotion}
      trapFocus
      closeOnEscape={false}
      closeOnClickOutside={false}
      transitionProps={{ duration: reducedMotion ? 0 : 200 }}
      withinPortal
      // Anchor popover to the actual target element
      // @ts-ignore Mantine supports positionTarget in v7
      positionTarget={targetElement}
    >
      <Popover.Target>
        <span style={{ display: 'inline-block', width: 0, height: 0 }} aria-hidden="true" />
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Text fw={600} size="sm">
              {currentStepData.title}
            </Text>
            <Text size="xs" c="dimmed">
              {currentStep + 1} of {ONBOARDING_STEPS.length}
            </Text>
          </Group>

          {/* Description */}
          <Text size="sm" c="dimmed">
            {currentStepData.description}
          </Text>

          {/* Actions */}
          <Group justify="space-between">
            <Group gap="xs">
              {currentStep > 0 && (
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconChevronLeft size={14} />}
                  onClick={handlePrevious}
                >
                  Back
                </Button>
              )}
            </Group>

            <Group gap="xs">
              <Button variant="subtle" size="xs" onClick={handleSkip}>
                Skip tour
              </Button>
              
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <Group gap="xs">
                  {onAddSampleData && (
                    <Button size="xs" variant="light" onClick={handleAddSampleData}>
                      Add sample data
                    </Button>
                  )}
                  <Button 
                    ref={firstButtonRef}
                    size="xs" 
                    onClick={handleComplete}
                    data-focus-ring
                  >
                    Got it!
                  </Button>
                </Group>
              ) : (
                <Button
                  ref={firstButtonRef}
                  size="xs"
                  rightSection={<IconChevronRight size={14} />}
                  onClick={handleNext}
                  data-focus-ring
                >
                  Next
                </Button>
              )}
            </Group>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

// Hook for manually triggering onboarding (for "Replay tour" feature)
export function useOnboardingReplay() {
  const replayOnboarding = () => {
    // Temporarily mark as not seen to trigger onboarding
    useAppStore.setState({ seenOnboarding: false });
  };

  return { replayOnboarding };
}
