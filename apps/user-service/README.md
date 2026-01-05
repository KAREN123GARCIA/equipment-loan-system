# user-service (NestJS + PostgreSQL)

This repository folder contains the **User Domain microservice** for the **Equipment Loan Management System**.

According to the project architecture:
- `user-service` is responsible for **User CRUD** and **Role Assignment** (RBAC).
- It **does not authenticate** users and **does not change equipment states**. fileciteturn5file0L69-L72

The platform is designed as **10 microservices** and adopts a **monorepo** (`apps/` for microservices, `packages/` for shared libs). fileciteturn5file0L67-L71  
Each microservice follows **Hexagonal Architecture (Ports & Adapters)** internally to isolate business logic from infrastructure. fileciteturn4file0L5-L8

---

## Features

- User management: create, update, list (paginated), soft-disable (status = DISABLED)
- Role management: list roles, assign roles to users
- REST API with Swagger (OpenAPI)
- JWT guard (optional) and RBAC role checks (ADMIN-only for critical endpoints)
- Health endpoint (`/health`)
- Prometheus metrics endpoint (`/metrics`)
- Docker packaging

---

## Tech Stack

- Node.js + NestJS fileciteturn4file3L11-L18
- PostgreSQL (Users DB) fileciteturn4file2L39-L44
- Docker for packaging fileciteturn4file0L51-L53
- CI/CD intended via GitHub Actions + Docker registry fileciteturn5file1L7-L13
- Observability via Prometheus/Grafana fileciteturn4file0L54-L55

---

## Quick Start (Local)

### 1) Install dependencies
```bash
pnpm install
```

### 2) Create `.env`
Copy the example file:
```bash
cp .env.example .env
```

### 3) Run PostgreSQL (option A: docker-compose)
```bash
docker compose -f docker-compose.local.yml up -d postgres-users
```

### 4) Run migrations + seed roles
```bash
pnpm prisma:migrate --name init
pnpm db:seed
```

### 5) Start the service
```bash
pnpm dev
```

Service runs at:
- API base: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/v1/docs`
- Health: `http://localhost:3001/health`
- Metrics: `http://localhost:3001/metrics`

---

## Docker

### Build
```bash
docker build -t user-service:local -f Dockerfile .
```

### Run
```bash
docker run --rm -p 3001:3001 --env-file .env user-service:local
```

---

## API Endpoints (high level)

- `GET /health`
- `GET /metrics`
- `POST /users` (ADMIN by default; can be opened in local dev with env flags)
- `GET /users?page=1&limit=20&q=...&status=ACTIVE`
- `GET /users/:id`
- `PATCH /users/:id` (ADMIN)
- `DELETE /users/:id` (ADMIN)
- `GET /users/:id/roles`
- `POST /users/:id/roles` (ADMIN)
- `GET /roles`

---

## Security Notes

Production security is enforced primarily at the **API Gateway** (JWT, CORS, rate limiting, Cloudflare WAF). fileciteturn5file2L13-L18  
This service includes an **optional** JWT validation layer for defense-in-depth and local testing.

Environment flags:
- `AUTH_REQUIRED=true|false` (default false for local)
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE` for validation

---

## Testing

- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e`

The platform requires unit + functional tests, and load tests integrated in CI/CD. fileciteturn5file2L9-L9

---

## Monorepo Integration

Place this folder at:
```
apps/user-service
```

If you already have a root monorepo with Turborepo and pnpm workspaces, you can run:
```bash
pnpm --filter user-service dev
```

---

## License

Academic project (define your license in the root repository).
