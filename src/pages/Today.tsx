import { useEffect, useMemo, useState } from 'react';
import type { StoreActions, State } from '@/store/types';
import { useAppStore } from '@/store/app';
import ProgressHeader from '@/ui/ProgressHeader';
import QuickFilters, { type FilterValue } from '@/ui/QuickFilters';
import EmptyState from '@/ui/EmptyState';
import AssignmentCard from '@/ui/AssignmentCard';
import { Stack, Group, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export type TodayPageProps = {
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSnooze1h?: (id: string) => void;
};

export default function TodayPage({ onAdd, onEdit, onDelete, onSnooze1h }: TodayPageProps) {
  // Prefer app store for reactivity; fall back to passed props if provided
  const lastChangeToken = useAppStore((s) => s.lastChangeToken);
  const selectToday = useAppStore((s) => s.selectToday);
  const countTodayProgress = useAppStore((s) => s.countTodayProgress);
  const appToggleDone = useAppStore((s) => s.toggleDone);
  const appUpdateAssignment = useAppStore((s) => s.updateAssignment);
  const appDeleteAssignment = useAppStore((s) => s.deleteAssignment);
  const classesFromStore = useAppStore((s) => s.classes);

  // Hash-persisted filter
  const [filter, setFilter] = useState<FilterValue>('all');
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const f = params.get('filter') as FilterValue | null;
      if (f === 'all' || f === 'overdue' || f === 'today' || f === 'done') setFilter(f);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.hash.slice(1));
      params.set('filter', filter);
      const hash = params.toString();
      window.history.replaceState(null, '', `#${hash}`);
    } catch {}
  }, [filter]);

  const { total, completed, pct } = countTodayProgress();
  const allToday = selectToday();

  const items = useMemo(() => {
    const nowMs = Date.now();
    switch (filter) {
      case 'overdue':
        return allToday.filter((a) => !a.completed && new Date(a.dueAt).getTime() < nowMs);
      case 'today':
        return allToday.filter((a) => !a.completed && new Date(a.dueAt).getTime() >= nowMs);
      case 'done':
        return allToday.filter((a) => a.completed);
      case 'all':
      default:
        return allToday;
    }
  }, [allToday, filter, lastChangeToken]);

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
      <ProgressHeader totalToday={total} completedToday={completed} />
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
              classLabel={(classesFromStore.find((c) => c.id === a.classId)?.name) ?? '—'}
              classColor={(classesFromStore.find((c) => c.id === a.classId)?.color) ?? 'gray'}
              onToggleComplete={async (id) => {
                await appToggleDone(id);
                notifications.show({
                  message: a.completed ? 'Marked as not done' : 'Marked as done',
                });
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
                const next = new Date(new Date(a.dueAt).getTime() + 60 * 60 * 1000).toISOString();
                await appUpdateAssignment({ id, dueAt: next } as any);
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
