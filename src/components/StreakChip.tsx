import { Badge } from '@mantine/core';

export type StreakChipProps = {
  days: number;
};

export default function StreakChip({ days }: StreakChipProps) {
  const d = Math.max(0, Math.floor(days));
  const label = d === 1 ? 'day' : 'days';
  return (
    <Badge color="orange" variant="filled" radius="lg" leftSection={<span aria-hidden>🔥</span>}>
      {d} {label}
    </Badge>
  );
}

