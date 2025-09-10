export type RuntimeConfig = {
  functionsBase?: string;
  vapidPublic?: string;
};

let cached: RuntimeConfig | null = null;

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;

  // 1) LocalStorage override (handy for production without rebuild)
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

  // 2) Fetch public config.json if available
  try {
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      const base = (import.meta as any)?.env?.BASE_URL || '/';
      const res = await fetch(`${base}config.json`, { cache: 'no-store' });
      if (res.ok) {
        const json = (await res.json()) as RuntimeConfig;
        cached = json;
        return cached;
      }
    }
  } catch {}

  // 3) Fallback to build-time env
  const env = (import.meta as any)?.env || {};
  cached = {
    functionsBase: env.VITE_FUNCTIONS_BASE,
    vapidPublic: env.VITE_VAPID_PUBLIC,
  };
  return cached;
}

