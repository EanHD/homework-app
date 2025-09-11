# Pull Request: [Brief Description]

## 📋 Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Style/UI improvements
- [ ] ⚡ Performance improvements
- [ ] 🔧 Refactoring (no functional changes)
- [ ] 🧪 Test additions or improvements

## 📝 Description
<!-- Provide a detailed description of the changes -->

### What changed:
- 
- 
- 

### Why this change was made:
<!-- Explain the motivation behind this change -->

### Related Issues:
<!-- Link any related issues: Fixes #123, Closes #456 -->

## 🧪 Testing Checklist

### Automated Tests
- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Build succeeds (`npm run build`)
- [ ] CI/CD pipeline passes

### Manual Testing  
- [ ] Tested on desktop browsers (Chrome, Firefox, Safari)
- [ ] Tested on mobile devices (iOS Safari, Android Chrome)
- [ ] PWA installation works correctly
- [ ] Service Worker updates properly
- [ ] Push notifications function (if applicable)
- [ ] Offline functionality works (if applicable)
- [ ] No console errors in production build

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible

## 🚀 Deployment Checklist

### Pre-Deploy
- [ ] Environment variables configured correctly
- [ ] Database migrations completed (if applicable)
- [ ] Third-party service configurations updated (if applicable)
- [ ] VAPID keys configured for push notifications (if applicable)

### Post-Deploy Verification
- [ ] Production URL loads correctly
- [ ] Service worker registers successfully
- [ ] PWA manifest is valid
- [ ] Push notification backend responds correctly
- [ ] No 404s or broken links
- [ ] Performance metrics are acceptable

## 📱 PWA Specific Checklist
<!-- Complete this section for PWA-related changes -->

- [ ] Service worker scope is correct
- [ ] Offline functionality tested
- [ ] Install prompt appears appropriately
- [ ] App works when installed as PWA
- [ ] Push notifications work end-to-end
- [ ] App shell loads instantly on repeat visits

## 🔒 Security Review
<!-- Complete for security-sensitive changes -->

- [ ] No sensitive data exposed in logs or client-side code
- [ ] API endpoints have proper authentication
- [ ] CORS configuration is restrictive
- [ ] Environment variables are properly secured
- [ ] No hardcoded secrets in code

## 📱 Mobile UI Verification
<!-- For UI/UX changes -->

- [ ] Header sizing is appropriate (40-60px)
- [ ] FAB doesn't block content (80px bottom clearance)
- [ ] Safe area insets respected on iOS
- [ ] Touch targets are >= 44px
- [ ] Content doesn't clip at viewport bottom
- [ ] Proper viewport height handling (100dvh)

## 🔗 Links
- [ ] **Live Preview**: [Add preview URL if available]
- [ ] **Screenshots**: [Attach before/after screenshots for UI changes]
- [ ] **Test Results**: [Link to CI results, test reports]
- [ ] **Documentation**: [Link to updated docs]

## 👥 Reviewers
<!-- Tag specific reviewers if needed -->
@reviewer-username

## 📈 Performance Impact
<!-- Document any performance implications -->
- Bundle size change: [+X KB / -X KB / No change]
- Load time impact: [Better / Worse / No change]
- Memory usage: [Better / Worse / No change]

## 🔄 Breaking Changes
<!-- Document any breaking changes -->
- [ ] No breaking changes
- [ ] Breaking changes documented below:

### Migration Guide:
<!-- If there are breaking changes, provide migration instructions -->

## ✅ Final Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated for new functionality
- [ ] All CI checks pass