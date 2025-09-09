import { Title, Text, Stack } from '@mantine/core';
import type { State, StoreActions } from '@/store/types';
import { selectors } from '@/store/selectors';
import AssignmentList from './AssignmentList';

export type TodayViewProps = {
  state: State;
  actions: StoreActions;
};

export default function TodayView({ state, actions }: TodayViewProps) {
  const items = selectors.getAssignmentsForToday(state);
  const classMap = selectors.getClassMap(state);
  return (
    <Stack>
      <Title order={3}>Today</Title>
      {items.length === 0 ? (
        <Text c="dimmed">No assignments due today.</Text>
      ) : (
        <AssignmentList
          assignments={items}
          classMap={classMap}
          onToggleComplete={(id, next) => actions.toggleComplete(id, next)}
        />
      )}
    </Stack>
  );
}

