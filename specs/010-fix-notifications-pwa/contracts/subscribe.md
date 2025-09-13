# Contract: /subscribe

POST /subscribe

Request JSON:

```json
{
  "userId": "string",
  "endpoint": "string",
  "keys": { "p256dh": "string", "auth": "string" }
}
```

Success response: 200 OK with body `{ ok: true }` or 204 No Content.

Error cases:
- 400 Bad Request: malformed body
- 401/403: auth required (if verify_jwt enabled)
