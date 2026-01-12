# reservation-service

Reservation microservice for the **Equipment Loan Management System**.

This service manages **advance reservations/booking windows** for equipment, prevents **time overlaps** per equipment, validates equipment availability using **inventory-service**, and emits **audit events** via **integration-service**.

---

## Architecture Notes

**Layered clean architecture**:

- **Controller**: HTTP boundary (`reservations.controller.ts`)
- **Service**: business rules (conflict detection, RBAC, validation)
- **Repository**: Prisma DB access

Cross-cutting:
- Central exception filter
- DTO validation (class-validator)
- JSON logs + correlation id (`x-correlation-id`)
- Observability: `/health`, `/metrics`

---

## Folder tree (high level)

- `src/modules/reservations` – core domain
- `src/modules/events` – event contracts + publisher + webhook consumer
- `src/modules/authz` – JWT + RBAC
- `prisma` – schema + migrations + seed
- `test` – e2e tests

---

## Quick start (Docker)

1) Copy env:

```bash
cp .env.example .env
```

2) Start services:

```bash
docker compose up --build
```

3) Create database (only once):

```bash
docker exec -it postgres-reservation psql -U postgres -c "CREATE DATABASE reservation_db;"
```

4) Run migrations + seed (locally or inside container):

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Swagger:
- `http://localhost:3005/api/v1/docs`

---

## API

Base: `http://localhost:3005/api/v1`

- `POST /reservations`
- `GET /reservations` (filters: `userId`, `equipmentId`, `status`, `from`, `to`)
- `GET /reservations/:id`
- `DELETE /reservations/:id` (cancel)
- `PATCH /reservations/:id/status` (ADMIN/TECH)
- `GET /health`
- `GET /metrics`

---

## RBAC

JWT required by default (`AUTH_REQUIRED=true`).

Roles:
- **Student/Teacher**: can create/cancel/list their own reservations only
- **ADMIN/TECH**: can list/manage any reservation

---

## Conflict rule

Overlap is blocked using:

`startAt < existing.endAt AND endAt > existing.startAt` for `ACTIVE` reservations.

---

## Inventory validation

Before creating a reservation:

`GET {INVENTORY_SERVICE_URL}/equipment/{equipmentId}`

Equipment must be `AVAILABLE`.

---

## Expiration policy (configurable)

Reservation expires when:
- `status == ACTIVE`
- `createdAt < now - RESERVATION_HOLD_TTL_MINUTES`

Expiration scan runs periodically (30s in code; documented with env var `RESERVATION_EXPIRATION_SCAN_SECONDS` for future tuning).

Expired reservations emit `ReservationExpired` events.

---

## Events

Broker-agnostic topic names (Kafka topic / Rabbit routing key / MQTT topic):

- `reservation.created.v1`
- `reservation.cancelled.v1`
- `reservation.expired.v1`
- `reservation.conflict_detected.v1`

Publisher behavior:
- POST to `INTEGRATION_SERVICE_EVENTS_URL` if configured:
  `{ "topic": "...", "envelope": { ... } }`

Consumer behavior:
- `POST /api/v1/events/inventory` accepts inventory forwarded events (optional).

---

## Testing

Unit tests:
```bash
npm test
```

E2E:
```bash
npm run test:e2e
```

E2E runs with `AUTH_REQUIRED=false`.

---

## CI snippet

See: `.github/workflows/ci.example.yml`

---

## Requirement Coverage (Excel)

1) Mono Repo ✅ Implemented: service structure supports monorepo `apps/reservation-service`.
2) Language/framework ✅ Implemented: Node.js + TypeScript + NestJS.
3) Multiplatform + roles ✅ Implemented (RBAC/JWT). Multiplatform apps are in frontend repos. ⚠️ Partial (system-level).
4) 10+ microservices ❌ Not applicable to single repo; satisfied at system level.
5) Security (bastion/CORS/WAF/rate/JWT) ⚠️ Partial: JWT + CORS in this service; WAF/rate/bastion via Cloudflare/API GW/Terraform.
6) AWS + PaaS ✅ Not applicable here (infra repo).
7) DevOps CI/CD ✅ Included example workflow.
8) Testing load/unit/functional ⚠️ Partial: unit + e2e included; load tests in system toolchain.
9) Docker registry ✅ Not applicable here; Dockerfile included (publishing handled by CI).
10) Design principles ✅ Implemented (clean layers, validation, low coupling).
11) 3 DBs + cache ❌ System-level requirement; this service uses PostgreSQL only.
12) ELB/ASG ❌ Infra-level.
13) Terraform ❌ Infra-level.
14) API Gateway ❌ Infra-level.
15) Comms + Kafka/Rabbit/MQTT ⚠️ Partial: REST + event contracts + integration-service publisher/consumer endpoint. Brokers in integration-service/infra.
16) Architectures + Event-Driven + CQRS ⚠️ Partial: event-driven via contracts/events; CQRS read model can be extended in analytics/reporting.
17) Monitoring (Site24x7 + Prometheus + Grafana) ⚠️ Partial: `/metrics` here; Grafana/Site24x7 infra.
18) High availability ❌ Infra-level.
19) On-prem backups ❌ Infra-level.
20) n8n ❌ Integration/automation layer.
21) Documentation ✅ Swagger + README.

22) Kubernetes ❌ Infra-level.
23) Cache management ⚠️ Partial: equipment_state table for optional local caching; Redis cache system-level.
24) Multi region ❌ Infra-level.
25) Multi VPC ❌ Infra-level.
26) Automatic DB backups ❌ Infra-level.
27) Automatic EC2 creation ❌ Infra-level.
28) Microfrontends ❌ Frontend repo.
29) Go parallel programming ❌ Another microservice/language in system-level.
30) Blockchain ❌ Separate component.
31) AI agent ❌ Separate component.
32) Payment gateway ❌ Separate component.
33) Active Directory ❌ Separate auth integration.

