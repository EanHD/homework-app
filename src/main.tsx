import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme, rem } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import './a11y.css';
import App from './App';
import uiTheme from '@/ui/theme';
import { useSettingsStore } from '@/store/settings';
import './sw-registration';
import { createStore } from '@/store/store';
import { createScheduler } from '@/store/scheduler';
import { bootCleanup } from '@/store/repository';

function ThemedApp() {
  const colorScheme = useSettingsStore((s) => s.theme);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const scale = fontScale === 'large' ? 1.125 : 1;

  const theme = createTheme({
    ...uiTheme,
    fontSizes: {
      xs: rem(12 * scale),
      sm: rem(14 * scale),
      md: rem(16 * scale),
      lg: rem(18 * scale),
      xl: rem(20 * scale),
    },
  });

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
);

// Initialize lightweight in-app scheduler only if no Push subscription exists
try {
  const store = createStore();
  (async () => {
    try {
      let hasPushSub = false;
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        hasPushSub = !!sub;
      }
      // If a push subscription exists, rely on backend push (avoid duplicate local notifications)
      if (!hasPushSub) {
        const scheduler = createScheduler(store);
        const stop = scheduler.start();
        setTimeout(() => scheduler.checkNow(), 1000);
        (window as any).__hbStopScheduler = stop;
      }
    } catch {
      // ignore and continue
    }
    // Background cleanup: archive done items older than 90 days
    void bootCleanup();
  })();
} catch {
  // ignore scheduler init errors in non-browser/test environments
}
