export function corsify(req: Request, res: Response): Response {
  const rawOrigin = req.headers.get('origin') || '';
  const origin = rawOrigin.trim().replace(/\/$/, '');
  const allowed = new Set([
    'http://localhost:5000',     // Replit dev server
    'http://127.0.0.1:5000',    // Replit dev server alternative  
    'http://localhost:5173',     // Vite default dev server
    'http://127.0.0.1:5173',    // Vite default dev server alternative
    'http://localhost:4173',     // Vite preview server
    'http://127.0.0.1:4173',    // Vite preview server alternative
    'https://eanhd.github.io',  // GitHub Pages production
    // Replit preview domains - add specific domain if needed
    'https://1755e6d3-6953-4f17-a66c-a7d844f91178-00-3n90unkyc9g08.kirk.replit.dev',
  ]);
  const headers = new Headers(res.headers);
  if (allowed.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PATCH');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Prefer, Accept');
  headers.set('Access-Control-Expose-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(res.body, { status: res.status, headers });
}

export function preflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;
  const res = new Response(null, { status: 204, headers: new Headers() });
  return res;
}
