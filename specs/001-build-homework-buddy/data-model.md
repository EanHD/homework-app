# Data Model: Homework Buddy Web

## Entities

### Class
- id: string (uuid)
- name: string (required)
- color: string (hex, e.g., #1E88E5)
- emoji: string (single emoji recommended)
- createdAt: ISO datetime
- updatedAt: ISO datetime

### Assignment
- id: string (uuid)
- classId: string (references Class.id)
- title: string (required)
- dueAt: ISO datetime (local timezone when entered)
- completed: boolean
- completedAt: ISO datetime | null
- createdAt: ISO datetime
- updatedAt: ISO datetime
- notes: string | null
- remindAtMinutes: number | null (minutes before dueAt to notify)

### Preferences
- reminderOffsetMinutes: number (default 0; future enhancement)
- theme: 'light' (fixed in v1)
- lastOpenedAt: ISO datetime (optional)

## Store Contracts

### Actions
- addClass(input: { name: string; color: string; emoji: string }): Class
- updateClass(id: string, patch: Partial<Class>): void
- removeClass(id: string): void (cascades: reassign or delete assignments? Decision: delete assignments of removed class)
- addAssignment(input: { title: string; classId: string; dueAt: string /* ISO */; notes?: string | null; remindAtMinutes?: number | null }): Assignment
- updateAssignment(id: string, patch: Partial<Assignment>): void
- removeAssignment(id: string): void
- toggleComplete(id: string, value?: boolean): void
- hydrate(): Promise<void> (load from IndexedDB)
- persist(): Promise<void> (internal; called on change debounce)

### Selectors
- getAssignmentsForToday(state): string[] (ids)
- getIncompleteAssignmentIds(state): string[]
- byDueDateAscending(state): (a: string, b: string) => number
- progressPercent(state, ids: string[]): number (0..100)
- streakDays(state): number
- getClassMap(state): Record<string, Class>

## Business Rules
- “Today” is determined by device-local date equality between now and assignment.dueAt.
- Overdue = dueAt < now and not completed.
- Streak counts consecutive days, ending today, where at least one assignment was completed each day.
- On class deletion, delete its assignments to avoid orphaned items.
