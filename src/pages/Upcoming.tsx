import { useMemo, useState } from 'react';
import type { StoreActions, State } from '@/store/types';
import AssignmentCard from '@/ui/AssignmentCard';
import DateGroup from '@/ui/DateGroup';
import { Group, SegmentedControl, Stack, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAppStore, groupByDate } from '@/store/app';
import dayjs from 'dayjs';

export type UpcomingPageProps = {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSnooze1h?: (id: string) => void;
};

export default function UpcomingPage({ onEdit, onDelete, onSnooze1h }: UpcomingPageProps) {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due-soon' | 'done'>('all');
  const selectUpcoming = useAppStore((s) => s.selectUpcoming);
  const lastChangeToken = useAppStore((s) => s.lastChangeToken);
  const classesFromStore = useAppStore((s) => s.classes);
  const appToggleDone = useAppStore((s) => s.toggleDone);
  const appUpdateAssignment = useAppStore((s) => s.updateAssignment);
  const appDeleteAssignment = useAppStore((s) => s.deleteAssignment);

  const items = useMemo(() => selectUpcoming(new Date(), { filter }), [filter, lastChangeToken, selectUpcoming]);
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
                await appToggleDone(id);
                notifications.show({ message: a.completed ? 'Marked as not done' : 'Marked as done' });
              }}
              onEdit={onEdit}
              onDelete={async (id) => {
                if (onDelete) return onDelete(id);
                if (confirm('Delete this assignment?')) {
                    const removed = a;
                    await appDeleteAssignment(id);
                    const undoId = `undo-${id}`;
                    notifications.show({
                      id: undoId,
                      message: (
                        <Group justify="space-between">
                          <span>Assignment deleted</span>
                          <Button size="xs" variant="light" onClick={async () => {
                            await useAppStore.getState().restoreAssignment(removed);
                            notifications.update({ id: undoId, message: 'Restored', autoClose: 2000 });
                          }}>Undo</Button>
                        </Group>
                      ),
                      autoClose: 10000,
                    });
                }
              }}
              onSnooze1h={async (id) => {
                const next = dayjs(a.dueAt).add(1, 'hour').toISOString();
                await appUpdateAssignment({ id, dueAt: next } as any);
              }}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
