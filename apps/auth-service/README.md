# auth-service (NestJS)

JWT Authentication microservice for your **Equipment Loan System**.

## What it does
- Login with **email + password**
- Issues **Access Token (JWT)** + **Refresh Token**
- Stores refresh tokens **hashed** in PostgreSQL (revocable)
- Swagger docs

## Run locally (PowerShell)
```powershell
cd auth-service
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run db:seed   # optional
npm run dev
```

## Base URL
- http://localhost:3002/api/v1
- Swagger: http://localhost:3002/api/v1/docs

## Endpoints
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
