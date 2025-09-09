import { Group, Text, RingProgress, Center, Tooltip } from '@mantine/core';

export interface ProgressHeaderProps {
  totalToday: number;
  completedToday: number;
}

export default function ProgressHeader({ totalToday, completedToday }: ProgressHeaderProps) {
  const hasTasks = totalToday > 0;
  const pct = hasTasks ? Math.min(100, Math.round((completedToday / totalToday) * 100)) : 0;

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

  // Keep ring aligned to the right; wrapper receives focus outline via global a11y.css when tabbed
  return (
    <Group justify="flex-end" align="center" wrap="nowrap" style={{ width: '100%' }}>
      <div tabIndex={0} aria-label={hasTasks ? `${pct}% done` : 'No assignments yet'}>{ring}</div>
    </Group>
  );
}
