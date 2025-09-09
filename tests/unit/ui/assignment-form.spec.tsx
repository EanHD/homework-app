import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentForm from '@/ui/AssignmentForm';
import { WithMantine } from '../../utils/providers';

// Mock useMediaQuery to force desktop Modal mode
vi.mock('@mantine/hooks', async (orig) => {
  const mod = await orig();
  return {
    ...mod,
    useMediaQuery: () => false,
  };
});

describe('UI: AssignmentForm validation', () => {
  const actions = {
    addClass: vi.fn(({ name }: any) => ({ id: 'c-new', name, color: '#1E88E5', emoji: '📚' })),
    updateClass: vi.fn(),
    removeClass: vi.fn(),
    addAssignment: vi.fn((payload: any) => ({ id: 'a-new', ...payload })),
    updateAssignment: vi.fn(),
    toggleComplete: vi.fn(),
    removeAssignment: vi.fn(),
  } as any;

  // Use real timers for UI interactions

  it('shows required errors when missing fields', async () => {
    const user = userEvent.setup();

    render(
      <WithMantine>
        <AssignmentForm
          opened
          onClose={vi.fn()}
          actions={actions}
          classes={[{ id: 'c1', name: 'History', color: '#1E88E5', emoji: '📚' }]}
        />
      </WithMantine>
    );

    // Try to submit immediately
    await user.click(screen.getByRole('button', { name: /add assignment/i }));
    expect(await screen.findByText(/title is required/i)).toBeTruthy();
    expect(await screen.findByText(/date is required/i)).toBeTruthy();
  });

  // Minimal validation tests only; further flows covered by integration
});
