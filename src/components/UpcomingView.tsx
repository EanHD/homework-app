import { Title, Text, Stack, Group, Badge, Divider } from '@mantine/core';
import { useAppStore } from '@/store/app';
import type { Assignment } from '@/store/types';
import AssignmentCard from '@/ui/AssignmentCard';
import DateGroup from '@/ui/DateGroup';
import EmptyState from '@/ui/EmptyState';
import dayjs from 'dayjs';

export type UpcomingViewProps = {
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onArchive?: (assignment: Assignment) => void;
};

function groupAssignmentsByDate(assignments: Assignment[]): Array<{ date: string; assignments: Assignment[] }> {
  const groups = new Map<string, Assignment[]>();
  
  for (const assignment of assignments) {
    const dateKey = dayjs(assignment.dueAt).format('YYYY-MM-DD');
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(assignment);
  }
  
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, assignments]) => ({
      date,
      assignments: assignments.sort((a, b) => 
        new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      ),
    }));
}

export default function UpcomingView({ onAdd, onEdit, onArchive }: UpcomingViewProps) {
  const selectUpcoming = useAppStore((s) => s.selectUpcoming);
  const toggleDone = useAppStore((s) => s.toggleDone);
  const captureUndo = useAppStore((s) => s.captureUndo);
  const classes = useAppStore((s) => s.classes);
  
  // Get all upcoming assignments (excluding archived)
  const upcomingAssignments = selectUpcoming(new Date(), { includeDone: false });
  const groupedAssignments = groupAssignmentsByDate(upcomingAssignments);

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

  if (upcomingAssignments.length === 0) {
    return (
      <Stack gap="md">
        <Title order={3}>Upcoming</Title>
        <EmptyState 
          title="All caught up! 🎉" 
          body="No upcoming assignments to worry about."
          onAction={onAdd}
        />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>Upcoming</Title>
        <Badge variant="light" color="blue" size="sm">
          {upcomingAssignments.length} assignments
        </Badge>
      </Group>
      
      <Stack gap="lg">
        {groupedAssignments.map(({ date, assignments }) => {
          const dateLabel = dayjs(date).format('ddd, MMM D');
          return (
            <Stack key={date} gap="sm">
              <DateGroup label={dateLabel} />
              {assignments.map((assignment) => {
                const classInfo = classes.find(c => c.id === assignment.classId);
                const isOverdue = !assignment.completed && dayjs(assignment.dueAt).isBefore(dayjs());
                
                return (
                  <AssignmentCard
                    key={assignment.id}
                    id={assignment.id}
                    title={assignment.title}
                    dueAt={assignment.dueAt}
                    completed={assignment.completed}
                    completedAt={assignment.completedAt}
                    classLabel={classInfo?.name ?? 'Unknown'}
                    classColor={classInfo?.color ?? (isOverdue ? 'red' : 'gray')}
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
          );
        })}
      </Stack>
    </Stack>
  );
}
