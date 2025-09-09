import { Stack } from '@mantine/core';
import type { Assignment, Class, ID } from '@/store/types';
import { byDueDateAscending } from '@/store/selectors';
import AssignmentCard from './AssignmentCard';

export type AssignmentListProps = {
  assignments: Assignment[];
  classMap: Record<ID, Class>;
  onToggleComplete?: (id: string, next: boolean) => void;
  onEdit?: (id: string) => void;
};

export default function AssignmentList({ assignments, classMap, onToggleComplete, onEdit }: AssignmentListProps) {
  const sorted = byDueDateAscending(assignments);
  return (
    <Stack>
      {sorted.map((a) => (
        <AssignmentCard
          key={a.id}
          id={a.id}
          title={a.title}
          dueAt={a.dueAt}
          completed={a.completed}
          classLabel={classMap[a.classId]?.name ?? '—'}
          classColor={classMap[a.classId]?.color ?? 'gray'}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
        />
      ))}
    </Stack>
  );
}

