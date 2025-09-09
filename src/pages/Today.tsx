import { useState, useMemo } from 'react';
import type { State, StoreActions } from '@/store/types';
import { selectors } from '@/store/selectors';
import ProgressHeader from '@/ui/ProgressHeader';
import QuickFilters, { type FilterValue } from '@/ui/QuickFilters';
import EmptyState from '@/ui/EmptyState';
import AssignmentCard from '@/ui/AssignmentCard';
import { Stack } from '@mantine/core';

export type TodayPageProps = {
  state: State;
  actions: StoreActions;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSnooze1h?: (id: string) => void;
};

export default function TodayPage({ state, actions, onAdd, onEdit, onDelete, onSnooze1h }: TodayPageProps) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const classMap = selectors.getClassMap(state);
  const items = selectors.getAssignmentsForToday(state);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'overdue':
        return items.filter((a) => !a.completed && new Date(a.dueAt).getTime() < Date.now());
      case 'today':
        return items.filter((a) => !a.completed);
      case 'done':
        return items.filter((a) => a.completed);
      default:
        return items;
    }
  }, [filter, items]);

  return (
    <Stack gap="md">
      <ProgressHeader state={state} />
      <QuickFilters value={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <EmptyState title="Nothing due. Breathe." onAction={onAdd} />
      ) : (
        <Stack>
          {filtered.map((a) => (
            <AssignmentCard
              key={a.id}
              id={a.id}
              title={a.title}
              dueAt={a.dueAt}
              completed={a.completed}
              classLabel={classMap[a.classId]?.name ?? '—'}
              classColor={classMap[a.classId]?.color ?? 'gray'}
              onToggleComplete={(id, next) => actions.toggleComplete(id, next)}
              onEdit={onEdit}
              onDelete={onDelete}
              onSnooze1h={onSnooze1h}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
