# Contract: /subscribe

POST /subscribe

Request JSON:

```json
{
  "userId": "string", // when authenticated this must match JWT subject
  "endpoint": "string",
  "keys": { "p256dh": "string", "auth": "string" }
}
```

Success response: 200 OK with body `{ ok: true }` or 204 No Content.

Errors:
- 400 Bad Request: malformed body
- 401/403: auth required or mismatch
