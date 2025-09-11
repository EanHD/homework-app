import { useMemo } from 'react';
import {
  AppShell as MantineAppShell,
  Burger,
  Button,
  Group,
  Title,
  NavLink,
  Badge,
  ScrollArea,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import {
  IconCalendarDue,
  IconCalendarTime,
  IconBooks,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

export type NavKey = 'today' | 'upcoming' | 'classes' | 'settings';

export type AppShellProps = {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onAdd: () => void;
  children: ReactNode;
  title?: string;
};

const navItems: { key: NavKey; label: string; icon: React.FC<any> }[] = [
  { key: 'today', label: 'Today', icon: IconCalendarDue },
  { key: 'upcoming', label: 'Upcoming', icon: IconCalendarTime },
  { key: 'classes', label: 'Classes', icon: IconBooks },
  { key: 'settings', label: 'Settings', icon: IconSettings },
];

export default function AppShell({ active, onNavigate, onAdd, children, title }: AppShellProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const nowChip = useMemo(() => dayjs().format('ddd, MMM D'), []);
  const pageTitle = title ?? navItems.find((n) => n.key === active)?.label ?? 'Homework Buddy';

  return (
    <MantineAppShell
      header={{ height: { base: 48, sm: 60 } }}
      navbar={{ width: 260, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <MantineAppShell.Header 
        component="header" 
        aria-label="Top bar"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)', 
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        <Group h="100%" px="sm" justify="space-between" gap="xs">
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label="Toggle navigation" />
            <Title 
              order={4} 
              size="h5"
              style={{ whiteSpace: 'nowrap' }}
            >
              {pageTitle}
            </Title>
            <Badge 
              variant="light" 
              radius="xl" 
              color="gray" 
              aria-label="Current date"
              size="xs"
              hiddenFrom="xs"
            >
              {nowChip}
            </Badge>
          </Group>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={onAdd} 
            visibleFrom="md" 
            data-onboarding="add-button"
            size="sm"
          >
            Add
          </Button>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar component="nav" aria-label="Primary" p="sm" data-onboarding="navigation">
        <ScrollArea type="never" style={{ height: '100%' }}>
          <Stack gap="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                label={item.label}
                leftSection={<item.icon size={18} />}
                active={active === item.key}
                aria-current={active === item.key ? 'page' : undefined}
                onClick={() => {
                  onNavigate(item.key);
                  close();
                }}
              />
            ))}
          </Stack>
        </ScrollArea>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main 
        role="main"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
