import { Group, Stack, Title, Text } from '@mantine/core';
import { RingProgress } from '@mantine/core';
import type { State } from '@/store/types';
import { selectors } from '@/store/selectors';

export type ProgressHeaderProps = {
  state: State;
  greetingName?: string;
};

export default function ProgressHeader({ state, greetingName }: ProgressHeaderProps) {
  const pct = selectors.progressPercent(state);
  const name = greetingName?.trim() || 'there';
  return (
    <Group justify="space-between" align="center">
      <Stack gap={4}>
        <Title order={3}>Good {getDayPart()}, {name}</Title>
        <Text c="dimmed">You're {pct}% done for today</Text>
      </Stack>
      <RingProgress
        size={96}
        thickness={10}
        sections={[{ value: pct, color: 'blue' }]}
        label={<Text fw={700}>{pct}%</Text>}
      />
    </Group>
  );
}

function getDayPart() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

