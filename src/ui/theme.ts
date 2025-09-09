import { createTheme, rem } from '@mantine/core';

// UI theme tokens for the redesign
export const uiTheme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 12,
  colors: {
    blue: [
      '#e6f1fb',
      '#cfe4f8',
      '#9fc9f1',
      '#70aeee',
      '#4896ea',
      '#2f86e7',
      '#1E88E5',
      '#1875c7',
      '#1364aa',
      '#0c4a80',
    ],
    gray: [
      '#f8fafc',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
      '#475569',
      '#334155',
      '#1e293b',
      '#0f172a',
    ],
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.04)',
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 6px 16px rgba(0,0,0,0.12)',
    lg: '0 12px 24px rgba(0,0,0,0.16)',
  },
  spacing: {
    xs: rem(6),
    sm: rem(10),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
});

export default uiTheme;

