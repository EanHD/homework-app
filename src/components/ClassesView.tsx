import { Title, Text, Stack, Group, Badge, Card } from '@mantine/core';
import type { State } from '@/store/types';

export type ClassesViewProps = {
  state: State;
};

export default function ClassesView({ state }: ClassesViewProps) {
  const classes = state.classes;
  return (
    <Stack>
      <Title order={3}>Classes</Title>
      {classes.length === 0 ? (
        <Text c="dimmed">No classes yet. Create one from the form.</Text>
      ) : (
        <Stack>
          {classes.map((c) => (
            <Card key={c.id} withBorder radius="md" p="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <Text>{c.emoji}</Text>
                  <Text fw={600}>{c.name}</Text>
                </Group>
                <Badge color={c.color} variant="light">{c.color}</Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

