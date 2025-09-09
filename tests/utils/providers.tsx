import { MantineProvider } from '@mantine/core';
import uiTheme from '@/ui/theme';
import type { PropsWithChildren } from 'react';

export function WithMantine({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={uiTheme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}

