# Inventory Service (equipment-service)

A NestJS + Prisma + PostgreSQL microservice that manages **equipment inventory** for the Equipment Loan System.

This service is protected by **JWT access tokens** issued by `auth-service`.
Role-based access control is enforced using the `roles` claim inside the token payload.

---

## Features

- CRUD-lite for equipment inventory (create + read + status update)
- PostgreSQL persistence via Prisma ORM
- JWT validation (issuer, audience, secret)
- Role-based authorization:
  - `ADMIN` / `TECH`: create equipment, update equipment status
  - Any authenticated user: list equipment, get equipment by id
- Pagination + search query for listing

---

## Environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Important: **JWT settings must match `auth-service`**:
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`

---

## Install & Run

```bash
npm install
npm run db:setup
npm run start:dev
```

Base URL:

`http://localhost:3003/api/v1`

---

## API Endpoints

All endpoints require:

`Authorization: Bearer <ACCESS_TOKEN>`

### Create equipment (ADMIN/TECH)

`POST /equipment`

### List equipment (any authenticated user)

`GET /equipment?page=1&limit=20&status=AVAILABLE&q=laptop`

### Get equipment by id (any authenticated user)

`GET /equipment/{id}`

### Update equipment status (ADMIN/TECH)

`PATCH /equipment/{id}/status`

Body:

```json
{ "status": "MAINTENANCE" }
```

---

## cURL Examples

Login (auth-service):

```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin12345!"}'
```

List equipment:

```bash
curl http://localhost:3003/api/v1/equipment \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Create equipment:

```bash
curl -X POST http://localhost:3003/api/v1/equipment \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"assetTag":"LAP-0200","name":"MacBook Pro","category":"Laptop"}'
```

---

## Suggested next microservice

**loan-service** (reservations / loans) that references:
- users (borrower)
- equipment (asset being borrowed)
and enforces business rules (availability, due dates, etc.).
