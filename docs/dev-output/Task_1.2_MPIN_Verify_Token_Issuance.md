# Task 1.2 — MPIN Verify and Token/Session Issuance

**Sprint**: 1 — Foundation & Auth  
**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Backend — Auth  
**Mode**: V2 (Enterprise Delivery)  
**Status**: Done  
**Start Date**: 2026-02-11  
**Completed Date**: 2026-02-11  
**Estimate**: 3 SP  
**Dependencies**: Task 1.1 (API gateway) — Done

---

## Summary

Implemented full MPIN verification and JWT token issuance flow on the NestJS backend. Students authenticate by entering their 6-digit MPIN; the system validates it against a bcrypt hash, enforces lockout policy (5 attempts → 15 min lockout), issues a signed JWT on success, and audits all login operations. No MPIN is ever logged or returned to the client.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | `POST /auth/mpin/verify` accepts 6-digit MPIN; validates against stored hash (no MPIN in logs or client) | **Done** | bcrypt hash comparison via `AuthRepository.findStudentByMpinMatch()`; MPIN never appears in logs, responses, or JWT payload |
| 2 | On success: issue short-lived token; return Bearer; client can use for subsequent requests | **Done** | `@nestjs/jwt` signs JWT with `sub=studentId`, `class`, `board`, `iss=mindforge-backend`, `exp=1h`; returns `{ token, tokenType: "Bearer", expiresIn: "1h", student }` |
| 3 | On failure: return 401 and clear error message; do not leak whether MPIN or identity was wrong | **Done** | Returns `{ code: "INVALID_CREDENTIALS", message: "Invalid MPIN. Please try again." }` — same message regardless of whether a student exists |
| 4 | Rate limiting and lockout policy documented and implemented (5 attempts → lockout) | **Done** | `AuthPolicy`: 5 failed attempts → 15 min lockout (403 `ACCOUNT_LOCKED` with `lockedUntil`); `@Throttle(10/60s)` on mpin/verify endpoint; lockout auto-resets after duration |
| 5 | Sensitive operations (failed/success login) written to audit_log | **Done** | `AuditService.log()` called for `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGIN_BLOCKED_LOCKOUT` with requestId, IP, studentId (pseudonymous), sessionId |

---

## Files Modified/Created

| File | Change |
|------|--------|
| `modules/auth/auth.service.ts` | Full `verifyMpin()` implementation — bcrypt check, lockout, JWT, audit |
| `modules/auth/auth.repository.ts` | In-memory store with seeded test student; lockout state management |
| `modules/auth/auth.policy.ts` | Lockout rules: 5 attempts → 15 min; `checkLockout()`, `recordFailedAttempt()`, `clearLockout()` |
| `modules/auth/auth.controller.ts` | Added `@Throttle(10/60s)`, passes request context (IP, requestId) to service |
| `modules/auth/auth.module.ts` | Wired `JwtModule.registerAsync()` with config-driven secret and expiry |
| `modules/auth/dto/lockout-status.dto.ts` | Relaxed UUID version constraint |
| `modules/auth/dto/forgot-mpin.dto.ts` | Relaxed UUID version constraint |
| `config/configuration.ts` | Added `jwt.secret` and `jwt.expiresIn` config |
| `.env.example` | Added `JWT_SECRET` and `JWT_EXPIRES_IN` vars |
| `package.json` | Added `@nestjs/jwt`, `bcryptjs`, `@types/bcryptjs` |

---

## Authentication Flow

```
Client                        API Controller              AuthService              AuthRepository       AuthPolicy
  │                               │                           │                        │                   │
  │ POST /v1/auth/mpin/verify     │                           │                        │                   │
  │ { mpin: "123456" }            │                           │                        │                   │
  │──────────────────────────────>│                           │                        │                   │
  │                               │ DTO validated (Joi)       │                        │                   │
  │                               │──────────────────────────>│                        │                   │
  │                               │                           │ findStudentByMpinMatch │                   │
  │                               │                           │───────────────────────>│ bcrypt.compare()  │
  │                               │                           │<───────────────────────│ student found     │
  │                               │                           │                        │                   │
  │                               │                           │ checkLockout(studentId)│                   │
  │                               │                           │────────────────────────────────────────────>│
  │                               │                           │<────────────────────────────────────────────│ not locked
  │                               │                           │                        │                   │
  │                               │                           │ clearLockout()         │                   │
  │                               │                           │────────────────────────────────────────────>│
  │                               │                           │                        │                   │
  │                               │                           │ jwtService.sign()      │                   │
  │                               │                           │ upsertSession()        │                   │
  │                               │                           │ auditService.log()     │                   │
  │                               │                           │                        │                   │
  │                               │<──────────────────────────│ { token, student }     │                   │
  │<──────────────────────────────│ 200 { token, tokenType, expiresIn, student }       │                   │
```

---

## JWT Token Payload

```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "studentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "class": "8",
  "board": "CBSE",
  "iat": 1770791758,
  "exp": 1770795358,
  "iss": "mindforge-backend"
}
```

No MPIN, no PII beyond pseudonymous studentId.

---

## Lockout Policy

| Parameter | Value | Source |
|-----------|-------|--------|
| Max attempts | 5 | Architecture R7 |
| Lockout duration | 15 minutes | UX spec |
| Reset on success | Yes | Clear all failed attempts |
| Rate limit (per IP) | 10 requests / 60 seconds | `@Throttle` on mpin/verify |

---

## Security Audit Trail

All login operations are logged via `AuditService`:

```json
{
  "requestId": "c017a1bf-818b-4185-affa-7aefcfaebe6e",
  "action": "LOGIN_SUCCESS",
  "studentId": "a1b2c3d4-...",
  "ip": "::1",
  "metadata": { "sessionId": "af4e620e-..." },
  "timestamp": "2026-02-11T06:37:06.677Z"
}
```

Actions: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGIN_BLOCKED_LOCKOUT`

---

## Verification Results

| Test | Expected | Result |
|------|----------|--------|
| Correct MPIN (123456) | 200 + JWT + student info | **Pass** |
| Wrong MPIN (999999) | 401 `INVALID_CREDENTIALS` | **Pass** |
| Wrong MPIN (000000) | 401, no identity leak | **Pass** |
| Short MPIN (12) | 400 validation error | **Pass** |
| Lockout status (unlocked) | `{ isLocked: false, attemptsRemaining: 5 }` | **Pass** |
| Rate limit headers | `X-RateLimit-Limit: 10` (stricter) | **Pass** |
| MPIN not in response fields | No mpin/mpinHash keys | **Pass** |
| JWT payload decoded | Contains sub, studentId, class, board, iss | **Pass** |
| Audit log (LOGIN_SUCCESS) | Structured log with requestId, IP | **Pass** |
| Audit log (LOGIN_FAILURE) | Logged without studentId (no leak) | **Pass** |
| TypeScript build | Zero errors | **Pass** |

---

## Notes for Next Tasks

1. **Task 1.3**: Implement `getLockoutStatus()` and `forgotMpin()` fully; add lockout countdown in response
2. **Task 1.4**: Complete `AuthGuard` to verify JWT via `JwtService.verify()`; extract `student_id` from payload; attach to `request.student`
3. **Task 2.1**: Replace in-memory store with PostgreSQL; migrate `AuthRepository` to real queries
4. **Task 8.3**: Move rate limiting to Redis-backed store for distributed deployments
