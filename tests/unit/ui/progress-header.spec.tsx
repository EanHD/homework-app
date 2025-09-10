import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressHeader from '@/ui/ProgressHeader';
import { WithMantine } from '../../utils/providers';

describe('UI: ProgressHeader', () => {
  it('shows 0% with no label when total is 0', async () => {
    render(
      <WithMantine>
        <ProgressHeader totalToday={0} completedToday={0} />
      </WithMantine>
    );

    // Should show tooltip instead of label when no assignments
    const ringProgress = screen.getByLabelText(/no assignments yet/i);
    expect(ringProgress).toBeDefined();
    
    // Should not show percentage text when total is 0
    expect(screen.queryByText('0%')).toBeNull();
  });

  it('shows partial progress correctly', async () => {
    render(
      <WithMantine>
        <ProgressHeader totalToday={5} completedToday={2} />
      </WithMantine>
    );

    // Should show 40% (2/5)
    expect(screen.getByText('40%')).toBeDefined();
    expect(screen.getByText('done')).toBeDefined();
    
    // Should have proper aria-label
    const progressElement = screen.getByLabelText('40% done');
    expect(progressElement).toBeDefined();
  });

  it('shows 100% completion correctly', async () => {
    render(
      <WithMantine>
        <ProgressHeader totalToday={3} completedToday={3} />
      </WithMantine>
    );

    // Should show 100%
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('done')).toBeDefined();
    
    // Should have proper aria-label
    const progressElement = screen.getByLabelText('100% done');
    expect(progressElement).toBeDefined();
  });

  it('shows time-aware greeting', async () => {
    render(
      <WithMantine>
        <ProgressHeader totalToday={1} completedToday={0} firstName="Alice" />
      </WithMantine>
    );

    // Should show greeting with name (time-aware greeting tested via snapshot since time varies)
    const greeting = screen.getByText(/good (morning|afternoon|evening), alice/i);
    expect(greeting).toBeDefined();
  });
});
