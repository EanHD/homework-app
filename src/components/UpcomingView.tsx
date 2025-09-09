import { Title, Text, Stack } from '@mantine/core';
import type { State, StoreActions } from '@/store/types';
import { selectors } from '@/store/selectors';
import AssignmentList from './AssignmentList';

export type UpcomingViewProps = {
  state: State;
  actions: StoreActions;
};

export default function UpcomingView({ state, actions }: UpcomingViewProps) {
  const ids = selectors.getIncompleteAssignmentIds(state);
  const items = selectors.byDueDateAscending(
    ids.map((id) => state.assignments.find((a) => a.id === id)!).filter(Boolean)
  );
  const classMap = selectors.getClassMap(state);
  return (
    <Stack>
      <Title order={3}>Upcoming</Title>
      {items.length === 0 ? (
        <Text c="dimmed">No upcoming assignments.</Text>
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

