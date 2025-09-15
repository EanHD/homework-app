# Quickstart Guide: Official v1 Release

## Prerequisites

- Node.js 18+ installed
- Git configured with GitHub access
- GitHub Pages enabled for repository
- Supabase project with Auth configured
- Google Cloud Console project (for OAuth)
- Apple Developer account (for Sign-In)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/username/homework-app.git
cd homework-app
git checkout 012-official-v1-release
npm install
```

### 2. Environment Configuration

Create `.env.local` with production settings:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_ENVIRONMENT=production
VITE_VERSION=1.0.0
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
VITE_APPLE_SERVICE_ID=your_apple_service_id
```

### 3. OAuth Provider Setup

#### Google OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - `https://username.github.io/homework-app/auth/callback`

#### Apple Sign-In Configuration  
1. Go to [Apple Developer Console](https://developer.apple.com)
2. Create App ID and Service ID
3. Configure domain verification for GitHub Pages
4. Generate private key for service
5. Add redirect URLs in Supabase Apple Auth settings

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Access at `http://localhost:5173/homework-app/`

### 2. Run Tests

```bash
# Unit tests
npm run test

# UI tests
npm run test:ui

# E2E tests (requires Playwright)
npm run test:e2e
```

### 3. Performance Monitoring

```bash
# Bundle analysis
npm run analyze

# Performance audit
npm run lighthouse

# Build size check
npm run build:size
```

## Build & Deployment

### 1. Production Build

```bash
npm run build
```

This generates optimized files in `dist/` with:
- Minified JavaScript and CSS
- Optimized images and assets
- Service worker for caching
- Performance budgets enforced

### 2. Local Production Testing

```bash
npm run preview
```

Test production build locally at `http://localhost:4173/homework-app/`

### 3. Deploy to GitHub Pages

```bash
# Automatic deployment via GitHub Actions
git push origin 012-official-v1-release

# Manual deployment
npm run deploy
```

## Validation Checklist

### ✅ Authentication Testing
- [ ] Magic link authentication works
- [ ] Google OAuth sign-in functional
- [ ] Apple Sign-In functional (HTTPS required)
- [ ] User session persistence
- [ ] Sign-out functionality
- [ ] Error handling for failed auth

### ✅ UI/UX Validation
- [ ] Premium theme applied consistently
- [ ] Onboarding tour displays centered
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Loading states for all async operations
- [ ] Smooth animations and transitions
- [ ] Accessibility compliance (keyboard nav, screen readers)

### ✅ Performance Verification
- [ ] Initial load < 3 seconds (Lighthouse audit)
- [ ] Route transitions < 1 second
- [ ] Interaction feedback < 200ms
- [ ] Bundle size within budget (< 500KB gzipped)
- [ ] Web Vitals scores in green
- [ ] Service worker caching functional

### ✅ Production Readiness
- [ ] No console errors in production build
- [ ] Development artifacts removed
- [ ] Error tracking enabled
- [ ] Professional email templates
- [ ] HTTPS redirects working
- [ ] 404 handling for SPA routes

### ✅ Feature Functionality
- [ ] All existing features preserved
- [ ] Assignment management working
- [ ] Class organization functional
- [ ] Notification system operational
- [ ] PWA installation available
- [ ] Offline functionality maintained

## Troubleshooting

### OAuth Issues
```bash
# Check OAuth configuration
curl -X GET "https://your-supabase-url/auth/v1/settings" \
  -H "apikey: your-anon-key"

# Verify redirect URLs
echo "Check Supabase Auth settings for correct redirect URLs"
echo "GitHub Pages: https://username.github.io/homework-app/"
echo "Local dev: http://localhost:5173/homework-app/"
```

### Performance Issues
```bash
# Check bundle size
npm run build
ls -lah dist/assets/

# Analyze dependencies
npm run analyze

# Test with slow network
npm run preview
# Open Chrome DevTools > Network > Slow 3G
```

### Email Template Issues
```bash
# Test email templates in Supabase
# Go to Authentication > Settings > Email Templates
# Send test emails and verify formatting
```

## Monitoring & Maintenance

### Performance Monitoring
- Monitor Web Vitals in production
- Track error rates and user satisfaction
- Review bundle size on updates
- Monitor API response times

### User Experience Monitoring
- Track onboarding completion rates
- Monitor authentication success rates
- Review user feedback and support requests
- A/B test UI improvements

### Security Monitoring
- Review Supabase Auth logs
- Monitor for suspicious login attempts
- Keep OAuth configurations updated
- Regular security audits

## Support & Resources

- **Documentation**: [GitHub Wiki](https://github.com/username/homework-app/wiki)
- **Issues**: [GitHub Issues](https://github.com/username/homework-app/issues)
- **Supabase Dashboard**: [your-project.supabase.co](https://your-project.supabase.co)
- **Performance**: [Web Vitals](https://web.dev/vitals/)
- **OAuth Docs**: [Google](https://developers.google.com/identity/protocols/oauth2) | [Apple](https://developer.apple.com/sign-in-with-apple/)

## Next Steps After v1

1. **User Feedback Collection**: Implement feedback system
2. **Advanced Analytics**: Add user behavior tracking
3. **Performance Optimization**: Continuous performance improvements
4. **Feature Expansion**: Based on user requests
5. **Mobile App**: React Native version consideration