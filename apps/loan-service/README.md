# loan-service (NestJS + Prisma + PostgreSQL)

This microservice manages **equipment loans** for the *equipment-loan-system*.

It integrates with:
- **users-service** (to validate that the user exists)
- **inventory-service** (to ensure equipment exists and is AVAILABLE, and to switch equipment status to LOANED/AVAILABLE)

> Auth model: It expects **JWT Bearer tokens** minted by your `auth-service`.
> The token is forwarded to downstream services as-is.

---

## Features

- Create loan (`POST /api/v1/loans`)
- List all loans (`GET /api/v1/loans`) — **ADMIN/TECH**
- List my loans (`GET /api/v1/loans/my`) — authenticated user
- Return/close a loan (`PATCH /api/v1/loans/:id/return`) — **ADMIN/TECH**
- Health check (`GET /api/v1/health`)

### Business rules

- Equipment must be `AVAILABLE` to create a loan.
- On loan creation the service attempts to switch equipment to `LOANED`.
  - If the status update fails, the loan is **rolled back** (compensation).
- Returning a loan switches equipment back to `AVAILABLE` first, then closes the loan.
  - If the equipment update fails, the loan is **not** closed.

---

## Requirements

- Node.js 18+ (recommended 20+)
- Docker (optional)
- Running services:
  - users-service (`http://localhost:3001/api/v1`)
  - inventory-service (`http://localhost:3003/api/v1`)
  - auth-service (to obtain JWT tokens)

---

## Environment variables

Copy `.env.example` to `.env` and adjust:

```bash
copy .env.example .env
```

Key variables:
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- `USERS_SERVICE_URL`, `INVENTORY_SERVICE_URL`

---

## Local setup (without Docker)

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

---

## Docker setup

### docker-compose (DB + service)

```bash
docker compose up -d --build
```

Then run migrations from host:

```bash
npm run prisma:migrate
npm run prisma:seed
```

---

## API examples (curl)

Replace `<ACCESS_TOKEN>` with a JWT from your auth-service.

### Create a loan

```bash
curl -X POST http://localhost:3004/api/v1/loans \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "cff4f924-109c-4a3e-940c-5b076ca0f7fa",
    "dueDate": "2026-02-01T00:00:00.000Z",
    "notes": "Loan for class project"
  }'
```

### List my loans

```bash
curl -X GET http://localhost:3004/api/v1/loans/my \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### List all loans (ADMIN/TECH)

```bash
curl -X GET http://localhost:3004/api/v1/loans \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Return a loan (ADMIN/TECH)

```bash
curl -X PATCH http://localhost:3004/api/v1/loans/<LOAN_ID>/return \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "notes": "Returned in good condition" }'
```

---

## Notes

- This service uses **compensation** rather than distributed transactions.
- If your users-service does not expose `GET /users/:id`, update the check in `LoansService.assertUserExists()`.

