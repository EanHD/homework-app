import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpcomingPage from '@/pages/Upcoming';
import { WithMantine } from '../../utils/providers';
import { useAppStore } from '@/store/app';

describe('Upcoming view', () => {
  beforeEach(() => {
    useAppStore.setState({ classes: [{ id: 'c', name: 'History', emoji: '📚', color: '#1E88E5' }], assignments: [], lastChangeToken: 0 }, false);
  });

  it('shows done items and filters work', async () => {
    const user = userEvent.setup();
    const mk = (id: string, dueIso: string, done: boolean) => ({ id, title: id, classId: 'c', dueAt: dueIso, completed: done, notes: null, remindAtMinutes: null });
    const base = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    useAppStore.setState({ assignments: [mk('a1', base, false) as any, mk('a2', base, true) as any] }, false);

    render(
      <WithMantine>
        <UpcomingPage state={{} as any} actions={{} as any} />
      </WithMantine>
    );

    // Both appear under All
    expect(screen.getByText('a1')).toBeTruthy();
    expect(screen.getByText('a2')).toBeTruthy();

    // Switch to Done filter
    await user.click(screen.getByRole('radio', { name: /done/i }));
    expect(screen.queryByText('a1')).toBeNull();
    expect(screen.getByText('a2')).toBeTruthy();
  });
});
