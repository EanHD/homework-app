````markdown
# Research: Emoji Picker UX + Onboarding Polish

**Phase**: 0 (Research & Requirements Analysis)  
**Date**: 2025-09-09  
**Status**: Complete

## Research Tasks Completed

### 1. Emoji Picker Implementation Approaches

**Decision**: Built-in React component with predefined emoji categories
**Rationale**: 
- No external dependencies or API calls (offline-capable)
- Consistent cross-platform appearance
- Full control over UX and performance
- Lightweight compared to full emoji libraries

**Alternatives considered**:
- OS native emoji picker (rejected: inconsistent UX, mobile limitations)  
- External emoji API (rejected: network dependency, offline issues)
- Third-party library (rejected: bundle size, customization limitations)

**Implementation approach**:
- Hardcoded emoji lists by category (Unicode 15.0 subset)
- Popover positioning with Mantine Portal
- localStorage for recent emojis (max 24, LRU eviction)

### 2. Onboarding Pattern for PWAs

**Decision**: Optional 3-step overlay guide with sample data option
**Rationale**:
- Non-intrusive (skippable at any point)
- Provides immediate value (sample data)
- Industry standard for PWA onboarding
- Respects user autonomy

**Alternatives considered**:
- Forced tutorial (rejected: poor UX)
- Progressive disclosure (rejected: complexity)
- Empty state only (rejected: missed opportunity)

**Implementation approach**:
- Detect first-run via localStorage absence
- Modal overlay with 3 callouts + skip/next buttons
- Sample data: 2 classes, 3 assignments with realistic due dates
- One-time flag prevents re-trigger

### 3. Live Update Mechanism

**Decision**: Leverage existing Zustand `lastChangeToken` pattern
**Rationale**:
- Already implemented and working
- Minimal performance overhead
- Consistent with existing architecture
- No additional complexity

**Implementation approach**:
- Pages subscribe to `lastChangeToken` changes
- Store mutations increment token automatically
- Components re-render only when data actually changes

### 4. Archive Strategy for 90-Day Cleanup

**Decision**: UTC day boundary calculation with boot-time cleanup
**Rationale**:
- Consistent calculation across timezones
- Boot-time execution is sufficient frequency
- Non-blocking background operation
- Preserves user data integrity

**Implementation approach**:
- `completedAt` timestamp when marking done
- `archivedAt` timestamp when archiving (90+ days)
- Boot cleanup in `main.tsx` after store initialization
- Archived items excluded from default selectors

### 5. Export/Import Data Format

**Decision**: JSON with schema versioning and merge strategy
**Rationale**:
- Human-readable format
- Easy to backup/restore
- Merge preserves existing data
- Future-proof with versioning

**Implementation approach**:
- Export: `{ version: "1.0", timestamp: ISO, classes: [], assignments: [] }`
- Import: validate schema, merge by ID, preserve newer timestamps
- Filename: `homework-buddy-backup-YYYY-MM-DD.json`

### 6. Keyboard Shortcuts Implementation

**Decision**: Global event listeners with focus-aware handling
**Rationale**:
- Consistent behavior across pages
- Respect modal/input focus traps
- Standard PWA keyboard navigation
- Accessibility best practice

**Implementation approach**:
- `addEventListener('keydown')` in main components
- Check `document.activeElement` to avoid conflicts
- Modal/drawer shortcuts take precedence
- Help modal (`?`) shows all available shortcuts

## Technical Decisions Summary

| Component | Technology | Justification |
|-----------|------------|---------------|
| Emoji Picker | React + Mantine Popover | Lightweight, consistent UX |
| Recent Emojis | localStorage (JSON) | Persistent, offline-capable |
| Onboarding | Mantine Modal + localStorage flag | Non-intrusive, standard pattern |
| Archive Cleanup | UTC timestamps + boot execution | Reliable, timezone-independent |
| Export/Import | JSON download/upload | User-friendly, future-proof |
| Keyboard Shortcuts | Global listeners + focus checking | Accessible, non-conflicting |

## Constraints Validated

- ✅ **Offline-capable**: All features work without network
- ✅ **Non-breaking**: Extends existing data model only  
- ✅ **Performance**: <200ms emoji picker, <50ms updates
- ✅ **Bundle size**: <50KB additional (emoji data compressed)
- ✅ **Accessibility**: ARIA labels, keyboard navigation, focus management
- ✅ **PWA compatibility**: Preserves manifest, SW, notification functionality

## Risk Mitigation

1. **Emoji rendering differences**: Provide text fallback for unsupported emojis
2. **localStorage quotas**: Limit recent emojis to 24, handle quota exceeded gracefully  
3. **Archive data loss**: Export reminder before major operations
4. **Keyboard conflicts**: Focus-aware prevention, clear precedence rules
5. **Onboarding annoyance**: Always skippable, never re-triggers

## Performance Considerations

- Emoji picker uses virtualization for category grids (>100 emojis)
- Recent emojis cached in memory after first localStorage read
- Archive cleanup batched (max 100 items per execution)
- Export/import operations use Web Workers for large datasets (future)

## Next Phase Requirements

All NEEDS CLARIFICATION resolved. Ready for Phase 1 design with:
- Component interface contracts
- Data model extensions  
- Test scenario specifications
- Integration point definitions

````
