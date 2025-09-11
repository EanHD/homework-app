// Helper to get the app base path as configured by Vite
export function appBase(): string {
  try {
    const envBase = ((import.meta as any)?.env?.BASE_URL as string) || '/';
    return envBase.endsWith('/') ? envBase : envBase + '/';
  } catch {
    return '/';
  }
}

// Join a path/hash to the app base
export function withBase(path: string): string {
  const base = appBase();
  if (!path) return base;
  if (path.startsWith('#')) return base + path; // e.g., '#/main'
  if (path.startsWith('/')) return base + path.slice(1); // e.g., '/sw.js'
  return base + path;
}

