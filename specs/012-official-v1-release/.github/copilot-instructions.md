# GitHub Copilot Instructions: Official v1 Release

## Project Context
This is the official v1 release of a homework management web application built with React + TypeScript + Vite + Mantine UI, deployed on GitHub Pages with Supabase backend.

## Code Style & Patterns

### TypeScript Conventions
- Use strict TypeScript with proper type definitions
- Prefer interfaces over types for object shapes
- Use const assertions for immutable data
- Leverage discriminated unions for state management

### React Patterns
- Functional components with hooks exclusively
- Custom hooks for reusable logic
- Proper dependency arrays in useEffect
- React.memo for expensive components
- Error boundaries for graceful error handling

### State Management (Zustand)
- Centralized app store in `src/store/app.ts`
- Immutable updates with proper state slicing
- Actions colocated with state
- Subscription patterns for UI updates

### Mantine UI Integration
- Use Mantine components consistently
- Leverage theme system for colors/spacing
- Responsive design with Mantine breakpoints
- Accessibility features built-in

## Performance Requirements

### Bundle Optimization
- Dynamic imports for route-based code splitting
- Tree shaking for unused code removal
- Lazy loading for non-critical components
- Vendor chunk separation for better caching

### Runtime Performance
- React.memo for preventing unnecessary re-renders
- useMemo/useCallback for expensive computations
- Debounced inputs for search/filtering
- Virtual scrolling for large lists (if needed)

### Loading & UX
- Skeleton loaders for better perceived performance
- Progressive loading with graceful degradation
- 200ms interaction feedback target
- Smooth transitions and animations

## Authentication Architecture

### OAuth Integration
- Supabase Auth with Google and Apple providers
- Backward compatibility with magic link auth
- Secure token handling and refresh logic
- Proper error handling for OAuth flows

### State Management
- Authentication state in Zustand store
- Session persistence with Supabase
- User preferences in user metadata
- Logout cleanup for security

## Component Architecture

### UI Components
- Premium theme with professional color palette
- Consistent spacing using Mantine system
- Hover/focus states for all interactive elements
- Loading states for async operations
- Error states with helpful messages

### Onboarding Tour
- Centered modal with multi-step flow
- Progress indication and navigation
- Mobile-responsive layout
- Completion tracking in localStorage
- Keyboard navigation support

## File Organization

### Source Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── services/           # API and external service integration
├── store/              # Zustand state management
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
└── theme/              # Mantine theme configuration
```

### Naming Conventions
- PascalCase for components and types
- camelCase for functions and variables
- kebab-case for file names
- UPPER_CASE for constants

## Testing Strategy

### Unit Testing
- Vitest for fast unit tests
- React Testing Library for component testing
- Mock external dependencies (Supabase, etc.)
- Test user interactions and state changes

### Integration Testing
- Test authentication flows
- Test data persistence
- Test error scenarios
- Test performance thresholds

## Development Workflow

### Code Quality
- ESLint for code quality enforcement
- Prettier for consistent formatting
- TypeScript strict mode enabled
- Pre-commit hooks for quality gates

### Performance Monitoring
- Bundle size tracking
- Web Vitals measurement
- Error tracking and reporting
- Performance budgets enforcement

## Deployment Considerations

### GitHub Pages
- Base path configuration (`/homework-app/`)
- SPA routing with 404.html fallback
- HTTPS requirement for OAuth and PWA
- Asset optimization and compression

### Environment Configuration
- Development vs production environment variables
- Supabase project configuration
- OAuth provider settings
- Feature flags for gradual rollout

## Security Guidelines

### Authentication Security
- Secure token storage
- Proper session management
- OAuth state validation
- CSRF protection via Supabase

### Data Security
- Input validation and sanitization
- XSS prevention through proper escaping
- Secure HTTP headers
- Privacy compliance considerations

## Common Patterns

### Error Handling
```typescript
// Use error boundaries for component errors
// Handle async errors in try/catch blocks
// Provide user-friendly error messages
// Log errors for debugging (development only)
```

### State Updates
```typescript
// Immutable updates in Zustand
const updateUser = (user: User) => 
  set(state => ({ ...state, auth: { ...state.auth, user } }));
```

### Component Structure
```typescript
// Consistent component structure with TypeScript
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Hooks
  // Event handlers
  // Render logic
};
```

## Priority Guidelines

1. **Maintain existing functionality** - Don't break current features
2. **Performance first** - Meet or exceed performance targets
3. **User experience** - Smooth, intuitive interactions
4. **Code quality** - Clean, maintainable, well-tested code
5. **Security** - Proper authentication and data protection

## When to Ask for Clarification

- OAuth provider configuration details
- Specific performance requirements
- UI/UX design decisions
- Database schema changes
- Third-party service integrations

Remember: This is a production release focused on polish, performance, and professional presentation while maintaining all existing functionality.