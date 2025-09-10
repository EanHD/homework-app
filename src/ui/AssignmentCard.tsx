import { Card, Group, Text, Checkbox, Badge, ActionIcon, Menu, Stack } from '@mantine/core';
import dayjs from 'dayjs';
import { IconDots, IconPencil, IconTrash, IconClockHour1, IconSun, IconMoon } from '@tabler/icons-react';

export type AssignmentCardProps = {
  id: string;
  title: string;
  dueAt: string; // ISO
  completed: boolean;
  classLabel: string;
  classColor: string; // hex or Mantine color
  onToggleComplete?: (id: string, next: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSnooze1h?: (id: string) => void;
  onSnoozeTonight?: (id: string) => void;
  onSnoozeTomorrow?: (id: string) => void;
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
  onDelete,
  onSnooze1h,
  onSnoozeTonight,
  onSnoozeTomorrow,
}: AssignmentCardProps) {
  const due = dayjs(dueAt);
  const overdue = !completed && due.isBefore(dayjs());
  const dueText = due.format('MMM D, HH:mm');

  return (
    <Card withBorder radius="md" p="md" style={{ borderLeft: overdue ? '3px solid var(--mantine-color-red-6)' : undefined, opacity: completed ? 0.7 : 1 }}>
      <Group align="flex-start" justify="space-between" wrap="nowrap">
        <Checkbox
          checked={completed}
          onChange={(e) => onToggleComplete?.(id, e.currentTarget.checked)}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        />
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={600} style={{ textDecoration: completed ? 'line-through' : 'none' }}>{title}</Text>
            {classColor?.startsWith('#') ? (
              <Badge variant="filled" styles={{ root: { backgroundColor: classColor, color: '#fff' } }}>{classLabel}</Badge>
            ) : (
              <Badge color={classColor || 'gray'} variant="filled">{classLabel}</Badge>
            )}
          </Group>
          <Text size="sm" c={overdue ? 'red.6' : 'dimmed'}>
            {overdue ? 'Overdue • ' : 'Due • '}{dueText}
          </Text>
        </Stack>
        <Menu withinPortal position="bottom-end" shadow="sm">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label="More actions">
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => onEdit?.(id)}>Edit</Menu.Item>
            
            {!completed && (
              <>
                <Menu.Label>Snooze</Menu.Label>
                <Menu.Item leftSection={<IconClockHour1 size={16} />} onClick={() => onSnooze1h?.(id)}>
                  +1 hour
                </Menu.Item>
                <Menu.Item leftSection={<IconMoon size={16} />} onClick={() => onSnoozeTonight?.(id)}>
                  Tonight 8pm
                </Menu.Item>
                <Menu.Item leftSection={<IconSun size={16} />} onClick={() => onSnoozeTomorrow?.(id)}>
                  Tomorrow 9am
                </Menu.Item>
              </>
            )}
            
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => onDelete?.(id)}>Delete</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

