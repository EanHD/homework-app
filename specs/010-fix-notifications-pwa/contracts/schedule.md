# Contract: /schedule

POST /schedule

Request JSON (create or update schedule):

```json
{
  "userId": "string",
  "assignmentId": "string",
  "title": "string",
  "body": "string",
  "sendAt": "ISO timestamp string",
  "url": "optional string"
}
```

To cancel a schedule, send `{ userId, assignmentId, cancel: true }`.

Success response: 200 OK with a JSON report `{ ok: true, id: "schedule-id" }`.

Error cases:
- 400 Bad Request: invalid fields
- 500 Server error: DB or env missing
