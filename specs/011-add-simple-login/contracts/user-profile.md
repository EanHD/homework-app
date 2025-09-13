# Contract: User Profile

GET /user/profile (backend) — returns basic profile for the authenticated user

Response 200:
```json
{ "id": "uuid", "email": "string", "display_name": "string" }
```

Errors:
- 401 if not authenticated
