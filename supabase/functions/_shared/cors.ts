export function corsify(req: Request, res: Response): Response {
  const rawOrigin = req.headers.get('origin') || '';
  const origin = rawOrigin.trim().replace(/\/$/, '');
  const allowed = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://eanhd.github.io',
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
