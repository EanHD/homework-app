# Feature Specification: Backend-Powered Push Notifications

**Feature Branch**: `006-push-notifications-via`  
**Created**: 2025-09-10  
**Status**: Draft  
**Input**: User description: "Push notifications via backend + subscriptionStack- Frontend: existing React PWA (GH Pages), Service Worker for push.- Backend: Supabase (Postgres + Edge Functions + Scheduled cron).- Web 


Push: VAPID (public key in client, private key in Edge Function secrets).User flow1) In Settings →








 Notifications: user enables push; browser permission prompt appears.2) We register SW, subscribe to push with VAPID public key, and POST the subscription to Supabase (push_subscriptions).3) When an assignment is created/updated with a reminder time, we upsert a row in scheduled_notifications.4) Every minute a Supabase Scheduled Function runs send-notifications:   - Fetch unsent rows with send_at <= now and within non-quiet hours.   - Load the user's push subscriptions.   - Send Web Push (title/body + deep-link) via VAPID.   - Mark sent_at and cleanup expired subscriptions.Data- Table push_subscriptions(user_id text, endpoint text pk, p256dh text, auth text, created_at timestamptz default now()).- Table scheduled_notifications(id uuid pk, user_id text, assignment_id text, title text, body text, send_at timestamptz, sent_at timestamptz null).- Settings already stored locally; add notificationsEnabled, defaultReminderOffsetMin, quietHours {enabled,start,end}.SW behavior- Listen for 'push' → showNotification(payload).- Listen for 'notificationclick' → focus or open /homework-app/#/assignment/<id>.Security- No auth required; user_id = locally generated UUID stored in localStorage.- Rate-limit per user in the function; remove bad subscriptions on error 410/404.Deliverables- DB schema + Edge Functions: subscribe, schedule, send-notifications.- Client: settings UI, permission flow, SW registration, push subscribe/unsubscribe, schedule calls on CRUD.- Cron: every minute scheduled function trigger in Supabase.- Docs: .env keys, how to rotate VAPID keys, test script."

## User Scenarios & Testing (mandatory)

### Primary User Story
As a student using the homework app, I want to receive timely push notifications about upcoming assignments so that I don’t miss due dates, and I can control when and how these notifications appear.

### Acceptance Scenarios
1. Given notifications are disabled, when the user enables notifications in Settings and grants permission, then the device is registered for push and the app confirms that notifications are enabled.
2. Given an assignment with a reminder time, when the reminder time arrives (outside quiet hours), then the user receives a push notification with a clear title and body, and tapping it opens/focuses the app to the related assignment.
3. Given quiet hours are enabled, when a reminder time falls within quiet hours, then the system does not deliver a notification during quiet hours and instead [NEEDS CLARIFICATION: should it deliver immediately after quiet hours end, or skip?].
4. Given the user disables notifications in Settings, when any future reminders occur, then no push notifications are sent to that device and existing device registrations are revoked.
5. Given the user has multiple devices, when a reminder time arrives, then notifications are delivered to all active device subscriptions for that user.
6. Given a device subscription becomes invalid/expired, when a notification is attempted, then the system removes the invalid subscription and continues processing others.
7. Given the user denies browser permission for notifications, when they attempt to enable notifications in Settings, then the app informs them permission is required and provides a clear recovery path.

### Edge Cases
- Time zones and DST shifts: reminders should align to the user’s local time for both scheduling and quiet hours.
- Duplicate notification prevention when multiple schedule changes happen near the same time.
- Offline or background scenarios where delivery may be delayed by the platform.
- Rapid assignment edits near send time; system should update or cancel previous schedules accordingly.
- Rate limiting per user to avoid spam; define thresholds. [NEEDS CLARIFICATION]
- Uninstall or cleared storage: behavior when local user identifier changes. [NEEDS CLARIFICATION]

## Requirements (mandatory)

### Functional Requirements
- FR-001: Users MUST be able to enable and disable push notifications from a Settings screen.
- FR-002: On enable, the system MUST register the current device for push delivery under an anonymous, locally persisted user identifier.
- FR-003: The system MUST schedule notification reminders whenever an assignment is created or updated to include a reminder time.
- FR-004: The system MUST deliver notification(s) at or after the scheduled time and MUST honor user-configured quiet hours.
- FR-005: Tapping a notification MUST open or focus the app to the specific assignment detail view (deep link).
- FR-006: The system MUST support multiple active device registrations per user and deliver to all valid subscriptions.
- FR-007: The system MUST remove invalid or expired device subscriptions upon delivery errors and continue processing the remainder.
- FR-008: The system MUST apply per-user rate limiting to notification delivery to prevent abuse. [NEEDS CLARIFICATION: specify exact limits and backoff]
- FR-009: The system MUST operate without server-side authentication; an anonymous user identifier MUST be generated and persisted locally.
- FR-010: The system MUST support cryptographic key rotation for push delivery without requiring user intervention. [NEEDS CLARIFICATION: rotation cadence and roll-forward behavior]
- FR-011: The system MUST avoid duplicate notifications for the same assignment and intended send time. [NEEDS CLARIFICATION: dedupe window]
- FR-012: Quiet hours configuration (enabled, start, end) MUST be honored using the user’s local time. [NEEDS CLARIFICATION: behavior for in-window reminders]
- FR-013: Users MUST be able to revoke and later re-enable notifications, and device registrations MUST reflect the current state.
- FR-014: The system MUST define data retention policies for scheduled and sent notifications and device registrations. [NEEDS CLARIFICATION]
- FR-015: Notification content MUST include a concise title and body that clearly identify the assignment and due time.

### Key Entities (conceptual)
- Anonymous User: Represents a local, anonymous identifier used to group a user’s device subscriptions and scheduled notifications.
- Device Subscription: Represents a single device’s push destination and related metadata; associated with an Anonymous User.
- Scheduled Notification: Represents a planned reminder to be delivered to a user about an assignment at a specific time, with delivery status.
- Notification Settings: User preferences controlling notificationsEnabled, default reminder offset, and quiet hours configuration.

## Review & Acceptance Checklist

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous (where specified)
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed
