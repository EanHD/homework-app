import React from 'react';
import { TextInput, TextInputProps, useMantineTheme, rem } from '@mantine/core';
import { IconCheck, IconX, IconLoader } from '@tabler/icons-react';
import { premiumGradients, premiumShadows } from '../../theme/premium';

export interface PremiumInputProps extends Omit<TextInputProps, 'variant'> {
  variant?: 'premium' | 'glass' | 'subtle' | 'standard';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  validation?: 'none' | 'success' | 'error' | 'loading';
  animated?: boolean;
  elevation?: 'none' | 'sm' | 'md';
}

const getVariantStyles = (variant: string, theme: any, validation: string, elevation: string) => {
  const focusRing = theme.other?.interactions?.focusRing?.(theme.colors.premiumBlue?.[6] || theme.colors.blue[6]);
  const motion = theme.other?.motion?.fast || '150ms ease-in-out';
  const elevationMap: Record<string, string | undefined> = {
    none: 'none',
    sm: theme.shadows?.xs,
    md: theme.shadows?.sm,
  };
  const baseStyles = {
    transition: `border-color ${motion}, box-shadow ${motion}, background-color ${motion}, transform ${motion}`,
    borderRadius: theme.radius.md,
    fontSize: theme.fontSizes.sm,
    boxShadow: elevation !== 'none' ? elevationMap[elevation] : undefined,
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  };

  // Validation colors
  const validationColors = {
    success: theme.colors.green[6],
    error: theme.colors.red[6],
    loading: theme.colors.blue[6],
    none: theme.colors.gray[4],
  };

  const validationColor = validationColors[validation as keyof typeof validationColors] || validationColors.none;

  switch (variant) {
    case 'premium':
      return {
        ...baseStyles,
        border: `2px solid ${validation !== 'none' ? validationColor : theme.colors.gray[3]}`,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        boxShadow: validation !== 'none' ? `0 0 0 3px ${validationColor}20` : premiumShadows.xs,
        '&:focus': {
          borderColor: validation !== 'none' ? validationColor : theme.colors.blue[6],
          boxShadow: validation !== 'none' 
            ? `0 0 0 3px ${validationColor}30, ${premiumShadows.sm}`
            : `0 0 0 3px ${theme.colors.blue[6]}20, ${premiumShadows.sm}`,
          transform: 'translateY(-1px)',
        },
        '&:hover': {
          borderColor: validation !== 'none' ? validationColor : theme.colors.gray[4],
          boxShadow: validation !== 'none' ? `0 0 0 2px ${validationColor}15` : premiumShadows.sm,
        },
      };

    case 'glass':
      return {
        ...baseStyles,
        background: premiumGradients.glass,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${validation !== 'none' ? validationColor : 'rgba(255, 255, 255, 0.2)'}`,
        color: theme.colors.dark[9],
        '&:focus': {
          background: 'rgba(255, 255, 255, 0.15)',
          borderColor: validation !== 'none' ? validationColor : theme.colors.blue[6],
          boxShadow: `0 0 0 2px ${validation !== 'none' ? validationColor : theme.colors.blue[6]}30`,
          transform: 'translateY(-1px)',
        },
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.1)',
        },
        '&::placeholder': {
          color: 'rgba(0, 0, 0, 0.5)',
        },
      };

    case 'subtle':
      return {
        ...baseStyles,
        background: premiumGradients.subtle,
        border: `1px solid ${validation !== 'none' ? validationColor : theme.colors.blue[2]}`,
        color: theme.colors.blue[8],
        '&:focus': {
          background: theme.colors.blue[0],
          borderColor: validation !== 'none' ? validationColor : theme.colors.blue[5],
          boxShadow: `0 0 0 2px ${validation !== 'none' ? validationColor : theme.colors.blue[5]}20`,
          transform: 'translateY(-1px)',
        },
        '&:hover': {
          background: theme.colors.blue[0],
          borderColor: validation !== 'none' ? validationColor : theme.colors.blue[3],
        },
      };

    default:
      return {
        ...baseStyles,
        border: `1px solid ${validation !== 'none' ? validationColor : theme.colors.gray[4]}`,
        '&:focus': {
          borderColor: validation !== 'none' ? validationColor : theme.colors.blue[6],
          boxShadow: `0 0 0 2px ${validation !== 'none' ? validationColor : theme.colors.blue[6]}20`,
        },
      };
  }
};

const getSizeStyles = (size: string) => {
  const sizeMap = {
    xs: {
      height: rem(28),
      fontSize: rem(11),
      padding: `${rem(4)} ${rem(8)}`,
    },
    sm: {
      height: rem(32),
      fontSize: rem(12),
      padding: `${rem(6)} ${rem(10)}`,
    },
    md: {
      height: rem(40),
      fontSize: rem(14),
      padding: `${rem(8)} ${rem(12)}`,
    },
    lg: {
      height: rem(48),
      fontSize: rem(16),
      padding: `${rem(10)} ${rem(16)}`,
    },
    xl: {
      height: rem(56),
      fontSize: rem(18),
      padding: `${rem(12)} ${rem(20)}`,
    },
  };
  
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
};

const getValidationIcon = (validation: string, size: string) => {
  const iconSize = size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 22 : 18;
  
  switch (validation) {
    case 'success':
      return <IconCheck size={iconSize} color="green" />;
    case 'error':
      return <IconX size={iconSize} color="red" />;
    case 'loading':
      return <IconLoader size={iconSize} color="blue" className="animate-spin" />;
    default:
      return null;
  }
};

export const PremiumInput: React.FC<PremiumInputProps> = ({
  variant = 'premium',
  size = 'md',
  validation = 'none',
  animated = true,
  elevation = 'sm',
  style,
  rightSection,
  error,
  ...props
}) => {
  const theme = useMantineTheme();
  
  const variantStyles = getVariantStyles(variant, theme, validation, elevation);
  const sizeStyles = getSizeStyles(size);
  
  // Determine validation state from error prop if not explicitly set
  const effectiveValidation = validation !== 'none' ? validation : (error ? 'error' : 'none');
  const validationIcon = getValidationIcon(effectiveValidation, size);
  
  const combinedStyles = {
    ...variantStyles,
    ...sizeStyles,
    ...(!animated && { 
      transform: 'none !important',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    }),
    ...style,
  };

  // Combine validation icon with any provided rightSection
  const finalRightSection = validationIcon ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: rem(8) }}>
      {rightSection}
      {validationIcon}
    </div>
  ) : rightSection;

  return (
    <TextInput
      {...props}
      size={size}
      error={error}
      rightSection={finalRightSection}
      style={combinedStyles}
      data-premium-variant={variant}
      data-premium-validation={effectiveValidation}
      data-testid={`premium-input-${variant}`}
    />
  );
};

// Convenience components for common variants
export const PremiumGlassInput: React.FC<Omit<PremiumInputProps, 'variant'>> = (props) => (
  <PremiumInput variant="glass" {...props} />
);

export const PremiumSubtleInput: React.FC<Omit<PremiumInputProps, 'variant'>> = (props) => (
  <PremiumInput variant="subtle" {...props} />
);

// Validation-specific components
export const PremiumSuccessInput: React.FC<Omit<PremiumInputProps, 'validation'>> = (props) => (
  <PremiumInput validation="success" {...props} />
);

export const PremiumErrorInput: React.FC<Omit<PremiumInputProps, 'validation'>> = (props) => (
  <PremiumInput validation="error" {...props} />
);

export const PremiumLoadingInput: React.FC<Omit<PremiumInputProps, 'validation'>> = (props) => (
  <PremiumInput validation="loading" {...props} />
);

export default PremiumInput;