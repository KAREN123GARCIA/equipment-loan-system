# notification-service

Event-driven notifications microservice for the **Equipment Loan Management System**.

- **DB:** MongoDB (templates + delivery logs)
- **Channels:** Email (required) + In-App history (stored in MongoDB)
- **Idempotency:** unique `eventId` per delivery
- **Retry/backoff:** exponential with jitter
- **Security:** JWT + RBAC for REST endpoints
- **Observability:** JSON logs + correlationId + Prometheus metrics + health

## Run locally (Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

- Swagger: `http://localhost:3006/api/v1/docs`
- Health: `http://localhost:3006/api/v1/health`
- Metrics: `http://localhost:3006/api/v1/metrics`
- Mailhog UI: `http://localhost:8026`

## Local dev event ingest
Enabled only when `ENABLE_DEV_EVENTS=true`.

`POST /api/v1/dev/events` with header `x-dev-token: <DEV_EVENTS_TOKEN>`

Example payload:
```json
{
  "eventId": "evt-123",
  "type": "LoanDueSoon",
  "version": 1,
  "correlationId": "corr-abc",
  "occurredAt": "2026-01-11T12:00:00.000Z",
  "data": {
    "userId": "u1",
    "userEmail": "u1@example.com",
    "userName": "User One",
    "equipmentName": "Dell Laptop",
    "dueDate": "2026-01-12T12:00:00.000Z"
  }
}
```

## REST API
- `GET /health`
- `GET /metrics`
- Templates (ADMIN/TECHNICIAN):
  - `POST /templates`
  - `GET /templates`
  - `GET /templates/:id`
  - `PATCH /templates/:id`
  - `DELETE /templates/:id`
- Deliveries:
  - `GET /deliveries?userId=me`
  - `POST /deliveries/:id/resend` (ADMIN/TECHNICIAN)

## Tests
Run unit tests:
```bash
npm test
```

Run e2e tests (needs MongoDB):
```bash
export MONGODB_URI=mongodb://localhost:27018/notification_db
npm run test:e2e
```

## Requirement Coverage (Excel)
See `docs/requirement-coverage.md`.
