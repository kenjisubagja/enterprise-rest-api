# Enterprise REST API Example

An enterprise-style REST API example built with **Next.js App Router**, **PostgreSQL**, **Prisma ORM**, JWT authentication, RBAC, validation, pagination, audit logging, Swagger UI, and Docker Compose.

## Features

- Next.js REST API route handlers in `src/app/api`
- PostgreSQL via Prisma ORM
- JWT Bearer authentication
- Role-Based Access Control: `ADMIN`, `MANAGER`, `USER`
- Zod request validation
- Standard response shape: `{ success, data }` and `{ success, error }`
- Pagination and search
- Audit logging for register, login, create/update/delete actions
- Healthcheck endpoint
- Swagger UI and OpenAPI JSON
- Docker Compose PostgreSQL

## Structure

```text
enterprise-rest-api/
  prisma/
    schema.prisma
    seed.ts
  src/
    app/api/
      auth/register/route.ts
      auth/login/route.ts
      auth/me/route.ts
      users/route.ts
      users/[id]/route.ts
      projects/route.ts
      projects/[id]/route.ts
      audit-logs/route.ts
      health/route.ts
      openapi/route.ts
    docs/
      page.tsx
    config/
    middlewares/
    schemas/
    services/
    utils/
```

## Setup

```bash
cd /home/kenjisubagja/Documents/gawean/enterprise-rest-api
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Server jalan di:
Server runs at:

```text
http://localhost:3000
```

## Seed Account

```text
email: admin@example.com
password: Password123!
role: ADMIN
```

## Testing With Swagger UI

Start the server:

```bash
npm run dev
```

Open Swagger UI:

```text
http://localhost:3000/docs
```

Raw OpenAPI JSON is available at:

```text
http://localhost:3000/api/openapi
```

Recommended testing flow:

1. Run **POST /auth/login** with the seed account.
2. Copy `data.accessToken` from the response.
3. Click **Authorize** in Swagger UI.
4. Fill the token with this format:

```text
Bearer paste-token-here
```

5. After that, protected endpoints such as `/auth/me`, `/users`, `/projects`, and `/audit-logs` can be tested directly from Swagger UI.

## Main Endpoints

### Healthcheck

```bash
curl http://localhost:3000/api/health
```

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","name":"User Demo","password":"Password123!"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"Password123!"}'
```

Save the `accessToken`, then use it:

```bash
TOKEN="paste-token-here"
```

### Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### List Users

Admin only.

```bash
curl 'http://localhost:3000/api/users?page=1&limit=20&search=admin' \
  -H "Authorization: Bearer $TOKEN"
```

### Create Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Billing Service","description":"Internal billing API","status":"ACTIVE"}'
```

### List Projects

```bash
curl 'http://localhost:3000/api/projects?page=1&limit=10&search=billing&status=ACTIVE' \
  -H "Authorization: Bearer $TOKEN"
```

### Update Project

```bash
curl -X PATCH http://localhost:3000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"DONE"}'
```

### Audit Logs

Admin or manager.

```bash
curl 'http://localhost:3000/api/audit-logs?page=1&limit=20' \
  -H "Authorization: Bearer $TOKEN"
```

## Role Rules

- `ADMIN`: manage users, read/update/delete all projects, read audit logs.
- `MANAGER`: read all projects and audit logs, but cannot manage users.
- `USER`: create projects, read/update/delete their own projects.

## Security Status

This project is safe enough as a learning/demo API baseline, but it should not be treated as a fully production-hardened service yet. It already includes password hashing, JWT auth, RBAC, Zod validation, Prisma parameterized queries, soft user deactivation, and audit logs.

Before real production use, add rate limiting, refresh token rotation, stricter CORS, request logging/monitoring, automated security tests, API abuse protection, and deployment-specific secret management.

## Production Notes

Common additions before production:

- Refresh token rotation
- Email verification
- Password reset flow
- Rate limiting
- Centralized observability
- CI/CD migration deploy
- Integration tests with a test database
- OpenAPI UI such as Swagger UI or Scalar
