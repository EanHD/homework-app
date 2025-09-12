# T010 — CORS Allowlist Confirmation + Preflight Examples

Confirmed allowed origins in `supabase/functions/_shared/cors.ts`:
- http://localhost:5000
- http://127.0.0.1:5000
- http://localhost:5173
- http://127.0.0.1:5173
- http://localhost:4173
- http://127.0.0.1:4173
- https://eanhd.github.io
- https://{replit-preview}.replit.dev (current domain hard-coded)

Behavior
- Preflight handled in `preflight()` returning 204; `corsify()` adds headers and echoes `Access-Control-Allow-Origin` when the Origin is in the allowlist.
- Allowed methods: GET,POST,OPTIONS,DELETE,PATCH
- Allowed headers: Content-Type, Authorization, Prefer, Accept
- Max-Age: 86400

Replace {HOST} with functionsBase (from public/config.json):
- https://tihojhmqghihckekvprj.functions.supabase.co

Examples

1) GitHub Pages origin → /subscribe
```
curl -i -X OPTIONS "{HOST}/subscribe" \
  -H "Origin: https://eanhd.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```
Expected (subset):
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://eanhd.github.io
Access-Control-Allow-Methods: GET,POST,OPTIONS,DELETE,PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, Prefer, Accept
Access-Control-Max-Age: 86400
Vary: Origin
```

2) Local dev (Replit) → /schedule
```
curl -i -X OPTIONS "{HOST}/schedule" \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, prefer"
```
Expected (subset):
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5000
Access-Control-Allow-Methods: GET,POST,OPTIONS,DELETE,PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, Prefer, Accept
```

3) Replit preview → /send-notifications
```
curl -i -X OPTIONS "{HOST}/send-notifications" \
  -H "Origin: https://{your-preview}.replit.dev" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

Notes
- If origin changes (new Replit preview URL), add it to `cors.ts` allowlist.
- If you see no `Access-Control-Allow-Origin`, the `Origin` did not match the allowlist exactly.
