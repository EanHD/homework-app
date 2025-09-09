import { Card, Group, Text, Checkbox, Badge, ActionIcon, Stack } from '@mantine/core';
import type React from 'react';
import dayjs from 'dayjs';

export type AssignmentCardProps = {
  id: string;
  title: string;
  dueAt: string; // ISO
  completed: boolean;
  classLabel: string;
  classColor: string; // hex or Mantine color
  onToggleComplete?: (id: string, next: boolean) => void;
  onEdit?: (id: string) => void;
};

export default function AssignmentCard({
  id,
  title,
  dueAt,
  completed,
  classLabel,
  classColor,
  onToggleComplete,
  onEdit,
}: AssignmentCardProps) {
  const due = dayjs(dueAt);
  const overdue = !completed && due.isBefore(dayjs());
  const dueText = `${due.format('MMM D, HH:mm')}`;

  return (
    <Card withBorder radius="md" p="md">
      <Group align="flex-start" justify="space-between" wrap="nowrap">
        <Checkbox
          checked={completed}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onToggleComplete?.(id, e.currentTarget.checked)}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        />
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={600} style={{ textDecoration: completed ? 'line-through' as const : 'none' }}>
              {title}
            </Text>
            {classColor?.startsWith('#') ? (
              <Badge variant="filled" styles={{ root: { backgroundColor: classColor, color: '#fff' } }}>
                {classLabel}
              </Badge>
            ) : (
              <Badge color={classColor || 'gray'} variant="filled">{classLabel}</Badge>
            )}
          </Group>
          <Text size="sm" c={overdue ? 'red.6' : 'dimmed'}>
            {overdue ? 'Overdue • ' : 'Due • '}{dueText}
          </Text>
        </Stack>
        {onEdit && (
          <ActionIcon variant="subtle" color="gray" aria-label="Edit assignment" onClick={() => onEdit?.(id)}>
            <span aria-hidden>✏️</span>
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
}
