import React from 'react';
import { Button, ButtonProps, useMantineTheme, Loader } from '@mantine/core';
import { premiumGradients, premiumShadows } from '../../theme/premium';

export interface PremiumButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'premium' | 'glass' | 'gradient' | 'subtle' | 'outline' | 'filled';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const getVariantStyles = (variant: string, theme: any) => {
  const focusRing = theme.other?.interactions?.focusRing?.(theme.colors.premiumBlue?.[6] || theme.colors.blue[6]);
  const motion = theme.other?.motion?.fast || '150ms ease-in-out';
  const baseStyles = {
    transition: `background ${motion}, box-shadow ${motion}, transform ${motion}`,
    fontWeight: 600,
    borderRadius: theme.radius.md,
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  };

  switch (variant) {
    case 'premium':
      return {
        ...baseStyles,
        background: premiumGradients.primary,
        border: 'none',
        color: 'white',
        boxShadow: premiumShadows.sm,
        '&:hover': {
          background: premiumGradients.primary,
          boxShadow: premiumShadows.md,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: premiumShadows.xs,
        },
        '&:disabled': {
          background: theme.colors.gray[5],
          color: theme.colors.gray[7],
          transform: 'none',
          boxShadow: 'none',
          opacity: 0.85,
        },
      };

    case 'glass':
      return {
        ...baseStyles,
        background: premiumGradients.glass,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        color: theme.colors.dark[9],
        boxShadow: premiumShadows.xs,
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.18)',
          transform: 'translateY(-1px)',
          boxShadow: premiumShadows.sm,
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      };

    case 'gradient':
      return {
        ...baseStyles,
        background: premiumGradients.success,
        border: 'none',
        color: 'white',
        boxShadow: premiumShadows.sm,
        '&:hover': {
          background: premiumGradients.success,
          boxShadow: premiumShadows.md,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      };

    case 'subtle':
      return {
        ...baseStyles,
        background: premiumGradients.subtle,
        border: `1px solid ${theme.colors.premiumBlue ? theme.colors.premiumBlue[2] : theme.colors.blue[2]}`,
        color: theme.colors.premiumBlue ? theme.colors.premiumBlue[6] : theme.colors.blue[6],
        '&:hover': {
          background: theme.colors.premiumBlue ? theme.colors.premiumBlue[0] : theme.colors.blue[0],
          transform: 'translateY(-1px)',
          boxShadow: premiumShadows.xs,
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      };

    default:
      return baseStyles;
  }
};

const getSizeStyles = (size: string) => {
  const sizeMap = {
    xs: {
      height: '24px',
      fontSize: '10px',
      padding: '0 8px',
    },
    sm: {
      height: '32px',
      fontSize: '12px',
      padding: '0 12px',
    },
    md: {
      height: '40px',
      fontSize: '14px',
      padding: '0 16px',
    },
    lg: {
      height: '48px',
      fontSize: '16px',
      padding: '0 20px',
    },
    xl: {
      height: '56px',
      fontSize: '18px',
      padding: '0 24px',
    },
  };
  
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
};

const getElevationStyles = (elevation: string) => {
  const elevationMap = {
    none: { boxShadow: 'none' },
    sm: { boxShadow: premiumShadows.sm },
    md: { boxShadow: premiumShadows.md },
    lg: { boxShadow: premiumShadows.lg },
  };
  
  return elevationMap[elevation as keyof typeof elevationMap] || {};
};

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'premium',
  size = 'md',
  elevation = 'sm',
  animated = true,
  loading,
  disabled,
  children,
  style,
  ...props
}) => {
  const theme = useMantineTheme();
  
  const variantStyles = getVariantStyles(variant, theme);
  const sizeStyles = getSizeStyles(size);
  const elevationStyles = getElevationStyles(elevation);
  
  const combinedStyles = {
    ...variantStyles,
    ...sizeStyles,
    ...elevationStyles,
    ...(!animated && { 
      transform: 'none !important',
      transition: 'none !important',
    }),
    ...style,
  };

  // Custom loading component for premium buttons
  const loadingComponent = loading ? (
    <Loader 
      size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} 
      color="currentColor" 
    />
  ) : null;

  return (
    <Button
      {...props}
      variant="filled" // Use filled as base, override with custom styles
      size={size}
      loading={loading}
      disabled={disabled}
      style={combinedStyles}
      data-premium-variant={variant}
      data-testid={`premium-button-${variant}`}
    >
      {loading ? loadingComponent : children}
    </Button>
  );
};

// Convenience components for common variants
export const PremiumGlassButton: React.FC<Omit<PremiumButtonProps, 'variant'>> = (props) => (
  <PremiumButton variant="glass" {...props} />
);

export const PremiumGradientButton: React.FC<Omit<PremiumButtonProps, 'variant'>> = (props) => (
  <PremiumButton variant="gradient" {...props} />
);

export const PremiumSubtleButton: React.FC<Omit<PremiumButtonProps, 'variant'>> = (props) => (
  <PremiumButton variant="subtle" {...props} />
);

export default PremiumButton;