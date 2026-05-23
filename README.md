# Enterprise REST API Example

An enterprise-style REST API example built with **Next.js App Router**, **PostgreSQL**, **Prisma ORM**, JWT authentication, RBAC, validation, pagination, audit logging, Swagger UI, and Docker Compose.

## Features

- Next.js REST API route handlers in `src/app/api`
- PostgreSQL via Prisma ORM
- JWT Bearer authentication
- Forgot password and reset password flow with hashed, expiring, single-use reset tokens
- Role-Based Access Control: `ADMIN`, `MANAGER`, `USER`
- Zod request validation
- Standard response shape: `{ success, data }` and `{ success, error }`
- Pagination and search
- Audit logging for register, login, create/update/delete actions
- Healthcheck endpoint
- Swagger UI and OpenAPI JSON
- Docker Compose PostgreSQL

## Environment Variables

Copy `.env.example` to `.env`, then adjust values as needed:

```text
DATABASE_URL="postgresql://app:app_password@localhost:5432/enterprise_api?schema=public"
JWT_SECRET="change-this-to-a-long-random-secret-at-least-32-characters"
JWT_EXPIRES_IN="15m"
BCRYPT_ROUNDS="12"
APP_BASE_URL="http://localhost:3000"
SHOW_RESET_TOKEN_IN_RESPONSE="true"
```

`SHOW_RESET_TOKEN_IN_RESPONSE=true` is only for local development. It lets Swagger UI show the reset token so the password reset flow can be tested without a real email provider. For production, set it to `false` and send the reset URL by email.

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
      auth/forgot-password/route.ts
      auth/reset-password/route.ts
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
cd enterprise-rest-api
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Server runs at:

```text
http://localhost:3000
```

## Seed Account Default

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

## Forgot Password Flow

The password reset implementation uses a dedicated `PasswordResetToken` table. Raw reset tokens are never stored in the database; only SHA-256 token hashes are stored. Tokens expire after 30 minutes and are invalidated after use.

This demo does not send real email. For local testing, `.env` uses:

```text
SHOW_RESET_TOKEN_IN_RESPONSE="true"
```

Recommended test flow:

1. Run **POST /auth/forgot-password**.
2. Use this body:

```json
{
  "email": "admin@example.com"
}
```

3. Copy `data.resetToken` from the response.
4. Run **POST /auth/reset-password**.
5. Use this body:

```json
{
  "token": "paste-reset-token-here",
  "password": "NewPassword123!"
}
```

6. Login again with the new password.

For production, set `SHOW_RESET_TOKEN_IN_RESPONSE=false` and send the reset URL through a trusted email provider instead.

### Forgot Password Endpoint

```http
POST /api/auth/forgot-password
Content-Type: application/json
```

Request:

```json
{
  "email": "admin@example.com"
}
```

Response in local/demo mode:

```json
{
  "success": true,
  "data": {
    "message": "If an active account exists for that email, a password reset link has been generated.",
    "resetToken": "demo-token",
    "resetUrl": "http://localhost:3000/reset-password?token=demo-token",
    "expiresAt": "2026-05-23T15:30:00.000Z"
  }
}
```

Response in production mode:

```json
{
  "success": true,
  "data": {
    "message": "If an active account exists for that email, a password reset link has been generated."
  }
}
```

The response is intentionally generic whether the email exists or not. This prevents account enumeration.

### Reset Password Endpoint

```http
POST /api/auth/reset-password
Content-Type: application/json
```

Request:

```json
{
  "token": "paste-reset-token-here",
  "password": "NewPassword123!"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully."
  }
}
```

Invalid, expired, or already-used tokens return:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid or expired reset token"
  }
}
```

### Password Reset Security Behavior

- Reset token values are generated with cryptographic randomness.
- Only token hashes are stored in PostgreSQL.
- Reset tokens expire after 30 minutes.
- A used token cannot be reused.
- Requesting a new token invalidates older active reset tokens for the same user.
- Password reset requests and successful resets are written to the audit log.
- The forgot-password response is generic to avoid email/account enumeration.

## Role Rules

- `ADMIN`: manage users, read/update/delete all projects, read audit logs.
- `MANAGER`: read all projects and audit logs, but cannot manage users.
- `USER`: create projects, read/update/delete their own projects.

## Security Status

This project is safe enough as a learning/demo API baseline, but it should not be treated as a fully production-hardened service yet. It already includes password hashing, JWT auth, RBAC, Zod validation, Prisma parameterized queries, soft user deactivation, password reset token hashing, reset token expiry, single-use reset tokens, and audit logs.

Before real production use, add rate limiting, refresh token rotation, stricter CORS, request logging/monitoring, automated security tests, API abuse protection, deployment-specific secret management, and a trusted email provider for password reset delivery.
