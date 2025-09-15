import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Text,
  Button,
  Group,
  Progress,
  Paper,
  Portal,
  useMantineTheme,
  rem,
  ActionIcon,
} from '@mantine/core';
import { IconX, IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { premiumGradients, premiumShadows } from '../../theme/premium';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  allowSkip?: boolean;
  optional?: boolean;
}

export interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
  premium?: boolean;
  showProgress?: boolean;
  allowKeyboardNavigation?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onComplete,
  onSkip,
  onStepChange,
  currentStep: controlledStep,
  premium = true,
  showProgress = true,
  allowKeyboardNavigation = true,
}) => {
  const theme = useMantineTheme();
  const [internalStep, setInternalStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const currentStep = controlledStep ?? internalStep;
  const isControlled = controlledStep !== undefined;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Handle step changes
  const changeStep = (newStep: number) => {
    const clampedStep = Math.max(0, Math.min(newStep, steps.length - 1));
    if (!isControlled) {
      setInternalStep(clampedStep);
    }
    onStepChange?.(clampedStep);
  };

  // Navigation handlers
  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      changeStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      changeStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!allowKeyboardNavigation || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          if (!isLastStep) handleNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          if (!isFirstStep) handlePrevious();
          break;
        case 'Escape':
          event.preventDefault();
          if (currentStepData?.allowSkip !== false) handleSkip();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isOpen, allowKeyboardNavigation, isLastStep, isFirstStep]);

  // Element highlighting
  useEffect(() => {
    if (!isOpen || !currentStepData?.target) {
      setHighlightedElement(null);
      return;
    }

    const element = document.querySelector(currentStepData.target);
    setHighlightedElement(element);

    if (element) {
      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [currentStep, isOpen, currentStepData?.target]);

  if (!isOpen || !currentStepData) return null;

  const modalStyles = premium
    ? {
        content: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: premiumShadows.xl,
          borderRadius: theme.radius.lg,
        },
        overlay: {
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
        },
      }
    : {};

  const contentStyles = premium
    ? {
        background: premiumGradients.glass,
        borderRadius: theme.radius.md,
        padding: rem(24),
      }
    : {
        padding: rem(24),
      };

  return (
    <>
      {/* Spotlight overlay for highlighted elements */}
      {highlightedElement && (
        <Portal>
          <Box
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              // Keep this below the modal so modal content is not dimmed
              zIndex: 900,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Spotlight cutout would be implemented with more complex CSS */}
          </Box>
        </Portal>
      )}

      {/* Main tour modal */}
      <Modal
        opened={isOpen}
        onClose={currentStepData.allowSkip !== false ? handleSkip : () => {}}
        title={null}
        centered
        size="md"
        styles={modalStyles}
        zIndex={1000}
        withCloseButton={false}
        trapFocus
        returnFocus
        data-testid="onboarding-tour"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
      >
        <Box style={contentStyles}>
          {/* Header with close button */}
          <Group justify="space-between" mb="md">
            <Text
              id="tour-title"
              size="lg"
              fw={600}
              style={{
                background: premium ? premiumGradients.primary : undefined,
                backgroundClip: premium ? 'text' : undefined,
                WebkitBackgroundClip: premium ? 'text' : undefined,
                color: premium ? 'transparent' : theme.colors.dark[9],
              }}
            >
              {currentStepData.title}
            </Text>
            
            {currentStepData.allowSkip !== false && (
              <ActionIcon
                variant="subtle"
                onClick={handleSkip}
                aria-label="Skip tour"
                data-testid="tour-skip-button"
              >
                <IconX size={18} />
              </ActionIcon>
            )}
          </Group>

          {/* Progress indicator */}
          {showProgress && (
            <Box mb="lg">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Step {currentStep + 1} of {steps.length}
                </Text>
                <Text size="sm" c="dimmed">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </Text>
              </Group>
              <Progress
                value={((currentStep + 1) / steps.length) * 100}
                size="sm"
                style={{
                  '& .mantine-Progress-bar': premium
                    ? { background: premiumGradients.primary }
                    : undefined,
                }}
              />
            </Box>
          )}

          {/* Step content */}
          <Text
            id="tour-content"
            size="sm"
            mb="xl"
            style={{ lineHeight: 1.6 }}
          >
            {currentStepData.content}
          </Text>

          {/* Navigation controls */}
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handlePrevious}
              disabled={isFirstStep}
              data-testid="tour-previous-button"
            >
              Previous
            </Button>

            <Group gap="xs">
              {currentStepData.allowSkip !== false && (
                <Button
                  variant="subtle"
                  onClick={handleSkip}
                  data-testid="tour-skip-all-button"
                >
                  Skip Tour
                </Button>
              )}
              
              <Button
                variant={premium ? undefined : 'filled'}
                rightSection={
                  isLastStep ? <IconCheck size={16} /> : <IconArrowRight size={16} />
                }
                onClick={handleNext}
                style={
                  premium
                    ? {
                        background: premiumGradients.primary,
                        border: 'none',
                        color: 'white',
                      }
                    : undefined
                }
                data-testid={isLastStep ? "tour-finish-button" : "tour-next-button"}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </Button>
            </Group>
          </Group>
        </Box>
      </Modal>
    </>
  );
};

// Preset tour configurations
export const createWelcomeTour = (): TourStep[] => [
  {
    id: 'welcome',
    title: 'Welcome to Homework App! 🎉',
    content: 'Let\'s take a quick tour to help you get started with managing your assignments effectively.',
    position: 'center',
    allowSkip: true,
  },
  {
    id: 'add-assignment',
    title: 'Add Your First Assignment',
    content: 'Click here to add a new assignment. You can set due dates, reminders, and organize by class.',
    target: '[data-tour="add-assignment"]',
    position: 'bottom',
  },
  {
    id: 'notifications',
    title: 'Stay On Track with Notifications',
    content: 'Enable notifications to get reminders before your assignments are due.',
    target: '[data-tour="notifications"]',
    position: 'left',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! ✨',
    content: 'You\'re ready to start managing your homework efficiently. Remember, you can access help anytime from the menu.',
    position: 'center',
    allowSkip: false,
  },
];

export const createFeatureTour = (): TourStep[] => [
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    content: 'This is your main dashboard where you can see all your assignments at a glance.',
    target: '[data-tour="dashboard"]',
    position: 'center',
  },
  {
    id: 'filters',
    title: 'Filter Your View',
    content: 'Use these filters to focus on specific types of assignments.',
    target: '[data-tour="filters"]',
    position: 'bottom',
  },
  {
    id: 'calendar',
    title: 'Calendar View',
    content: 'Switch to calendar view to see your assignments organized by date.',
    target: '[data-tour="calendar"]',
    position: 'left',
  },
];

export default OnboardingTour;