````markdown
# Data Model: Emoji Picker UX + Onboarding Polish

**Phase**: 1 (Design)  
**Date**: 2025-09-09  
**Status**: Complete

## Extended Entities

### Assignment (Extended)
*Non-breaking extension of existing Assignment type*

```typescript
export type Assignment = {
  // Existing fields (unchanged)
  id: ID;
  title: string;
  classId: ID;
  dueAt: string; // ISO string
  completed: boolean;
  notes: string | null;
  remindAtMinutes: number | null;
  
  // New optional fields (non-breaking)
  completedAt?: string | null; // ISO timestamp when marked complete
  archivedAt?: string | null;  // ISO timestamp when archived (90+ days)
};
```

**Validation Rules**:
- `completedAt`: Must be valid ISO string or null; set when `completed=true`
- `archivedAt`: Must be valid ISO string or null; set by archive cleanup job
- `archivedAt` requires `completedAt` to be non-null (archived items must have been completed)

**State Transitions**:
1. Created → `completed=false, completedAt=null, archivedAt=null`
2. Mark Done → `completed=true, completedAt=NOW(), archivedAt=null`
3. Mark Undone → `completed=false, completedAt=null, archivedAt=null`
4. Archive (90+ days) → `completed=true, completedAt=EXISTING, archivedAt=NOW()`

### New Supporting Types

```typescript
export type EmojiCategory = 
  | 'recent' 
  | 'smileys' 
  | 'animals' 
  | 'food' 
  | 'activities' 
  | 'travel' 
  | 'objects' 
  | 'symbols';

export type EmojiData = {
  emoji: string;     // Unicode emoji character
  name: string;      // English name (for search)
  category: EmojiCategory;
  keywords: string[]; // Search keywords
};

export type RecentEmojis = {
  emojis: string[];  // Max 24, most recent first
  lastUpdated: string; // ISO timestamp
};

export type OnboardingState = {
  completed: boolean;
  completedAt: string | null; // ISO timestamp
  skipped: boolean;
  sampleDataAdded: boolean;
};

export type ExportData = {
  version: string;    // Schema version (e.g., "1.0")
  exportedAt: string; // ISO timestamp
  classes: Class[];
  assignments: Assignment[];
};

export type ImportResult = {
  success: boolean;
  classesAdded: number;
  assignmentsAdded: number;
  errors: string[];
};
```

## localStorage Schema

### Recent Emojis Storage
**Key**: `homework-buddy/recent-emojis`
```json
{
  "emojis": ["😀", "📚", "🎯", "..."],
  "lastUpdated": "2025-09-09T10:30:00.000Z"
}
```

### Onboarding State Storage  
**Key**: `homework-buddy/onboarding`
```json
{
  "completed": true,
  "completedAt": "2025-09-09T10:15:00.000Z",
  "skipped": false,
  "sampleDataAdded": true
}
```

## Component Interfaces

### EmojiPicker Component
```typescript
export interface EmojiPickerProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  target?: HTMLElement; // Anchor element for positioning
  searchable?: boolean; // Default: true
  categories?: EmojiCategory[]; // Default: all categories
}

export interface EmojiPickerRef {
  focusSearch: () => void;
  selectCategory: (category: EmojiCategory) => void;
}
```

### OnboardingGuide Component
```typescript
export interface OnboardingGuideProps {
  onComplete: () => void;
  onSkip: () => void;
  onAddSampleData: () => Promise<void>;
}

export interface OnboardingStep {
  title: string;
  description: string;
  target?: string; // CSS selector for highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
```

### ExportImport Utility
```typescript
export interface ExportImportAPI {
  exportData(): Promise<ExportData>;
  downloadBackup(): Promise<void>; // Triggers file download
  importData(jsonData: string): Promise<ImportResult>;
  validateImportData(jsonData: string): { valid: boolean; errors: string[] };
}
```

## Store Extensions

### Archive Management
```typescript
export interface ArchiveAPI {
  archiveCompletedOlderThan(days: number): Promise<number>; // Returns archived count
  getArchivedAssignments(): Assignment[];
  restoreFromArchive(id: ID): Promise<void>;
  bootCleanup(): Promise<void>; // Called on app start
}
```

### Enhanced Selectors
```typescript
export interface EnhancedSelectors {
  // Existing selectors (unchanged)
  selectToday(now?: Date): Assignment[];
  selectUpcoming(now?: Date, opts?: { includeDone?: boolean }): Assignment[];
  countTodayProgress(now?: Date): { total: number; completed: number; pct: number };
  
  // New selectors
  selectTodayWithDone(now?: Date): Assignment[]; // Includes done items with styling
  selectUpcomingWithDone(now?: Date): Assignment[]; // Includes done items with styling
  selectByArchiveStatus(archived: boolean): Assignment[];
  getOpenTaskCountByClass(classId: ID): number; // Excludes completed & archived
}
```

## Validation & Business Rules

### Archive Rules
1. Only completed assignments can be archived
2. Archive threshold: 90 days from `completedAt` date  
3. Archived items excluded from default views (Today, Upcoming)
4. Archive operation is reversible within reasonable time

### Emoji Rules
1. Recent emojis limited to 24 items (LRU eviction)
2. Emoji selection updates recent list immediately
3. Recent list persists across sessions
4. Fallback to text input if emoji rendering fails

### Onboarding Rules
1. Triggered only on first app load (no localStorage data)
2. Completion prevents re-triggering
3. Sample data creation is optional and one-time
4. Skipping counts as completion

### Export/Import Rules
1. Export includes all non-sensitive data (classes + assignments)
2. Import merges data (doesn't replace)
3. ID conflicts resolved by preserving existing data
4. Timestamp conflicts resolved by newest wins
5. Invalid data rejected with error messages

## Database/Storage Impact

### IndexedDB Schema (via localforage) - No Changes
- Existing `homework-buddy/state/v1` key preserved
- Assignment extensions are optional fields (non-breaking)
- Migration handled by store hydration with default values

### localStorage Additions
- `homework-buddy/recent-emojis`: Emoji picker state
- `homework-buddy/onboarding`: Onboarding completion state
- `homework-buddy/shortcuts-help-seen`: Keyboard help modal state (optional)

### Memory Impact
- Emoji data: ~30KB (compressed unicode subset)
- Recent emojis: <1KB (24 strings)
- Onboarding state: <1KB (boolean flags)
- **Total additional**: ~31KB in memory, ~2KB in localStorage

## Migration Strategy

### Assignment Model Migration
```typescript
// Auto-migration on store hydration
function migrateAssignment(raw: any): Assignment {
  return {
    ...raw,
    completedAt: raw.completedAt ?? null,
    archivedAt: raw.archivedAt ?? null,
  };
}
```

### localStorage Migration
```typescript
// Graceful fallback for missing localStorage keys
function getRecentEmojis(): RecentEmojis {
  try {
    const stored = localStorage.getItem('homework-buddy/recent-emojis');
    return stored ? JSON.parse(stored) : { emojis: [], lastUpdated: new Date().toISOString() };
  } catch {
    return { emojis: [], lastUpdated: new Date().toISOString() };
  }
}
```

## Testing Data Requirements

### Sample Data for Onboarding
```typescript
const SAMPLE_CLASSES: Omit<Class, 'id'>[] = [
  { name: 'Mathematics', emoji: '🧮', color: '#2196F3' },
  { name: 'Science', emoji: '🧪', color: '#4CAF50' },
];

const SAMPLE_ASSIGNMENTS: Omit<Assignment, 'id' | 'classId'>[] = [
  { 
    title: 'Review algebra homework', 
    dueAt: dayjs().add(1, 'day').hour(14).minute(0).toISOString(),
    completed: false,
    notes: 'Chapter 5 exercises',
    remindAtMinutes: 30,
  },
  // ... 2 more realistic assignments
];
```

### Test Data for Edge Cases
- Assignments with various completion states
- Emojis with special unicode characters  
- Large export files (1000+ assignments)
- Corrupted localStorage data
- Invalid import JSON formats

````
