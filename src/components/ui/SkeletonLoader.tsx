import React from 'react';
import { Box, BoxProps, useMantineTheme, rem } from '@mantine/core';
import { premiumGradients } from '../../theme/premium';

export interface SkeletonLoaderProps extends BoxProps {
  variant?: 'text' | 'card' | 'button' | 'circle' | 'rectangle' | 'custom';
  width?: number | string;
  height?: number | string;
  lines?: number; // For text variant
  animated?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  premium?: boolean; // Use premium styling
}

interface SkeletonPresetProps extends Omit<SkeletonLoaderProps, 'variant'> {
  children?: never;
}

const getAnimationDuration = (speed: string) => {
  switch (speed) {
    case 'slow': return '2s';
    case 'fast': return '1s';
    default: return '1.5s';
  }
};

const getShimmerGradient = (premium: boolean, theme: any) => {
  if (premium) {
    return `linear-gradient(90deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.3) 50%, 
      rgba(255, 255, 255, 0.1) 100%
    )`;
  }
  
  return `linear-gradient(90deg, 
    ${theme.colors.gray[1]} 0%, 
    ${theme.colors.gray[0]} 50%, 
    ${theme.colors.gray[1]} 100%
  )`;
};

const getBaseStyles = (premium: boolean, theme: any, animated: boolean, speed: string) => ({
  position: 'relative' as const,
  overflow: 'hidden' as const,
  backgroundColor: premium ? 'rgba(255, 255, 255, 0.05)' : theme.colors.gray[1],
  borderRadius: theme.radius.sm,
  ...(animated && {
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: getShimmerGradient(premium, theme),
      animation: `shimmer ${getAnimationDuration(speed)} infinite linear`,
    },
  }),
});

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangle',
  width = '100%',
  height = rem(20),
  lines = 3,
  animated = true,
  speed = 'normal',
  premium = false,
  style,
  ...props
}) => {
  const theme = useMantineTheme();

  const baseStyles = getBaseStyles(premium, theme, animated, speed);

  // Handle text variant with multiple lines
  if (variant === 'text') {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: rem(8),
          ...style,
        }}
        data-testid="skeleton-text"
        aria-label="Loading content..."
        role="status"
        {...props}
      >
        {Array.from({ length: lines }, (_, i) => (
          <Box
            key={i}
            style={{
              ...baseStyles,
              width: i === lines - 1 ? '75%' : '100%', // Last line shorter
              height: rem(16),
            }}
          />
        ))}
      </Box>
    );
  }

  // Handle other variants
  const variantStyles = (() => {
    switch (variant) {
      case 'circle':
        return {
          borderRadius: '50%',
          width: width || rem(40),
          height: height || width || rem(40),
        };
      case 'button':
        return {
          borderRadius: theme.radius.md,
          width: width || rem(120),
          height: height || rem(40),
        };
      case 'card':
        return {
          borderRadius: theme.radius.md,
          width: width || '100%',
          height: height || rem(200),
        };
      default:
        return {
          width,
          height,
        };
    }
  })();

  return (
    <Box
      style={{
        ...baseStyles,
        ...variantStyles,
        ...style,
      }}
      data-testid={`skeleton-${variant}`}
      aria-label="Loading content..."
      role="status"
      {...props}
    />
  );
};

// Preset components for common use cases
export const SkeletonText: React.FC<SkeletonPresetProps> = (props) => (
  <SkeletonLoader variant="text" {...props} />
);

export const SkeletonCard: React.FC<SkeletonPresetProps> = (props) => (
  <SkeletonLoader variant="card" {...props} />
);

export const SkeletonButton: React.FC<SkeletonPresetProps> = (props) => (
  <SkeletonLoader variant="button" {...props} />
);

export const SkeletonCircle: React.FC<SkeletonPresetProps> = (props) => (
  <SkeletonLoader variant="circle" {...props} />
);

// Complex preset layouts
export interface SkeletonCardLayoutProps extends SkeletonPresetProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showContent?: boolean;
  showActions?: boolean;
}

export const SkeletonCardLayout: React.FC<SkeletonCardLayoutProps> = ({
  showAvatar = true,
  showTitle = true,
  showSubtitle = true,
  showContent = true,
  showActions = true,
  premium = false,
  animated = true,
  speed = 'normal',
  ...props
}) => (
  <Box
    style={{
      padding: rem(16),
      border: `1px solid ${premium ? 'rgba(255,255,255,0.1)' : '#e9ecef'}`,
      borderRadius: rem(8),
      backgroundColor: premium ? 'rgba(255,255,255,0.02)' : 'white',
    }}
    data-testid="skeleton-card-layout"
    {...props}
  >
    {/* Header with avatar and title */}
    {(showAvatar || showTitle || showSubtitle) && (
      <Box style={{ display: 'flex', alignItems: 'center', marginBottom: rem(16) }}>
        {showAvatar && (
          <SkeletonCircle
            width={rem(40)}
            height={rem(40)}
            premium={premium}
            animated={animated}
            speed={speed}
            style={{ marginRight: rem(12) }}
          />
        )}
        <Box style={{ flex: 1 }}>
          {showTitle && (
            <SkeletonLoader
              width="60%"
              height={rem(16)}
              premium={premium}
              animated={animated}
              speed={speed}
              style={{ marginBottom: rem(4) }}
            />
          )}
          {showSubtitle && (
            <SkeletonLoader
              width="40%"
              height={rem(12)}
              premium={premium}
              animated={animated}
              speed={speed}
            />
          )}
        </Box>
      </Box>
    )}

    {/* Content */}
    {showContent && (
      <SkeletonText
        lines={3}
        premium={premium}
        animated={animated}
        speed={speed}
        style={{ marginBottom: rem(16) }}
      />
    )}

    {/* Actions */}
    {showActions && (
      <Box style={{ display: 'flex', gap: rem(8) }}>
        <SkeletonButton
          width={rem(80)}
          premium={premium}
          animated={animated}
          speed={speed}
        />
        <SkeletonButton
          width={rem(60)}
          premium={premium}
          animated={animated}
          speed={speed}
        />
      </Box>
    )}
  </Box>
);

export interface SkeletonFormProps extends SkeletonPresetProps {
  fields?: number;
  showSubmit?: boolean;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 3,
  showSubmit = true,
  premium = false,
  animated = true,
  speed = 'normal',
  ...props
}) => (
  <Box
    style={{ display: 'flex', flexDirection: 'column', gap: rem(16) }}
    data-testid="skeleton-form"
    {...props}
  >
    {Array.from({ length: fields }, (_, i) => (
      <Box key={i}>
        <SkeletonLoader
          width="30%"
          height={rem(14)}
          premium={premium}
          animated={animated}
          speed={speed}
          style={{ marginBottom: rem(6) }}
        />
        <SkeletonLoader
          width="100%"
          height={rem(40)}
          premium={premium}
          animated={animated}
          speed={speed}
        />
      </Box>
    ))}
    
    {showSubmit && (
      <SkeletonButton
        width={rem(120)}
        height={rem(40)}
        premium={premium}
        animated={animated}
        speed={speed}
        style={{ marginTop: rem(8) }}
      />
    )}
  </Box>
);

// Global CSS for shimmer animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
}

export default SkeletonLoader;