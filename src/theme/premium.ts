import { createTheme, MantineColorsTuple } from '@mantine/core';

/**
 * Premium Theme Configuration for v1 Release
 * 
 * Extends base theme with enhanced colors, shadows, gradients,
 * and premium component variants for polished UI experience
 */

// Enhanced color palette
const premiumBlue: MantineColorsTuple = [
  '#e6f1fb',
  '#cfe4f8', 
  '#9fc9f1',
  '#70aeee',
  '#4896ea',
  '#2f86e7',
  '#1E88E5', // Primary blue
  '#1875c7',
  '#1364aa',
  '#0c4a80'
];

const premiumGreen: MantineColorsTuple = [
  '#e8f5e8',
  '#d3f0d3',
  '#a8e6a8',
  '#7ddc7d',
  '#5dd45d',
  '#47cc47',
  '#34c734',
  '#2bb02b',
  '#239d23',
  '#1a8a1a'
];

const premiumGray: MantineColorsTuple = [
  '#f8f9fa',
  '#e9ecef',
  '#dee2e6',
  '#ced4da',
  '#adb5bd',
  '#6c757d',
  '#495057',
  '#343a40',
  '#212529',
  '#000000'
];

const premiumAmber: MantineColorsTuple = [
  '#fff8e1',
  '#ffecb3',
  '#ffe082',
  '#ffd54f',
  '#ffcc02',
  '#ffb300',
  '#ff8f00',
  '#ff6f00',
  '#e65100',
  '#bf360c'
];

const premiumRed: MantineColorsTuple = [
  '#ffebee',
  '#ffcdd2',
  '#ef9a9a',
  '#e57373',
  '#ef5350',
  '#f44336',
  '#e53935',
  '#d32f2f',
  '#c62828',
  '#b71c1c'
];

// Premium shadows
const premiumShadows = {
  xs: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  sm: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
  md: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
  lg: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
  xl: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
};

// Premium gradients
const premiumGradients = {
  primary: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
  success: 'linear-gradient(135deg, #34c734 0%, #2bb02b 100%)',
  warning: 'linear-gradient(135deg, #ffb300 0%, #ff8f00 100%)',
  danger: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  subtle: 'linear-gradient(135deg, rgba(30, 136, 229, 0.08) 0%, rgba(30, 136, 229, 0.04) 100%)',
};

// Create premium theme
export const premiumTheme = createTheme({
  primaryColor: 'premiumBlue',
  defaultRadius: 'md',
  
  colors: {
    premiumBlue,
    premiumGreen,
    premiumGray,
    premiumAmber,
    premiumRed,
    // Keep original blue for compatibility
    blue: premiumBlue,
    green: premiumGreen,
    gray: premiumGray,
  },

  shadows: premiumShadows,

  // Enhanced component styles (base styles only - variants implemented in individual components)
  components: {
    Button: {
      styles: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
      },
    },

    TextInput: {
      styles: {
        input: {
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            boxShadow: `0 0 0 2px ${premiumBlue[6]}40`,
            transform: 'scale(1.02)',
          },
        },
      },
    },

    Card: {
      styles: {
        root: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },

    Modal: {
      styles: {
        content: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: premiumShadows.xl,
        },
        overlay: {
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
  },

  // Custom CSS variables for gradients and effects
  other: {
    gradients: premiumGradients,
    animations: {
      fadeIn: 'fadeIn 0.3s ease-in-out',
      slideUp: 'slideUp 0.3s ease-out',
      bounce: 'bounce 0.6s ease-in-out',
    },
    motion: {
      fast: '150ms ease-in-out',
      standard: '200ms ease-in-out',
      emphasize: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    interactions: {
      focusRing: (color: string = premiumBlue[6]) => `0 0 0 2px ${color}66, 0 0 0 4px ${color}22`,
      focusRingStrong: (color: string = premiumBlue[6]) => `0 0 0 2px ${color}AA, 0 0 0 4px ${color}55`,
    },
    // Global CSS classes can be applied manually or via styled components
    globalClasses: {
      glassEffect: {
        background: premiumGradients.glass,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      premiumGradient: {
        background: premiumGradients.primary,
      },
      premiumShadow: {
        boxShadow: premiumShadows.md,
      },
    },
  },
});

// Export individual utilities for direct use
export { premiumGradients, premiumShadows };

// Default export
export default premiumTheme;