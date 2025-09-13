#!/usr/bin/env tsx
/**
 * Verify VAPID public key between app config and server.
 * Usage: npx tsx scripts/verify-vapid.ts <configUrl> <functionsBase>
 * Example: npx tsx scripts/verify-vapid.ts https://eanhd.github.io/homework-app/config.json https://<project>.functions.supabase.co
 */

import { webcrypto as nodeCrypto } from 'node:crypto';

async function main() {
  const [, , configUrl, functionsBase] = process.argv;
  if (!configUrl || !functionsBase) {
    console.error('Usage: verify-vapid.ts <configUrl> <functionsBase>');
    process.exit(1);
  }

  const cacheBuster = `${configUrl}${configUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  console.log('🔧 Fetching app config:', configUrl);
  const resCfg = await fetch(cacheBuster, { cache: 'no-store' });
  if (!resCfg.ok) {
    console.error('❌ Failed to fetch config.json:', resCfg.status);
    process.exit(1);
  }
  const cfg = await resCfg.json();
  const vapidPublic = String(cfg.vapidPublic || '');
  console.log('   App vapid len:', vapidPublic.length);

  console.log('⚡ Probing server deliverer:', functionsBase + '/send-notifications');
  const resFn = await fetch(functionsBase + '/send-notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (!resFn.ok) {
    console.error('❌ Deliverer probe failed:', resFn.status);
    const txt = await resFn.text();
    console.error(txt);
    process.exit(1);
  }
  const report = await resFn.json();
  console.log('   Server vapid len:', report.vapidPublicLen);
  if (report.vapidPublicHash) {
    console.log('   Server vapid hash:', report.vapidPublicHash);
  } else {
    console.log('   Server vapid hash: (not provided)');
  }

  // Compute simple hash for app key to compare prefix with server (diagnostic only)
  const enc = new TextEncoder();
  const subtle = (globalThis as any).crypto?.subtle || nodeCrypto.subtle;
  if (!subtle) {
    throw new Error('WebCrypto not available');
  }
  const digest = await subtle.digest('SHA-256', enc.encode(vapidPublic));
  const bytes = Array.from(new Uint8Array(digest));
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  const appHash = hex.slice(0, 12);
  console.log('   App vapid hash:', appHash);

  if (report.vapidPublicLen === vapidPublic.length && report.vapidPublicHash && report.vapidPublicHash === appHash) {
    console.log('✅ VAPID public appears to MATCH between app and server');
  } else {
    console.log('❌ VAPID mismatch likely: lengths or hashes differ');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
