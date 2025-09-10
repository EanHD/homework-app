import { Title, Text, Stack, Group, ActionIcon, Badge } from '@mantine/core';
import { IconArchive } from '@tabler/icons-react';
import { useAppStore } from '@/store/app';
import type { Assignment } from '@/store/types';
import AssignmentCard from '@/ui/AssignmentCard';
import ProgressHeader from '@/ui/ProgressHeader';
import EmptyState from '@/ui/EmptyState';

export type TodayViewProps = {
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onArchive?: (assignment: Assignment) => void;
};

export default function TodayView({ onAdd, onEdit, onArchive }: TodayViewProps) {
  const selectToday = useAppStore((s) => s.selectToday);
  const countTodayProgress = useAppStore((s) => s.countTodayProgress);
  const toggleDone = useAppStore((s) => s.toggleDone);
  const captureUndo = useAppStore((s) => s.captureUndo);
  const classes = useAppStore((s) => s.classes);
  const assignments = selectToday();
  const { total, completed } = countTodayProgress();

  const handleToggleComplete = async (id: string) => {
    await captureUndo();
    await toggleDone(id);
  };

  const handleArchive = async (assignment: Assignment) => {
    if (onArchive) {
      await captureUndo();
      onArchive(assignment);
    }
  };

  return (
    <Stack gap="md">
      <ProgressHeader totalToday={total} completedToday={completed} />
      
      {assignments.length === 0 ? (
        <EmptyState 
          title="Nothing due today. Take a breath! 🌟" 
          onAction={onAdd}
        />
      ) : (
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Title order={3}>Today's Tasks</Title>
            {completed > 0 && (
              <Badge variant="light" color="green" size="sm">
                {completed}/{total} done
              </Badge>
            )}
          </Group>
          
          {assignments.map((assignment) => {
            const classInfo = classes.find(c => c.id === assignment.classId);
            return (
              <AssignmentCard
                key={assignment.id}
                id={assignment.id}
                title={assignment.title}
                dueAt={assignment.dueAt}
                completed={assignment.completed}
                completedAt={assignment.completedAt}
                classLabel={classInfo?.name ?? 'Unknown'}
                classColor={classInfo?.color ?? 'gray'}
                onToggleComplete={handleToggleComplete}
                onEdit={onEdit}
                onDelete={async (id) => {
                  const toArchive = assignments.find(a => a.id === id);
                  if (toArchive) {
                    await handleArchive(toArchive);
                  }
                }}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
