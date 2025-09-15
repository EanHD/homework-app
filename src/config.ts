export type RuntimeConfig = {
  functionsBase?: string;
  vapidPublic?: string;
};

let cached: RuntimeConfig | null = null;

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;

  // Helper: detect localhost/dev usage
  const isLocalhost =
    typeof location !== 'undefined' && /^(localhost(:\d+)?|127\.0\.0\.1)$/.test(location.hostname);

  // 1) LocalStorage override (highest priority)
  try {
    if (typeof localStorage !== 'undefined') {
      const functionsBase = localStorage.getItem('hb_functions_base') || undefined;
      const vapidPublic = localStorage.getItem('hb_vapid_public') || undefined;
      if (functionsBase || vapidPublic) {
        cached = { functionsBase, vapidPublic };
        return cached;
      }
    }
  } catch {}

  // 2) Dev-first: prefer Vite env on localhost or in tests (no network while coding)
  try {
    const env = (import.meta as any)?.env || {};
    const isTest = !!env?.TEST || env?.MODE === 'test';
    if (isLocalhost || isTest) {
      const fromEnv: RuntimeConfig = {
        functionsBase: env.VITE_FUNCTIONS_BASE,
        vapidPublic: env.VITE_VAPID_PUBLIC,
      };
      if (fromEnv.functionsBase || fromEnv.vapidPublic) {
        cached = fromEnv;
        return cached;
      }
    }
  } catch {}

  // 3) Try public config.json (works on GH Pages)
  try {
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      // Candidate bases in priority order:
      // - <base href> from document (if present)
      // - Vite BASE_URL
      // - Known GH Pages base '/homework-app/'
      // - Root '/'
      const docBase = (() => {
        try {
          const href = document.querySelector('base')?.getAttribute('href') || '';
          return href && href.startsWith('/') ? href : '';
        } catch { return ''; }
      })();
      const viteBase = ((import.meta as any)?.env?.BASE_URL as string) || '/';

      const candidates = Array.from(
        new Set(
          [docBase, viteBase, '/homework-app/', '/']
            .filter(Boolean)
            .map((b) => (b.endsWith('/') ? b : b + '/'))
        )
      );

      for (const base of candidates) {
        try {
          const res = await fetch(`${base}config.json`, { cache: 'no-store' });
          if (res.ok) {
            const json = (await res.json()) as RuntimeConfig;
            cached = json;
            return cached;
          }
        } catch {
          // try next candidate
        }
      }
    }
  } catch {}

  // 4) Final fallback to build-time env (both dev/prod)
  const env = (import.meta as any)?.env || {};
  cached = {
    functionsBase: env.VITE_FUNCTIONS_BASE,
    vapidPublic: env.VITE_VAPID_PUBLIC,
  };
  if (!cached.functionsBase || !cached.vapidPublic) {
    try {
      console.warn('[config] missing values', {
        hasFunctionsBase: !!cached.functionsBase,
        vapidPublicLen: (cached.vapidPublic || '').length,
      });
    } catch {}
  }
  return cached;
}
