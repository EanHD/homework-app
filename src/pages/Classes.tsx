import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Group, Stack, Text, Badge, Menu, ActionIcon, Title, Grid } from '@mantine/core';
import { IconDots, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { useAppStore } from '@/store/app';
import ClassForm from '@/ui/modals/ClassForm';

export default function ClassesPage() {
  const classes = useAppStore((s) => s.classes);
  const assignments = useAppStore((s) => s.assignments);
  const addClass = useAppStore((s) => s.addClass);
  const updateClass = useAppStore((s) => s.updateClass);
  const deleteClass = useAppStore((s) => s.deleteClass);

  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Keyboard shortcut: 'c' to open Add Class
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setEditingId(null);
        setOpened(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openTasksCount = (classId: string) =>
    assignments.filter((a) => a.classId === classId && !a.archivedAt && !a.completed).length;

  const handleSubmit = async (values: { name: string; emoji: string; color: string }) => {
    if (editingId) {
      await updateClass({ id: editingId, name: values.name, emoji: values.emoji, color: values.color });
    } else {
      await addClass({ name: values.name, emoji: values.emoji, color: values.color });
    }
    setOpened(false);
    setEditingId(null);
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Classes</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditingId(null); setOpened(true); }} aria-label="Add class">
          Add class
        </Button>
      </Group>

      {classes.length === 0 ? (
        <Text c="dimmed">No classes yet. Use “Add class” to create one.</Text>
      ) : (
        <Grid gutter="md">
          {classes.map((c) => (
            <Grid.Col key={c.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card withBorder radius="md" p="md">
                <Group justify="space-between" align="flex-start">
                  <Group gap="xs">
                    <Text>{c.emoji}</Text>
                    <Stack gap={2}>
                      <Text fw={600}>{c.name}</Text>
                      <Text size="sm" c="dimmed">
                        {openTasksCount(c.id)} open tasks
                      </Text>
                    </Stack>
                  </Group>
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle" aria-label="Class actions">
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => { setEditingId(c.id); setOpened(true); }}>
                        Edit
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={async () => {
                        if (confirm('Delete this class? This also deletes its assignments.')) {
                          await deleteClass(c.id);
                        }
                      }}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Group mt="sm">
                  {c.color?.startsWith('#') ? (
                    <Badge variant="filled" styles={{ root: { backgroundColor: c.color, color: '#fff' } }}>{c.color}</Badge>
                  ) : (
                    <Badge color={c.color || 'gray'}>{c.color || '—'}</Badge>
                  )}
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      <ClassForm
        opened={opened}
        onClose={() => { setOpened(false); setEditingId(null); }}
        initial={editingId ? classes.find((x) => x.id === editingId) ?? undefined : undefined}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
