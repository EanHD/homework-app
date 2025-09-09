import { createTheme } from '@mantine/core';

// Light theme with primary blue #1E88E5
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  colors: {
    // Override blue scale to center around #1E88E5
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
      '#0c4a80'
    ],
  },
});

export default theme;

