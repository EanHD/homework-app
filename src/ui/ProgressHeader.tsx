import { Group, Text, RingProgress, Center, Tooltip } from '@mantine/core';

export interface ProgressHeaderProps {
  totalToday: number;
  completedToday: number;
  firstName?: string; // optional user name
}

function getGreeting(firstName?: string): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const name = firstName || 'there';
  return `Good ${timeOfDay}, ${name}`;
}

export default function ProgressHeader({ totalToday, completedToday, firstName }: ProgressHeaderProps) {
  const hasTasks = totalToday > 0;
  const pct = hasTasks ? Math.min(100, Math.round((completedToday / totalToday) * 100)) : 0;
  const greeting = getGreeting(firstName);

  const numericStyle = {
    fontVariantNumeric: 'tabular-nums lining-nums',
    fontFeatureSettings: '"tnum" 1, "lnum" 1',
  } as const;

  const ring = hasTasks ? (
    <RingProgress
      size={96}
      thickness={10}
      roundCaps
      sections={[{ value: pct, color: 'blue.6' }]}
      rootColor="gray.1"
      label={
        <Center style={{ flexDirection: 'column' }}>
          <Text fw={700} style={numericStyle}>
            {pct}%
          </Text>
          <Text c="dimmed" size="xs">
            done
          </Text>
        </Center>
      }
    />
  ) : (
    <Tooltip label="No assignments yet">
      <RingProgress
        size={96}
        thickness={10}
        roundCaps
        sections={[{ value: 0, color: 'gray.3' }]}
        rootColor="gray.1"
      />
    </Tooltip>
  );

  // Keep ring aligned to the right; greeting on the left
  return (
    <Group justify="space-between" align="center" wrap="nowrap" style={{ width: '100%' }}>
      <Text size="xl" fw={500} c="gray.7">
        {greeting}
      </Text>
      <div tabIndex={0} aria-label={hasTasks ? `${pct}% done` : 'No assignments yet'}>{ring}</div>
    </Group>
  );
}
