import { RingProgress, Text, Stack } from '@mantine/core';

export type ProgressRingProps = {
  value: number; // 0..100
  size?: number;
  thickness?: number;
  label?: string;
};

export default function ProgressRing({ value, size = 120, thickness = 12, label }: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <Stack align="center" gap={4}>
      <RingProgress
        size={size}
        thickness={thickness}
        sections={[{ value: pct, color: 'blue' }]}
        label={<Text size="lg" fw={600}>{pct}%</Text>}
      />
      {label && (
        <Text size="sm" c="dimmed">{label}</Text>
      )}
    </Stack>
  );
}

