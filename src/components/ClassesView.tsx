import { 
  Title, Text, Stack, Group, Badge, Card, ActionIcon, 
  Menu, Box, Progress, Tooltip 
} from '@mantine/core';
import { IconDots, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { useAppStore } from '@/store/app';
import type { Class, Assignment } from '@/store/types';
import EmptyState from '@/ui/EmptyState';

export type ClassesViewProps = {
  onAdd?: () => void;
  onEdit?: (classId: string) => void;
  onDelete?: (classId: string) => void;
  onAddAssignment?: (classId: string) => void;
};

function getClassStats(classId: string, assignments: Assignment[]) {
  const classAssignments = assignments.filter(a => a.classId === classId && !a.archivedAt);
  const total = classAssignments.length;
  const completed = classAssignments.filter(a => a.completed).length;
  const overdue = classAssignments.filter(a => 
    !a.completed && new Date(a.dueAt) < new Date()
  ).length;
  
  return { total, completed, overdue };
}

export default function ClassesView({ onAdd, onEdit, onDelete, onAddAssignment }: ClassesViewProps) {
  const classes = useAppStore((s) => s.classes);
  const assignments = useAppStore((s) => s.assignments);

  if (classes.length === 0) {
    return (
      <Stack gap="md">
        <Title order={3}>Classes</Title>
        <EmptyState 
          title="No classes yet 📚" 
          body="Create your first class to organize your assignments."
          cta="Add Class"
          onAction={onAdd}
        />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>Classes</Title>
        <Badge variant="light" color="blue" size="sm">
          {classes.length} classes
        </Badge>
      </Group>
      
      <Stack gap="sm">
        {classes.map((classItem) => {
          const stats = getClassStats(classItem.id, assignments);
          const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
          
          return (
            <Card key={classItem.id} withBorder radius="md" p="md">
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" align="center">
                  <Box
                    style={{
                      fontSize: '2rem',
                      lineHeight: 1,
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      backgroundColor: `var(--mantine-color-${classItem.color}-1)`,
                    }}
                  >
                    {classItem.emoji}
                  </Box>
                  
                  <Stack gap={4}>
                    <Text fw={600} size="lg">{classItem.name}</Text>
                    <Group gap="xs">
                      {stats.total > 0 && (
                        <Badge 
                          variant="light" 
                          color={stats.completed === stats.total ? 'green' : 'blue'}
                          size="sm"
                        >
                          {stats.completed}/{stats.total} done
                        </Badge>
                      )}
                      {stats.overdue > 0 && (
                        <Badge variant="light" color="red" size="sm">
                          {stats.overdue} overdue
                        </Badge>
                      )}
                      {stats.total === 0 && (
                        <Text size="sm" c="dimmed">No assignments</Text>
                      )}
                    </Group>
                  </Stack>
                </Group>

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item 
                      leftSection={<IconPlus size={14} />}
                      onClick={() => onAddAssignment?.(classItem.id)}
                    >
                      Add Assignment
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<IconPencil size={14} />}
                      onClick={() => onEdit?.(classItem.id)}
                    >
                      Edit Class
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => onDelete?.(classItem.id)}
                    >
                      Delete Class
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
              
              {stats.total > 0 && (
                <Box mt="sm">
                  <Tooltip label={`${stats.completed}/${stats.total} assignments completed`}>
                    <Progress 
                      value={progressPercent} 
                      color={stats.completed === stats.total ? 'green' : classItem.color}
                      size="sm"
                      radius="xl"
                    />
                  </Tooltip>
                </Box>
              )}
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}

