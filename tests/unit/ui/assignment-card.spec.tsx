import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentCard from '@/ui/AssignmentCard';
import { WithMantine } from '../../utils/providers';

describe('UI: AssignmentCard', () => {
  const baseProps = {
    id: 'a1',
    title: 'Read chapter 3',
    dueAt: new Date('2025-03-10T12:00:00Z').toISOString(),
    completed: false,
    classLabel: 'History',
    classColor: '#1E88E5',
  };

  it('toggles complete via checkbox and fires menu actions', async () => {
    const user = userEvent.setup();
    const onToggleComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSnooze1h = vi.fn();

    render(
      <WithMantine>
        <AssignmentCard
          {...baseProps}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onSnooze1h={onSnooze1h}
        />
      </WithMantine>
    );

    const checkbox = screen.getByRole('checkbox', { name: /mark complete/i });
    await user.click(checkbox);
    expect(onToggleComplete).toHaveBeenCalledWith('a1', true);

    const more = screen.getByRole('button', { name: /more actions/i });
    await user.click(more);
    await user.click(await screen.findByRole('menuitem', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('a1');

    await user.click(more);
    await user.click(await screen.findByRole('menuitem', { name: /snooze 1h/i }));
    expect(onSnooze1h).toHaveBeenCalledWith('a1');

    await user.click(more);
    await user.click(await screen.findByRole('menuitem', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('a1');
  });
});
