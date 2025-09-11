// Helper to get the app base path.
// Priority:
// 1) <base href> from document
// 2) import.meta.env.BASE_URL (Vite)
// 3) First path segment as repo base (GitHub Pages project sites)
// 4) '/'
export function appBase(): string {
  try {
    if (typeof document !== 'undefined') {
      const href = document.querySelector('base')?.getAttribute('href') || '';
      if (href && href.startsWith('/')) return href.endsWith('/') ? href : href + '/';
    }
  } catch {}
  try {
    const viteBase = ((import.meta as any)?.env?.BASE_URL as string) || '';
    if (viteBase) return viteBase.endsWith('/') ? viteBase : viteBase + '/';
  } catch {}
  try {
    if (typeof location !== 'undefined') {
      const segs = location.pathname.split('/').filter(Boolean);
      const guess = '/' + (segs[0] ? segs[0] + '/' : '');
      return guess || '/';
    }
  } catch {}
  return '/';
}

// Join a path/hash to the app base
export function withBase(path: string): string {
  const base = appBase();
  if (!path) return base;
  if (path.startsWith('#')) return base + path; // e.g., '#/main'
  if (path.startsWith('/')) return base + path.slice(1); // e.g., '/sw.js'
  return base + path;
}
