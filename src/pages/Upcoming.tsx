import { useMemo, useState } from 'react';
import type { StoreActions, State } from '@/store/types';
import AssignmentCard from '@/ui/AssignmentCard';
import DateGroup from '@/ui/DateGroup';
import { Group, SegmentedControl, Stack } from '@mantine/core';
import { useAppStore, groupByDate } from '@/store/app';
import dayjs from 'dayjs';

export type UpcomingPageProps = {
  state: State;
  actions: StoreActions;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSnooze1h?: (id: string) => void;
};

export default function UpcomingPage({ state, actions, onEdit, onDelete, onSnooze1h }: UpcomingPageProps) {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due-soon' | 'done'>('all');
  const selectUpcoming = useAppStore((s) => s.selectUpcoming);
  const classesFromStore = useAppStore((s) => s.classes);
  const appToggleDone = useAppStore((s) => s.toggleDone);
  const appUpdateAssignment = useAppStore((s) => s.updateAssignment);
  const appDeleteAssignment = useAppStore((s) => s.deleteAssignment);

  const items = selectUpcoming(new Date(), { filter });
  const groups = useMemo(() => groupByDate(items), [items]);

  return (
    <Stack>
      <Group justify="flex-end">
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as any)}
          data={[
            { label: 'All', value: 'all' },
            { label: 'Overdue', value: 'overdue' },
            { label: 'Due soon', value: 'due-soon' },
            { label: 'Done', value: 'done' },
          ]}
        />
      </Group>
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
              classLabel={(classesFromStore.find((c) => c.id === a.classId)?.name) ?? '—'}
              classColor={(classesFromStore.find((c) => c.id === a.classId)?.color) ?? 'gray'}
              onToggleComplete={async (id) => {
                if (actions?.toggleComplete) actions.toggleComplete(id, !a.completed);
                else await appToggleDone(id);
              }}
              onEdit={onEdit}
              onDelete={async (id) => {
                if (onDelete) return onDelete(id);
                if (confirm('Delete this assignment?')) {
                  if (actions?.removeAssignment) actions.removeAssignment(id);
                  else await appDeleteAssignment(id);
                }
              }}
              onSnooze1h={async (id) => {
                const next = dayjs(a.dueAt).add(1, 'hour').toISOString();
                if (actions?.updateAssignment) actions.updateAssignment({ id, dueAt: next });
                else await appUpdateAssignment({ id, dueAt: next } as any);
              }}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
