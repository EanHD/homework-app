````markdown
# Feature Specification: Emoji Picker UX + Onboarding Polish

**Feature Branch**: `004-emoji-picker-ux`  
**Created**: 2025-09-09  
**Status**: Draft  
**Input**: UX polish + onboarding + emoji picker for class creation and notes; Today view live updates, done items visibility, first-run onboarding, safety features (undo, export/import), keyboard shortcuts, and PWA verification.

## Execution Flow (main)
```
1. Parse input requirements for emoji picker, onboarding, and UX polish
2. Identify live update mechanism and done items visibility
3. Define emoji picker component with built-in selection (no OS dependency)
4. Specify onboarding flow and sample data generation
5. Plan safety features: undo toasts, export/import functionality
6. Define keyboard shortcuts and accessibility improvements
7. Write testable functional requirements + edge cases
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Non-breaking data changes only; extend Assignment with optional `completedAt`, `archivedAt` if missing
- ✅ Built-in emoji picker component (no OS dependency); store recent emojis in localStorage
- ✅ Live reactivity for Today view; Zustand store already provides this via `lastChangeToken`
- ✅ First-run onboarding with optional sample data; detect new users via localStorage
- ❌ Do not break existing PWA functionality; verify manifest/SW scope is correct

---

## User Scenarios & Testing (mandatory)

1. **Emoji Picker Flow**: Given I'm adding a new class, When I click the emoji field, Then a built-in emoji picker opens with categories (recent, smileys, objects, etc.); When I select an emoji, Then it's added to recents and inserted into the field.

2. **Live Updates**: Given I add/edit/delete an assignment, When I return to Today view, Then the list and progress ring update immediately without refresh; the greeting remains visible with centered progress ring.

3. **Done Items Visibility**: Given I mark an assignment as done in Today or Upcoming, Then it remains visible with muted/strikethrough styling; Given it's been 90+ days since completion, When I open the app, Then it's archived and hidden from default views.

4. **First-Run Onboarding**: Given I'm a new user, When I first open the app, Then I see 3 quick callouts explaining Today/Upcoming/Classes; I can optionally add sample data (2 classes, 3 assignments) or skip to start fresh.

5. **Safety Features**: Given I delete a class or assignment, When the action completes, Then I see an undo toast for 10 seconds; Given I want to backup my data, When I access export, Then I get a JSON file; When I import, Then my data is merged (not replaced).

6. **Keyboard Shortcuts**: Given I press keyboard shortcuts, When I use `a` (add assignment), `c` (add class), `/` (focus search stub), `e` (edit selected), `?` (show shortcuts), Then the appropriate action triggers.

7. **Accessibility**: Given I navigate with keyboard or screen reader, When I traverse the UI, Then focus outlines are visible, ARIA labels are present, and reduced motion is respected.

### Edge Cases
- Progress ring: when `totalToday=0`, hide the percentage label but show empty ring with tooltip "No assignments yet"
- Emoji picker: handle missing emoji support gracefully; fallback to text input
- Archive timing: use UTC day boundaries for consistent 90-day calculation
- Export/import: validate JSON structure; handle version mismatches gracefully
- Onboarding: detect first-run via absence of localStorage data; don't re-trigger

---

## Requirements (mandatory)

### Data & Store Enhancements
- **DS-001**: Ensure Assignment type includes optional `completedAt?: string | null`, `archivedAt?: string | null` (extend if missing, non-breaking).
- **DS-002**: Boot-time cleanup job: archive assignments where `completedAt` is older than 90 days by setting `archivedAt` timestamp.
- **DS-003**: Store recent emojis in localStorage under key `homework-buddy/recent-emojis` (max 24, most recent first).
- **DS-004**: Export functionality: serialize classes + assignments to JSON; import merges data (doesn't replace).

### Emoji Picker Component
- **EP-001**: Built-in EmojiPicker component with categories: Recent, Smileys & People, Animals & Nature, Food & Drink, Activities, Travel & Places, Objects, Symbols.
- **EP-002**: Grid layout with search/filter capability; clicking emoji closes picker and calls onSelect(emoji).
- **EP-003**: Recent emojis section shows last 24 used; updates localStorage on selection.
- **EP-004**: Graceful fallback: if emoji rendering fails, show unicode or text input alternative.

### Today View Live Updates
- **TV-001**: ProgressHeader shows time-based greeting on left, centered progress ring on right; hide percentage label when `totalToday=0`.
- **TV-002**: Zustand store reactivity ensures Today view updates immediately on assignment changes via `lastChangeToken`.
- **TV-003**: Progress calculation: `completedToday / totalToday * 100`; empty state shows greeting + empty ring with tooltip.

### Done Items & Archive
- **DA-001**: Done assignments remain visible in Today/Upcoming with muted styling (opacity 0.7, strikethrough title).
- **DA-002**: AssignmentCard shows completed state clearly; toggle done doesn't remove from view immediately.
- **DA-003**: Background archive job excludes items with `archivedAt` from default selectors; runs on app boot.

### Onboarding Flow
- **OB-001**: Detect first-run user: no localStorage data under `homework-buddy/` keys.
- **OB-002**: Show 3 callouts: (1) "Welcome to Homework Buddy", (2) "Track assignments in Today & Upcoming", (3) "Organize with Classes"; skip button available.
- **OB-003**: Optional "Add sample data" creates: 2 sample classes (Math 🧮, Science 🧪) and 3 sample assignments with various due dates.
- **OB-004**: Onboarding completion sets localStorage flag; never re-trigger unless data is cleared.

### Safety & Convenience
- **SC-001**: Delete actions show undo toast for 10 seconds; clicking undo restores the item.
- **SC-002**: Export button generates JSON download with timestamp filename; import accepts JSON and merges (doesn't replace).
- **SC-003**: Snooze quick actions: +1h, +1d, +1w options in assignment overflow menu.

### Keyboard Shortcuts
- **KS-001**: Global shortcuts: `a` (add assignment), `c` (add class on Classes page), `/` (focus search - stub), `e` (edit focused), `?` (show shortcuts modal).
- **KS-002**: Shortcuts work across pages; modal shows current shortcuts with descriptions.
- **KS-003**: Focus management: shortcuts respect focus traps in modals/drawers.

### Classes CRUD
- **CR-001**: Classes page shows full CRUD: add/edit/delete with confirmation.
- **CR-002**: Class creation/edit uses emoji picker for emoji field and color swatches for color.
- **CR-003**: Show open task count per class (exclude completed and archived).

### PWA Verification
- **PW-001**: Verify manifest scope `/homework-app/`, start_url correct, icons present.
- **PW-002**: Service worker scope matches; 404.html redirects work for GitHub Pages.
- **PW-003**: Notification system functional with proper permission handling.

### Tests
- **TS-001**: Emoji picker: open/close, category navigation, search, recent emojis persistence.
- **TS-002**: Today progress: calculation with/without tasks, live updates, empty state.
- **TS-003**: Archive logic: 90-day cutoff calculation, boot cleanup execution.
- **TS-004**: Export/import: JSON roundtrip, data merging, error handling.
- **TS-005**: Onboarding: first-run detection, sample data creation, completion persistence.

---

## Key Entities

### EmojiPicker Component
- Categories with emoji grids
- Search/filter functionality
- Recent emojis persistence
- onSelect callback interface

### OnboardingGuide Component
- Step-by-step callouts
- Sample data generation
- Completion tracking

### ExportImport Utility
- JSON serialization/deserialization
- Data merging strategies
- Version compatibility

---

## Review & Acceptance Checklist

### Content Quality
- [ ] Emoji picker is self-contained (no OS dependency)
- [ ] Live updates mechanism specified
- [ ] Onboarding flow is non-intrusive
- [ ] Safety features well-defined

### Requirement Completeness
- [ ] Data model extensions are non-breaking
- [ ] All user scenarios covered
- [ ] Keyboard accessibility addressed
- [ ] PWA functionality preserved

---

## Ambiguities / [NEEDS CLARIFICATION]
- Emoji picker positioning: modal vs dropdown vs popover (Assume popover with Portal)
- Sample data specifics: exact assignment titles and due dates (Assume generic but realistic)
- Export filename format: timestamp precision (Assume ISO date: homework-buddy-backup-2025-09-09.json)
- Search stub implementation detail: placeholder vs functional (Assume placeholder with future hookup)
- Snooze action specifics: update dueAt vs separate snooze field (Assume update dueAt directly)

---

## Execution Status
- [ ] Input parsed
- [ ] Requirements generated
- [ ] Ambiguities marked
- [ ] Scenarios defined
- [ ] Spec ready for planning

````
