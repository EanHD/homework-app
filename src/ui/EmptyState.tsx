import { Button, Center, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export type EmptyStateProps = {
  title: string;
  body?: string;
  cta?: string;
  onAction?: () => void;
};

export default function EmptyState({ title, body, cta = 'Add your first assignment', onAction }: EmptyStateProps) {
  return (
    <Center p="xl">
      <Stack align="center" gap="sm">
        <div aria-hidden style={{ fontSize: 48 }}>📄</div>
        <Text fw={600}>{title}</Text>
        {body && <Text c="dimmed" ta="center" maw={420}>{body}</Text>}
        {onAction && (
          <Button leftSection={<IconPlus size={16} />} onClick={onAction}>{cta}</Button>
        )}
      </Stack>
    </Center>
  );
}

