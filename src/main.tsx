import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './a11y.css';
import App from './App';
import theme from './theme';
import './sw-registration';
import { createStore } from '@/store/store';
import { createScheduler } from '@/store/scheduler';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>
);

// Initialize lightweight in-app scheduler for near-future reminders
try {
  const store = createStore();
  const scheduler = createScheduler(store);
  // Start scheduler and subscribe to store changes
  const stop = scheduler.start();
  // Re-check shortly to catch async hydration
  setTimeout(() => scheduler.checkNow(), 1000);
  // Optionally expose stop on window for debugging
  (window as any).__hbStopScheduler = stop;
} catch {
  // ignore scheduler init errors in non-browser/test environments
}
