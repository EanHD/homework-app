import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { archiveCompletedOlderThan } from '@/store/repository';
import { loadState, saveState } from '@/store/persistence';
import type { State, Assignment } from '@/store/types';

// Mock persistence layer
vi.mock('@/store/persistence', () => {
  return {
    loadState: vi.fn(),
    saveState: vi.fn(),
    __esModule: true,
  };
});

const mockLoadState = vi.mocked(loadState);
const mockSaveState = vi.mocked(saveState);

function createAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'test-id',
    title: 'Test Assignment',
    classId: 'class-1',
    dueAt: new Date().toISOString(),
    completed: false,
    notes: null,
    remindAtMinutes: null,
    completedAt: null,
    archivedAt: null,
    ...overrides,
  };
}

describe('Store: Archive functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-09T12:00:00Z'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('archives assignments completed more than 90 days ago', async () => {
    const now = new Date('2025-09-09T12:00:00Z');
    const oldCompletedAssignment = createAssignment({
      id: 'old-completed',
      completed: true,
      completedAt: '2025-06-01T12:00:00Z', // ~100 days ago
    });
    const recentCompletedAssignment = createAssignment({
      id: 'recent-completed',
      completed: true,
      completedAt: '2025-08-15T12:00:00Z', // ~25 days ago
    });
    const pendingAssignment = createAssignment({
      id: 'pending',
      completed: false,
    });

    const mockState: State = {
      classes: [],
      assignments: [oldCompletedAssignment, recentCompletedAssignment, pendingAssignment],
      preferences: {},
    };

    mockLoadState.mockResolvedValue(mockState);

    await archiveCompletedOlderThan(90);

    // Check that saveState was called with archived old assignment
    expect(mockSaveState).toHaveBeenCalledWith(
      expect.objectContaining({
        assignments: expect.arrayContaining([
          expect.objectContaining({
            id: 'old-completed',
            archivedAt: expect.any(String), // Should be archived
          }),
          expect.objectContaining({
            id: 'recent-completed',
            archivedAt: null, // Should not be archived
          }),
          expect.objectContaining({
            id: 'pending',
            archivedAt: null, // Should not be archived
          }),
        ]),
      })
    );
  });

  it('does not archive assignments that are already archived', async () => {
    const alreadyArchivedAssignment = createAssignment({
      id: 'already-archived',
      completed: true,
      completedAt: '2025-05-01T12:00:00Z', // >90 days ago
      archivedAt: '2025-08-01T12:00:00Z', // Already archived
    });

    const mockState: State = {
      classes: [],
      assignments: [alreadyArchivedAssignment],
      preferences: {},
    };

    mockLoadState.mockResolvedValue(mockState);

    const result = await archiveCompletedOlderThan(90);

    // Should not save when no changes are made
    expect(mockSaveState).not.toHaveBeenCalled();
    
    // Result should still return the state
    expect(result).toEqual(mockState);
  });

  it('handles edge case of exactly 90 days', async () => {
    const now = new Date('2025-09-09T12:00:00Z');
    const exactlyOldAssignment = createAssignment({
      id: 'exactly-90-days',
      completed: true,
      completedAt: '2025-06-11T12:00:00Z', // Exactly 90 days ago
    });

    const mockState: State = {
      classes: [],
      assignments: [exactlyOldAssignment],
      preferences: {},
    };

    mockLoadState.mockResolvedValue(mockState);

    const result = await archiveCompletedOlderThan(90);

    // Assignment at exactly 90 days should NOT be archived (> 90 days required)
    // So no save should occur
    expect(mockSaveState).not.toHaveBeenCalled();
    
    // Result should return the original state
    expect(result).toEqual(mockState);
  });

  it('handles empty state gracefully', async () => {
    mockLoadState.mockResolvedValue(null);

    await archiveCompletedOlderThan(90);

    // Should not crash and should not call saveState
    expect(mockSaveState).not.toHaveBeenCalled();
  });
});
