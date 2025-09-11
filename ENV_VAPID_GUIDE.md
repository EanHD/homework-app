# Environment & VAPID Key Management Guide

## Overview

This guide covers environment-specific configuration for VAPID keys, HTTPS requirements, and proper deployment setup for the Homework Buddy push notification system.

## VAPID Keys Explained

**VAPID (Voluntary Application Server Identification)** keys are required for Web Push notifications:
- **Public Key**: Used by the frontend to subscribe users to push notifications  
- **Private Key**: Used by the backend to sign and send push notifications
- **Subject**: Contact information (usually email) identifying the application server

## Configuration Architecture

### Frontend Configuration Priority (Hierarchical)

The frontend uses a **3-tier configuration system** with the following priority order:

#### 1. localStorage Override (Highest Priority)
```javascript
// Development/testing overrides
localStorage.setItem('hb_vapid_public', 'BBNeezOWTW41reqn5...');
localStorage.setItem('hb_functions_base', 'https://your-project.functions.supabase.co');
```

**Use Cases:**
- Testing different VAPID keys during development
- Switching between development and production backends
- Debugging configuration issues

#### 2. Vite Environment Variables (Dev/Test)
```bash
# .env.local (development)
VITE_VAPID_PUBLIC=BBNeezOWTW41reqn5HgAS5fLpX6qZqilfwumb6Q4zm6d9elUxRwa-wrnwsY-bwdDIyyMhYRrNdPC7-M1_EtxSqo
VITE_FUNCTIONS_BASE=https://tihojhmqghihckekvprj.functions.supabase.co
```

**Behavior:**
- Only loads on `localhost` or when `env.TEST` is true
- Preferred during local development for fast iteration
- Avoids network calls during coding

#### 3. Runtime Config JSON (Production)
```json
// public/config.json
{
  "functionsBase": "https://tihojhmqghihckekvprj.functions.supabase.co",
  "vapidPublic": "BBNeezOWTW41reqn5HgAS5fLpX6qZqilfwumb6Q4zm6d9elUxRwa-wrnwsY-bwdDIyyMhYRrNdPC7-M1_EtxSqo"
}
```

**Behavior:**
- Loads via HTTP fetch with multiple base path candidates
- Works on GitHub Pages and other static hosting
- Supports different deployment contexts automatically

### Backend Configuration (Supabase Environment Variables)

```bash
# Supabase Edge Functions Environment Variables
VAPID_PUBLIC=BBNeezOWTW41reqn5HgAS5fLpX6qZqilfwumb6Q4zm6d9elUxRwa-wrnwsY-bwdDIyyMhYRrNdPC7-M1_EtxSqo
VAPID_PRIVATE=<your-private-key>
VAPID_SUBJECT=mailto:your-email@example.com

# Also required
PROJECT_URL=https://tihojhmqghihckekvprj.supabase.co
SERVICE_ROLE_KEY=<your-service-role-key>
```

## Environment-Specific Setup

### Development Environment

**1. Set up Vite environment variables:**
```bash
# .env.local
VITE_VAPID_PUBLIC=your-vapid-public-key
VITE_FUNCTIONS_BASE=https://your-project.functions.supabase.co
```

**2. Configure Supabase secrets:**
```bash
supabase secrets set VAPID_PUBLIC=your-vapid-public-key
supabase secrets set VAPID_PRIVATE=your-vapid-private-key  
supabase secrets set VAPID_SUBJECT=mailto:dev@yourapp.com
```

**3. Start development server:**
```bash
npm run dev  # Runs on http://localhost:5000
```

**HTTPS Requirement:**
- ⚠️ Push notifications **require HTTPS** in production
- Development on `localhost` is allowed over HTTP
- Use `https://your-repl.repl.co` for testing HTTPS locally

### Production Environment (GitHub Pages)

**1. Update public/config.json:**
```json
{
  "functionsBase": "https://your-production-project.functions.supabase.co",
  "vapidPublic": "your-production-vapid-public-key"
}
```

**2. Configure production Supabase project:**
```bash
# Production Supabase project secrets
supabase secrets set VAPID_PUBLIC=your-production-vapid-public-key
supabase secrets set VAPID_PRIVATE=your-production-vapid-private-key
supabase secrets set VAPID_SUBJECT=mailto:support@yourapp.com
```

**3. Update CORS origins:**
```typescript
// supabase/functions/_shared/cors.ts
const allowed = new Set([
  'https://yourusername.github.io',  // Production GitHub Pages
  'http://localhost:5000',           // Development
  // ... other origins
]);
```

**4. Deploy and verify:**
```bash
npm run build
# Deploy to GitHub Pages via Actions or manual
```

## HTTPS Origin Verification

### Automatic HTTPS Detection

The frontend **automatically enforces HTTPS** for push notifications:

```typescript
// src/utils/push.ts
if (!window.isSecureContext) {
  console.warn('[enablePush] HTTPS context required for Web Push notifications');
  return { reused: false };
}
```

### Production HTTPS Requirements

**✅ Valid HTTPS Origins:**
- `https://yourusername.github.io` (GitHub Pages)
- `https://your-custom-domain.com` (Custom domain)
- `https://your-repl.repl.co` (Replit preview)

**❌ Invalid Origins:**
- `http://yourusername.github.io` (Non-HTTPS)
- `http://your-domain.com` (Non-HTTPS)
- Any non-localhost HTTP origins

### GitHub Pages HTTPS Setup

GitHub Pages **automatically provides HTTPS**:

1. **Repository Settings** → **Pages** → **Enforce HTTPS** ✅
2. **Custom Domain** (if used):
   ```
   # CNAME file
   your-domain.com
   ```
3. **DNS Configuration** for custom domains:
   ```
   CNAME    www.your-domain.com    yourusername.github.io
   ```

## VAPID Key Generation

### Using web-push CLI

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID key pair
web-push generate-vapid-keys

# Output:
# Public Key: BBNeezOWTW41reqn5HgAS5fLpX6qZqilfwumb6Q4zm6d9elUxRwa-wrnwsY-bwdDIyyMhYRrNdPC7-M1_EtxSqo
# Private Key: <your-private-key>
```

### Using Node.js Script

```javascript
// generate-vapid.js
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('Public Key:', keys.publicKey);
console.log('Private Key:', keys.privateKey);
```

## Security Best Practices

### Key Management

**✅ DO:**
- Store private keys in Supabase secrets (never in code)
- Use different VAPID keys for development/production
- Set appropriate VAPID subject (your contact email)
- Rotate keys periodically (requires re-subscription)

**❌ DON'T:**
- Commit private keys to version control
- Share private keys between environments
- Use the same keys for multiple applications
- Store keys in localStorage without encryption

### Production Checklist

- [ ] **HTTPS enforced** on production domain
- [ ] **Production VAPID keys** configured in Supabase
- [ ] **public/config.json** updated with production values  
- [ ] **CORS origins** include production HTTPS domain
- [ ] **Service worker scope** configured correctly for deployment path
- [ ] **Push notification permissions** working in production browser

## Troubleshooting

### Common Issues

**1. "Missing VAPID public key configuration"**
```
Solution: Check configuration hierarchy:
1. Clear localStorage: localStorage.removeItem('hb_vapid_public')
2. Verify VITE_VAPID_PUBLIC in .env.local
3. Check public/config.json has correct vapidPublic
```

**2. "HTTPS context required for Web Push"**
```
Solution: 
- Production: Ensure GitHub Pages HTTPS is enabled
- Development: Use https://your-repl.repl.co or localhost
- Never use http:// for non-localhost domains
```

**3. CORS errors during subscription**
```
Solution:
1. Verify origin in supabase/functions/_shared/cors.ts
2. Redeploy Supabase functions after CORS changes
3. Test with curl (see CORS_PREFLIGHT_VALIDATION.md)
```

**4. "Subscribe failed" errors**
```
Solution:
1. Check Supabase function logs
2. Verify VAPID_PUBLIC matches between frontend/backend
3. Ensure SERVICE_ROLE_KEY and PROJECT_URL are set
4. Test with scripts/test-push.ts
```

### Environment Debugging

**Check current configuration:**
```bash
# Test configuration loading
npm run test:push:config

# Expected output shows:
# ✅ VAPID: Available  
# Functions Base: https://...
```

**Validate VAPID key format:**
```javascript
// Browser console
const config = await getRuntimeConfig();
console.log('VAPID length:', config.vapidPublic?.length); // Should be ~88 chars
console.log('Valid base64url:', /^[A-Za-z0-9_-]+$/.test(config.vapidPublic || '')); // Should be true
```

## Integration Examples

### React Component Usage

```tsx
import { enablePush } from '@/utils/push';

function NotificationToggle({ userId }: { userId: string }) {
  const handleEnable = async () => {
    try {
      const result = await enablePush(userId);
      if (result.reused) {
        console.log('Using existing subscription');
      } else {
        console.log('Created new subscription');
      }
    } catch (error) {
      // Handle HTTPS, permission, or VAPID key errors
      console.error('Push enable failed:', error.message);
    }
  };
  
  return <button onClick={handleEnable}>Enable Notifications</button>;
}
```

### Service Worker Integration

The system automatically:
- Registers service worker at `/sw.js` with correct scope
- Subscribes using VAPID public key from configuration
- Handles permission requests gracefully
- Posts subscription to backend via authenticated API

## Related Documentation

- `CORS_PREFLIGHT_VALIDATION.md` - CORS testing and validation
- `scripts/README.md` - Push notification testing scripts  
- `NOTIFICATIONS_REPORT.md` - Architecture overview (when completed)
- `SMOKE_TEST.md` - Production validation commands (when completed)