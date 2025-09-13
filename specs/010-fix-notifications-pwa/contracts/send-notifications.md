# Contract: /send-notifications

POST /send-notifications

Behavior: Trigger delivery of scheduled notifications. Can accept an optional diagnostic direct payload:

Request JSON (diagnostic/direct):

```json
{
  "subscriptions": [ { "endpoint": "string", "keys": { "p256dh": "string", "auth": "string" } } ],
  "message": { "title": "string", "body": "string" }
}
```

Success response: 200 OK with report JSON:

```json
{
  "processed": 10,
  "successes": 9,
  "pruned": 1,
  "errors": 0,
  "statusCounts": { "201": 9, "410": 1 }
}
```

Error cases:
- 500 when env (VAPID keys or SERVICE_ROLE_KEY) is missing
