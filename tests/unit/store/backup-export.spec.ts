import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportData, importData } from '../../../src/store/repository';
import { State } from '../../../src/store/types';

// Mock dependencies
vi.mock('../../../src/store/persistence', () => ({
  saveState: vi.fn(),
  loadState: vi.fn(),
}));

const mockSaveState = vi.mocked(await import('../../../src/store/persistence')).saveState;
const mockLoadState = vi.mocked(await import('../../../src/store/persistence')).loadState;

describe('Export/Import functionality', () => {
  const mockState: State = {
    classes: [
      {
        id: 'class1',
        name: 'Mathematics',
        color: '#1E88E5',
        emoji: '📐'
      },
      {
        id: 'class2',
        name: 'History',
        color: '#8E24AA',
        emoji: '📚'
      }
    ],
    assignments: [
      {
        id: 'assignment1',
        title: 'Calculus Homework',
        notes: 'Chapter 5 exercises',
        dueAt: '2024-12-25T23:59:00Z',
        completed: false,
        classId: 'class1',
        remindAtMinutes: 60
      },
      {
        id: 'assignment2',
        title: 'History Essay',
        notes: 'World War 2 analysis',
        dueAt: '2024-12-30T23:59:00Z',
        completed: true,
        completedAt: '2024-12-20T00:00:00Z',
        classId: 'class2',
        remindAtMinutes: 120
      }
    ],
    preferences: {
      theme: 'auto',
      notifications: true,
      startOfWeek: 1
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadState.mockResolvedValue(mockState);
  });

  describe('exportData', () => {
    it('exports current state with metadata', async () => {
      const result = await exportData();
      
      expect(mockLoadState).toHaveBeenCalled();
      expect(result).toEqual({
        version: '1.0',
        exportedAt: expect.any(String),
        classes: mockState.classes,
        assignments: mockState.assignments
      });
      
      // Check that exportedAt is a valid ISO date
      expect(new Date(result.exportedAt)).toBeInstanceOf(Date);
    });

    it('handles export when no state exists', async () => {
      mockLoadState.mockResolvedValue(null);

      const result = await exportData();
      
      expect(result).toEqual({
        version: '1.0',
        exportedAt: expect.any(String),
        classes: [],
        assignments: []
      });
    });
  });

  describe('importData', () => {
    beforeEach(() => {
      // Reset to empty state for cleaner testing
      mockLoadState.mockResolvedValue({
        classes: [],
        assignments: [],
        preferences: {}
      });
    });

    it('imports valid data successfully', async () => {
      const importPayload = {
        version: '1.0',
        classes: [mockState.classes[0]],
        assignments: [mockState.assignments[0]]
      };
      
      const result = await importData(importPayload);
      
      expect(result.success).toBe(true);
      expect(result.classesAdded).toBe(1);
      expect(result.assignmentsAdded).toBe(1);
      expect(result.errors).toEqual([]);
      expect(mockSaveState).toHaveBeenCalled();
    });

    it('merges with existing data without duplicates', async () => {
      // Set up existing state
      mockLoadState.mockResolvedValue(mockState);

      const newClass = {
        id: 'class3',
        name: 'Science',
        color: '#4CAF50',
        emoji: '🔬'
      };

      const importPayload = {
        version: '1.0',
        classes: [
          mockState.classes[0], // Duplicate - should be ignored
          newClass // New - should be added
        ],
        assignments: []
      };
      
      const result = await importData(importPayload);
      
      expect(result.success).toBe(true);
      expect(result.classesAdded).toBe(1); // Only the new class
      expect(result.assignmentsAdded).toBe(0);
      
      // Verify the saved state includes both existing and new classes
      const savedState = mockSaveState.mock.calls[0][0] as State;
      expect(savedState.classes).toHaveLength(3);
      expect(savedState.classes.find(c => c.id === 'class3')).toBeDefined();
    });

    it('handles invalid class data', async () => {
      const importPayload = {
        version: '1.0',
        classes: [
          { id: 'valid', name: 'Valid Class', color: '#123456', emoji: '📚' },
          { id: '', name: 'Invalid - no ID' }, // Invalid: missing ID
          { id: 'valid2', name: '' }, // Invalid: missing name
        ],
        assignments: []
      };
      
      const result = await importData(importPayload);
      
      expect(result.success).toBe(false);
      expect(result.classesAdded).toBe(1); // Only the valid class
      expect(result.errors).toContain('Invalid class data: missing id or name');
    });

    it('handles invalid assignment data', async () => {
      const importPayload = {
        version: '1.0',
        classes: [],
        assignments: [
          {
            id: 'valid',
            title: 'Valid Assignment',
            classId: 'class1',
            dueAt: '2024-12-25T23:59:00Z',
            completed: false,
            notes: null,
            remindAtMinutes: null
          },
          { id: '', title: 'Invalid - no ID' }, // Invalid: missing ID
          { id: 'valid2', title: '', classId: 'class1' }, // Invalid: missing title
          { id: 'valid3', title: 'No class', classId: '' }, // Invalid: missing classId
        ]
      };
      
      const result = await importData(importPayload);
      
      expect(result.success).toBe(false);
      expect(result.assignmentsAdded).toBe(1); // Only the valid assignment
      expect(result.errors).toContain('Invalid assignment data: missing required fields');
    });

    it('handles unsupported version', async () => {
      const importPayload = {
        version: '2.0', // Unsupported version
        classes: [],
        assignments: []
      };
      
      const result = await importData(importPayload);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unsupported version: 2.0');
    });

    it('handles missing version gracefully', async () => {
      const importPayload = {
        // No version specified
        classes: [mockState.classes[0]],
        assignments: []
      };
      
      const result = await importData(importPayload);
      
      expect(result.success).toBe(true);
      expect(result.classesAdded).toBe(1);
    });

    it('handles import errors gracefully', async () => {
      mockLoadState.mockRejectedValue(new Error('Database error'));
      
      const result = await importData({
        version: '1.0',
        classes: [],
        assignments: []
      });
      
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Import failed: Database error');
    });

    it('handles empty import payload', async () => {
      const result = await importData({});
      
      expect(result.success).toBe(true);
      expect(result.classesAdded).toBe(0);
      expect(result.assignmentsAdded).toBe(0);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Data integrity', () => {
    it('preserves data structure in export/import cycle', async () => {
      // Export data
      const exported = await exportData();
      
      // Clear state
      mockLoadState.mockResolvedValue({
        classes: [],
        assignments: [],
        preferences: {}
      });
      
      // Import the exported data
      const importResult = await importData(exported);
      
      expect(importResult.success).toBe(true);
      expect(importResult.classesAdded).toBe(mockState.classes.length);
      expect(importResult.assignmentsAdded).toBe(mockState.assignments.length);
    });

    it('handles boolean and date values correctly', async () => {
      const assignmentWithDates = {
        id: 'test-assignment',
        title: 'Test Assignment',
        classId: 'class1',
        dueAt: '2024-12-25T23:59:00Z',
        completed: true,
        completedAt: '2024-12-20T00:00:00Z',
        notes: 'Test notes',
        remindAtMinutes: 120
      };

      const importPayload = {
        version: '1.0',
        classes: [],
        assignments: [assignmentWithDates]
      };
      
      const result = await importData(importPayload);
      
      expect(result.success).toBe(true);
      
      // Verify that boolean and date values are preserved
      const savedState = mockSaveState.mock.calls[0][0] as State;
      const savedAssignment = savedState.assignments.find(a => a.id === 'test-assignment');
      
      expect(savedAssignment?.completed).toBe(true);
      expect(savedAssignment?.dueAt).toBe('2024-12-25T23:59:00Z');
      expect(savedAssignment?.completedAt).toBe('2024-12-20T00:00:00Z');
    });
  });
});
