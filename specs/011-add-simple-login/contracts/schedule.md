# Contract: /schedule

POST /schedule

Request JSON (create or update schedule):

```json
{
  "userId": "string", // must match authenticated user
  "assignmentId": "string",
  "title": "string",
  "body": "string",
  "sendAt": "ISO timestamp string",
  "url": "optional string",
  "cancel": "optional boolean"
}
```

Success response: 200 OK with a JSON report `{ ok: true, id: "schedule-id" }`.

Error cases:
- 400 Bad Request: invalid fields
- 401/403: auth required or mismatch
- 500 Server error: DB or env missing
