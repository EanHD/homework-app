# Research: Notifications Reliability & UI Polish

**Feature**: 008-notifications-ui-polish  
**Created**: 2025-09-11  
**Status**: Complete

## Technical Research Findings

### 1. Web Push Notification Standards

**Decision**: Continue using VAPID (RFC 8292) with Supabase Edge Functions  
**Rationale**: Current stack is standards-compliant and properly configured  
**Alternatives considered**: Native push providers (OneSignal, Firebase) - rejected for complexity/vendor lock-in

### 2. Service Worker Registration & Caching

**Decision**: Implement cache-busting with version query params and improve error handling  
**Rationale**: Current SW registration is functional but lacks reliability features for production  
**Alternatives considered**: Workbox toolkit - rejected for adding unnecessary complexity to simple use case

### 3. CORS Configuration for Development

**Decision**: Update allowed origins to include Replit's localhost:5000 alongside existing origins  
**Rationale**: Dev environment uses port 5000, but functions only allow port 5173  
**Alternatives considered**: Port forwarding - rejected as it doesn't solve the root CORS issue

### 4. Mobile Safe Area Handling

**Decision**: Use CSS `env(safe-area-inset-*)` variables with fallbacks  
**Rationale**: Modern iOS/Android PWAs need safe area support; CSS-only solution maintains simplicity  
**Alternatives considered**: JavaScript-based detection - rejected for performance and complexity concerns

### 5. Layout & Viewport Issues

**Decision**: Replace brittle `100vh` usage with `100dvh` and container-relative heights  
**Rationale**: Mobile browsers have dynamic viewport behavior that breaks fixed viewport heights  
**Alternatives considered**: JavaScript viewport listeners - rejected for performance impact

### 6. Testing Strategy for Push Notifications

**Decision**: Mock-based E2E testing with optional real push for manual validation  
**Rationale**: Real push delivery is unreliable in CI; mocking covers code paths while allowing manual testing  
**Alternatives considered**: Full integration testing - rejected due to CI complexity and rate limiting concerns

## Implementation Research

### Current Architecture Analysis
- **Service Worker**: Uses app-shell caching pattern with push event handling
- **Registration Flow**: Dynamic base detection works correctly across environments  
- **Permission Handling**: Basic implementation lacks edge case coverage
- **Backend Functions**: Properly structured with CORS, but missing dev origins

### Identified Patterns
- **Configuration Loading**: Hierarchical config (localStorage → env → public/config.json) is robust
- **Error Handling**: Current push flow lacks comprehensive error states
- **UI Architecture**: Mantine-based responsive design with good accessibility foundations

### Performance Considerations
- **Service Worker Scope**: Current scope handling is correct but could benefit from explicit cache versioning
- **CSS Performance**: Current styles are optimized; safe-area additions will not impact performance
- **Network Requests**: VAPID subscription flow is optimal; no changes needed

## Technical Constraints Confirmed

### Browser Compatibility
- **iOS Safari**: Web Push supported in PWA context on iOS 16.4+
- **Android Chrome**: Full Web Push support  
- **Desktop Browsers**: Universal support for target features

### Security Requirements
- **HTTPS Only**: Web Push requires secure context - confirmed in current setup
- **VAPID Keys**: Current key management is secure and properly separated
- **CORS Policy**: Current implementation follows security best practices

### Platform Limitations
- **iOS Quiet Hours**: Push delivery may be deferred - documented behavior, no workaround needed
- **Background Limits**: Service Worker execution time limits acceptable for current use case
- **Storage Quotas**: LocalForage usage well within browser limits

## Dependencies & Integration Points

### External Services
- **Supabase**: Edge Functions, Database, Authentication (service role)
- **Web Push Protocol**: Standard VAPID implementation
- **GitHub Pages**: Static hosting with proper PWA manifest

### Internal Dependencies  
- **Mantine UI**: Component library for consistent styling
- **Vite**: Build tool and dev server configuration
- **LocalForage**: Persistent storage abstraction

### Development Tools
- **Vitest**: Existing test runner, suitable for expanded test coverage
- **TypeScript**: Current typing is comprehensive, minimal additions needed
- **ESLint/Prettier**: Code quality tools already configured

## Risk Mitigation Strategies

### Service Worker Issues
- **Cache Busting**: Version query parameters prevent stale SW serving
- **Registration Timing**: Defer registration until app is interactive
- **Error Recovery**: Graceful degradation when SW registration fails

### Mobile UI Risks
- **Safe Area Support**: Progressive enhancement with fallbacks
- **Keyboard Overlap**: Use `visualViewport` API where available
- **Performance Impact**: CSS-only solutions maintain rendering performance

### Notification Delivery
- **Permission Denied**: Clear UI feedback and recovery options
- **Network Failures**: Retry logic with exponential backoff
- **Rate Limiting**: Client-side throttling to prevent API abuse

## Research Validation

### Proof of Concepts
- [x] CORS preflight testing confirms function accessibility
- [x] Safe-area CSS variables tested on iOS Safari PWA
- [x] Service Worker cache-busting validated in dev environment  
- [x] Mobile viewport behavior analyzed across target devices

### Technical Decisions Validated
- [x] Current VAPID implementation is production-ready
- [x] Mantine component system supports required UI improvements
- [x] Vite configuration can be minimally updated for reliability
- [x] Testing strategy balances coverage with CI stability

## Next Phase Requirements

### Phase 1 Inputs Ready
- Complete technical understanding of current system
- Identified specific improvement areas with concrete solutions
- Risk mitigation strategies defined
- Performance and compatibility constraints documented

### Outstanding Questions Resolved
- No NEEDS CLARIFICATION items remain
- All technical approaches have been validated
- Implementation complexity is within reasonable bounds
- Testing strategy covers critical user flows

This research provides the foundation for Phase 1 design and contract generation.