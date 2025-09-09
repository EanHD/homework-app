import { useMemo } from 'react';
import type { State, StoreActions } from '@/store/types';
import { selectors } from '@/store/selectors';
import AssignmentCard from '@/ui/AssignmentCard';
import DateGroup from '@/ui/DateGroup';
import { Stack } from '@mantine/core';
import dayjs from 'dayjs';

export type UpcomingPageProps = {
  state: State;
  actions: StoreActions;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSnooze1h?: (id: string) => void;
};

export default function UpcomingPage({ state, actions, onEdit, onDelete, onSnooze1h }: UpcomingPageProps) {
  const classMap = selectors.getClassMap(state);
  const ids = selectors.getIncompleteAssignmentIds(state);
  const items = selectors.byDueDateAscending(
    ids.map((id) => state.assignments.find((a) => a.id === id)!).filter(Boolean)
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const a of items) {
      const key = dayjs(a.dueAt).format('ddd, MMM D');
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <Stack>
      {groups.map(([label, list]) => (
        <Stack key={label} gap="xs">
          <DateGroup label={label} />
          {list.map((a) => (
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
      ))}
    </Stack>
  );
}
