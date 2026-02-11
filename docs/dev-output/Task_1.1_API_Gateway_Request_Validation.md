# Task 1.1 — API Gateway and Request Validation

**Sprint**: 1 — Foundation & Auth  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Backend — API  
**Mode**: V2 (Enterprise Delivery)  
**Status**: Done  
**Start Date**: 2026-02-10  
**Completed Date**: 2026-02-10  
**Estimate**: 2 SP

---

## Stack (Locked)

| Area | Choice |
|------|--------|
| **Runtime** | Node.js ≥18 |
| **Framework** | NestJS 10 (TypeScript) — architecture enforced like Spring Boot |
| **Validation** | class-validator + class-transformer (DTO validation everywhere) |
| **API Docs** | @nestjs/swagger (OpenAPI = source of truth) |
| **Rate Limiting** | @nestjs/throttler (global) |
| **Security** | Helmet 8 (security headers) |
| **Data** | PostgreSQL (primary, Task 2.1) + Redis (sessions/rate limits, Task 8.3) |

---

## Summary

Rebuilt the REST API gateway layer on **NestJS + TypeScript** with strict modular architecture:

- `/modules/{auth, student, attendance, activities}` — each with **controller / service / repository / policy** pattern
- Controllers = HTTP only
- Services = business logic only
- Repositories = DB only
- No cross-module DB access
- Versioned APIs under `/v1`
- OpenAPI spec as source of truth (`/api/docs`)
- DTO validation everywhere (class-validator with whitelist + forbidNonWhitelisted)

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | REST API layer accepts HTTPS only; JSON request/response | **Done** | HttpsEnforceMiddleware + JsonOnlyMiddleware + Helmet |
| 2 | Request body and query validation; invalid input → 400 + consistent error shape | **Done** | Global ValidationPipe (class-validator) + GlobalExceptionFilter |
| 3 | Error response shape `{ code, message, details? }` for 400–500 | **Done** | GlobalExceptionFilter maps all exceptions to `{ code, message, details? }` |
| 4 | Health check endpoint for load balancer | **Done** | `GET /health` → `{ status, service, timestamp, uptime }` |
| 5 | No business or DB logic in API layer; delegates to business layer | **Done** | AuthController → AuthService → AuthRepository (strict separation) |

---

## Security Baseline (Day 1)

| Feature | Implementation |
|---------|----------------|
| Central Auth module | AuthGuard (global, @Public bypass) |
| Central Authorization Guards | AuthorizationGuard + @Roles() decorator |
| Global rate limiting | ThrottlerGuard (X-RateLimit-Limit, X-RateLimit-Remaining headers) |
| Audit log service | AuditService (global, structured logging, no PII) |
| Secrets from vault | .env.example template; vault integration in Task 8.2 |
| MPIN + lockout at gateway | AuthPolicy (MAX_ATTEMPTS=5, LOCKOUT_DURATION=15min) |

---

## API Contract (versioned: /v1)

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/health` | Load balancer health check | Public |
| POST | `/v1/auth/mpin/verify` | Verify MPIN, issue token | Public |
| POST | `/v1/auth/lockout/status` | Check lockout state | Public |
| POST | `/v1/auth/forgot-mpin` | Initiate recovery | Public |
| GET | `/api/docs` | OpenAPI Swagger UI (dev) | Public |

---

## Code Structure

```
backend/src/
├── main.ts                              # Bootstrap (Helmet, CORS, Swagger, GlobalPipes)
├── app.module.ts                        # Root module
├── config/
│   ├── config.module.ts                 # NestJS ConfigModule (global)
│   └── configuration.ts                # Typed config factory
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts          # @Public() — bypass auth
│   │   └── roles.decorator.ts           # @Roles('student')
│   ├── dto/
│   │   └── error-response.dto.ts        # Standard error shape
│   ├── filters/
│   │   └── http-exception.filter.ts     # GlobalExceptionFilter → {code,message,details?}
│   ├── guards/
│   │   ├── auth.guard.ts                # Central AuthGuard (Bearer)
│   │   └── authorization.guard.ts       # Central AuthorizationGuard (roles)
│   ├── interceptors/
│   │   ├── request-id.interceptor.ts    # X-Request-Id UUID
│   │   └── logging.interceptor.ts       # HTTP request logging
│   └── middleware/
│       ├── https-enforce.middleware.ts   # HTTPS redirect (behind LB)
│       └── json-only.middleware.ts       # 415 for non-JSON
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts           # HTTP only
│   │   ├── auth.service.ts              # Business logic only
│   │   ├── auth.repository.ts           # DB only (stub)
│   │   ├── auth.policy.ts               # Authorization policies
│   │   └── dto/
│   │       ├── verify-mpin.dto.ts
│   │       ├── lockout-status.dto.ts
│   │       └── forgot-mpin.dto.ts
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   ├── student/                         # Stub (Sprint 3/5)
│   ├── attendance/                      # Stub (Sprint 5)
│   └── activities/                      # Stub (Sprint 3/4)
└── shared/
    ├── audit/
    │   ├── audit.module.ts              # Global
    │   └── audit.service.ts             # Structured audit logging
    └── database/                        # DB config (Task 2.1)
```

---

## Verification Results

| Test | Expected | Result |
|------|----------|--------|
| `GET /health` | 200 + JSON status | **Pass** |
| `GET /nonexistent` | 404 + `{ code: "NOT_FOUND" }` | **Pass** |
| MPIN too short (`"123"`) | 400 + validation details | **Pass** |
| Missing MPIN (`{}`) | 400 + validation details | **Pass** |
| Unknown property (`{"hacked": true}`) | 400 + forbidNonWhitelisted | **Pass** |
| Valid MPIN (`"123456"`) | 500 + business stub delegation | **Pass** |
| Invalid JSON body | 400 + `BAD_REQUEST` | **Pass** |
| Non-JSON Content-Type | 415 + `UNSUPPORTED_MEDIA_TYPE` | **Pass** |
| Response headers | Helmet + X-Request-Id + X-RateLimit | **Pass** |
| Swagger UI | HTTP 200 at `/api/docs` | **Pass** |
| TypeScript build | Zero errors | **Pass** |

---

## Notes for Next Tasks

1. **Task 1.2**: Implement `AuthService.verifyMpin()` → call `AuthRepository` for MPIN hash lookup; issue JWT; wire `AuthPolicy.isLockedOut()`
2. **Task 1.4**: Complete `AuthGuard` token validation; extract `student_id`; attach to `request.student`
3. **Task 2.1**: Add PostgreSQL connection via TypeORM or Prisma in `shared/database/`; wire repositories
4. **Task 8.3**: Replace in-memory Throttler with Redis-backed store; add per-route rate limits on `/v1/auth/mpin/verify`
