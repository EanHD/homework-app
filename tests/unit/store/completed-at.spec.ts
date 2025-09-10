import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleDone, migrateCompletedAt } from '@/store/repository';
import { loadState, saveState } from '@/store/persistence';
import type { State, Assignment } from '@/store/types';

vi.mock('@/store/persistence', () => ({
  loadState: vi.fn(),
  saveState: vi.fn(),
  __esModule: true,
}));

const mockLoad = vi.mocked(loadState);
const mockSave = vi.mocked(saveState);

function a(id: string, overrides: Partial<Assignment> = {}): Assignment {
  return {
    id,
    title: id,
    classId: 'c1',
    dueAt: new Date().toISOString(),
    completed: false,
    notes: null,
    remindAtMinutes: null,
    completedAt: null,
    archivedAt: null,
    ...overrides,
  };
}

describe('completedAt behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-10T12:00:00Z'));
    vi.clearAllMocks();
  });

  it('toggleDone sets and clears completedAt', async () => {
    const s: State = { classes: [], assignments: [a('a1')], preferences: {} };
    mockLoad.mockResolvedValue(s);
    await toggleDone('a1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      assignments: [expect.objectContaining({ completed: true, completedAt: expect.any(String) })],
    }));

    mockSave.mockClear();
    const s2: State = { classes: [], assignments: [a('a1', { completed: true, completedAt: '2025-09-10T12:00:00Z' })], preferences: {} };
    mockLoad.mockResolvedValue(s2);
    await toggleDone('a1');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      assignments: [expect.objectContaining({ completed: false, completedAt: null })],
    }));
  });

  it('migrateCompletedAt sets timestamps for legacy done items', async () => {
    const s: State = { classes: [], assignments: [a('a1', { completed: true, completedAt: null })], preferences: {} };
    mockLoad.mockResolvedValue(s);
    await migrateCompletedAt();
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      assignments: [expect.objectContaining({ completed: true, completedAt: expect.any(String) })],
    }));
  });
});

