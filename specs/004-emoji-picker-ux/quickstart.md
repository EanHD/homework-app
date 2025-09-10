````markdown
# Quickstart: Emoji Picker UX + Onboarding Polish

**Feature**: 004-emoji-picker-ux  
**Duration**: ~30 minutes  
**Prerequisites**: Homework Buddy app running locally or deployed

## Quick Validation Steps

### 1. First-Run Onboarding (5 min)
```bash
# Clear localStorage to simulate first-run user
# In browser devtools console:
localStorage.clear()
# Reload the app
```

**Expected behavior**:
- [ ] Onboarding modal appears with "Welcome to Homework Buddy"
- [ ] Shows 3 steps with Next/Skip options
- [ ] "Add sample data" button creates 2 classes + 3 assignments
- [ ] Completing onboarding doesn't re-trigger on reload
- [ ] Can skip at any step

### 2. Emoji Picker Integration (10 min)
```bash
# Navigate to Classes page
# Click "Add Class" button
```

**Expected behavior**:
- [ ] Class form shows emoji field with button/input
- [ ] Clicking emoji field opens built-in picker (not OS picker)
- [ ] Picker shows categories: Recent, Smileys, Animals, Food, etc.
- [ ] Search box filters emojis by name/keywords
- [ ] Selecting emoji closes picker and fills field
- [ ] Recent emojis section updates and persists across sessions

### 3. Live Updates & Done Items (5 min)
```bash
# From Today view:
# Add a new assignment
# Mark an assignment as done
# Navigate away and back to Today
```

**Expected behavior**:
- [ ] Today view updates immediately without refresh
- [ ] Progress ring recalculates automatically
- [ ] Done items remain visible with strikethrough + muted styling
- [ ] Greeting shows appropriate time: "Good morning/afternoon/evening"
- [ ] When no tasks due today, progress ring is empty with tooltip

### 4. Export/Import Safety (5 min)
```bash
# From app menu/settings:
# Click "Export Data"
# Add some new assignments
# Click "Import Data" and select the exported file
```

**Expected behavior**:
- [ ] Export generates JSON file with timestamp in filename
- [ ] File contains all classes and assignments in readable format
- [ ] Import merges data (doesn't replace existing)
- [ ] Import shows result: "X classes added, Y assignments added"
- [ ] No data loss or duplication

### 5. Keyboard Shortcuts (3 min)
```bash
# Press keyboard shortcuts throughout the app:
# 'a' - add assignment
# 'c' - add class (on Classes page)
# '?' - show shortcuts help
# 'e' - edit focused item (when available)
```

**Expected behavior**:
- [ ] Shortcuts work on all pages  
- [ ] Help modal ('?') shows all available shortcuts
- [ ] Shortcuts respect focus (don't trigger in inputs)
- [ ] Modal/drawer shortcuts take precedence

### 6. Archive Cleanup (2 min)
```bash
# In browser devtools console (simulate old completed assignment):
const store = window.__hbStore || useAppStore.getState();
// Manually mark an assignment as completed 100 days ago
// Reload app to trigger boot cleanup
```

**Expected behavior**:
- [ ] Boot cleanup runs automatically on app start
- [ ] Old completed assignments (90+ days) get archived
- [ ] Archived items disappear from Today/Upcoming views
- [ ] Archive operation is logged/visible in console

## Test Scenarios

### Edge Case Testing (Optional)
```javascript
// Browser console commands for edge case testing:

// Test emoji picker with no recent emojis
localStorage.removeItem('homework-buddy/recent-emojis');

// Test onboarding with partial state
localStorage.setItem('homework-buddy/onboarding', '{"completed": false}');

// Test export with large dataset
// (Add 50+ assignments manually or via sample data)

// Test import with malformed JSON
// (Try importing invalid JSON to see error handling)
```

## Performance Validation

### Bundle Size Impact
```bash
npm run build
# Check dist/ folder size vs previous build
# New features should add <50KB to bundle
```

### Runtime Performance
```bash
# In browser devtools Performance tab:
# Record interaction with emoji picker open/close
# Should be <200ms from click to render
# Memory usage should be stable
```

## Accessibility Testing

### Keyboard Navigation
```bash
# Tab through entire app
# All interactive elements should be reachable
# Focus indicators should be visible
# Emoji picker should be keyboard accessible
```

### Screen Reader Testing
```bash
# Enable screen reader (NVDA/JAWS/VoiceOver)
# Navigate through onboarding flow
# Use emoji picker with screen reader
# All actions should be announced properly
```

## PWA Verification

### Manifest & Service Worker
```bash
# In browser devtools Application tab:
# Check Manifest shows correct start_url and scope
# Service Worker should be registered and running
# Notifications should still work after new features
```

### Offline Functionality
```bash
# Disconnect from network
# Test emoji picker (should work offline)
# Test export (should work offline)  
# Test onboarding (should work offline)
```

## Success Criteria

### Must Pass
- [ ] All 6 validation steps complete successfully
- [ ] No console errors during normal usage
- [ ] All existing tests still pass: `npm test`
- [ ] App builds successfully: `npm run build`
- [ ] No accessibility violations (wave.webaim.org)

### Performance Targets
- [ ] Emoji picker opens in <200ms
- [ ] Today view updates in <50ms after changes
- [ ] Bundle size increase <50KB
- [ ] No memory leaks during typical usage

### User Experience
- [ ] Onboarding feels helpful, not intrusive
- [ ] Emoji picker is intuitive and fast
- [ ] Done items visibility makes sense
- [ ] Export/import provides confidence in data safety
- [ ] Keyboard shortcuts feel natural

## Troubleshooting

### Common Issues
- **Onboarding not appearing**: Clear localStorage and hard refresh
- **Emoji picker not opening**: Check for JavaScript errors in console
- **Export file empty**: Verify app has data to export
- **Import not working**: Check JSON file format matches schema
- **Shortcuts not working**: Ensure focus is not in input field

### Reset Commands
```javascript
// Complete reset for testing
localStorage.clear();
indexedDB.deleteDatabase('homework-buddy');
location.reload();
```

## Next Steps
After successful quickstart validation:
1. Run full test suite: `npm test`
2. Test on mobile PWA installation
3. Verify GitHub Pages deployment works
4. Update documentation with new features

````
