# Data Model: Notifications Reliability & UI Polish

**Feature**: 008-notifications-ui-polish  
**Created**: 2025-09-11  
**Status**: Complete

## Entity Definitions

### Push Subscription Entity
Represents a device's push endpoint registration for receiving notifications.

**Fields**:
- `user_id`: String - Anonymous user identifier (generated client-side)
- `endpoint`: String - Push service endpoint URL (unique per device/browser)
- `p256dh`: String - Public key for message encryption
- `auth`: String - Authentication secret for message encryption  
- `created_at`: Timestamp - Registration timestamp

**Relationships**:
- One-to-many with Scheduled Notifications (user_id foreign key)
- No direct user authentication (anonymous system)

**Validation Rules**:
- `endpoint` must be valid URL format
- `p256dh` and `auth` must be base64-encoded strings
- `user_id` must be consistent UUID format
- Unique constraint on `endpoint` (one registration per device)

**State Transitions**:
- Created → Active (upon successful registration)
- Active → Invalid (when push delivery returns 404/410)
- Invalid → Deleted (cleanup process removes invalid subscriptions)

### Scheduled Notification Entity
Represents a planned notification delivery for an assignment reminder.

**Fields**:
- `id`: UUID - Unique notification identifier
- `user_id`: String - Links to push subscriptions
- `assignment_id`: String - References assignment in main app data
- `title`: String - Notification title text
- `body`: String - Notification body content
- `send_at`: Timestamp - Scheduled delivery time (UTC)
- `sent_at`: Timestamp (nullable) - Actual delivery timestamp
- `url`: String (nullable) - Deep link URL for notification click

**Relationships**:
- Many-to-one with Push Subscriptions (via user_id)
- References assignment data (loose coupling, no FK constraint)

**Validation Rules**:
- `send_at` must be future timestamp when created
- `title` and `body` must be non-empty strings
- `user_id` format must match subscription pattern
- `url` must be valid relative or absolute URL if provided

**State Transitions**:
- Scheduled → Pending (when send_at time arrives)
- Pending → Sent (when successfully delivered to at least one device)
- Pending → Failed (when all delivery attempts fail)
- Any → Cancelled (when explicitly cancelled by user action)

### UI Layout Configuration Entity  
Represents responsive layout parameters and safe-area calculations.

**Fields**:
- `screen_width`: Number - Current viewport width
- `screen_height`: Number - Current viewport height  
- `safe_area_top`: Number - Top inset (status bar, notch)
- `safe_area_bottom`: Number - Bottom inset (home indicator)
- `keyboard_height`: Number - Virtual keyboard height when visible
- `header_height`: Number - App header height in pixels

**Relationships**:
- Runtime-only entity (not persisted)
- Calculated per user session/device

**Validation Rules**:
- All dimensions must be non-negative numbers
- Safe area insets must be within reasonable bounds (0-100px)
- Keyboard height includes virtual keyboard detection

**State Transitions**:
- Calculated → Applied (when layout rules are active)
- Applied → Updated (when viewport or keyboard changes)

### Test Validation Result Entity
Represents the outcome of notification and UI testing scenarios.

**Fields**:
- `test_id`: String - Unique test scenario identifier  
- `test_type`: Enum - 'notification_e2e' | 'ui_layout' | 'permission_flow'
- `status`: Enum - 'pass' | 'fail' | 'skip'  
- `execution_time`: Number - Test duration in milliseconds
- `error_message`: String (nullable) - Failure details if applicable
- `environment`: String - 'development' | 'production' | 'ci'
- `timestamp`: Timestamp - Test execution time

**Relationships**:
- Standalone entity for test reporting
- Aggregated for overall system health metrics

**Validation Rules**:
- `test_type` must be from defined enum values
- `status` determines whether `error_message` is required
- `execution_time` must be positive number
- `environment` must match deployment target

**State Transitions**:
- Created → Running (test execution begins)
- Running → Pass/Fail (test completes with result)
- Any → Archived (after retention period)

## Data Flow Patterns

### Notification Registration Flow
1. User enables notifications → permission check
2. Service worker registers → subscription created
3. Subscription posted to backend → stored in database
4. Assignment created with reminder → scheduled notification created
5. Cron trigger → notification delivery attempted
6. Delivery result → subscription validation/cleanup

### UI Layout Calculation Flow
1. Page load → viewport measurements taken
2. Safe area detection → inset values calculated  
3. Layout rules applied → content positioning updated
4. Keyboard events → dynamic adjustment triggered
5. Orientation change → recalculation performed

### Test Validation Flow
1. Test scenario initiated → validation entity created
2. Test steps executed → progress tracked
3. Assertions evaluated → pass/fail determined
4. Results recorded → status and metrics updated
5. Cleanup performed → temporary data removed

## Storage Considerations

### Persistence Requirements
- **Push Subscriptions**: Persistent (Supabase database table)
- **Scheduled Notifications**: Persistent with cleanup after delivery
- **UI Layout Config**: Runtime-only (CSS variables and JavaScript)
- **Test Results**: Short-term persistence (development/CI reporting)

### Performance Implications
- **Subscription Lookups**: Indexed by `user_id` for efficient queries
- **Notification Queries**: Indexed by `send_at` for cron job performance
- **UI Calculations**: Cached per session to avoid repeated computation
- **Test Data**: Minimal retention to prevent storage bloat

### Scaling Considerations
- **Push Subscriptions**: Linear growth with active users
- **Scheduled Notifications**: Time-bounded growth (cleanup after delivery)
- **UI State**: Per-session memory only
- **Test History**: Configurable retention period

## Migration & Compatibility

### Existing Data Compatibility
- Current push subscription schema is compatible
- Scheduled notification table exists and matches requirements  
- No breaking changes to existing entities
- Additive-only schema modifications if needed

### Version Compatibility
- Backward compatibility maintained for all client interactions
- Database migrations handle schema additions gracefully
- API contracts remain stable for existing functionality
- New test entities are independent of production data

This data model supports the feature requirements while maintaining system simplicity and performance.