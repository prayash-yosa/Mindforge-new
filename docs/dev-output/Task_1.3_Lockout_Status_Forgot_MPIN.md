# Task 1.3 — Lockout Status and Forgot MPIN Entry Points

| Field | Value |
|---|---|
| **Sprint** | 1 — Foundation & Auth |
| **Task** | 1.3 |
| **Title** | Lockout status and Forgot MPIN entry points |
| **Type** | Feature |
| **Stack** | Node.js + NestJS (TypeScript) |
| **Status** | Done |
| **Started** | 2026-02-11 |
| **Completed** | 2026-02-11 |
| **Dependencies** | Task 1.2 (sessions and lockout state) |

---

## Checklist

- [x] `POST /auth/lockout/status` returns current lockout state (locked until timestamp, attempts remaining)
- [x] `POST /auth/forgot-mpin` initiates recovery — endpoint exists and returns 202 with documented behavior
- [x] API error shape consistent; 403 for lockout where appropriate

---

## Implementation Details

### POST /v1/auth/lockout/status

**File**: `src/modules/auth/auth.service.ts` → `getLockoutStatus()`

Returns a structured lockout status response:

```json
{
  "isLocked": false,
  "attemptsRemaining": 5,
  "maxAttempts": 5,
  "lockoutDurationMinutes": 15
}
```

When locked:

```json
{
  "isLocked": true,
  "lockedUntil": "2026-02-11T08:30:00.000Z",
  "attemptsRemaining": 0,
  "maxAttempts": 5,
  "lockoutDurationMinutes": 15
}
```

**Security**: Unknown `studentId` returns generic "not locked" response — does not leak whether the student exists.

**DTO**: `LockoutStatusDto` validates `studentId` as required UUID. Invalid → 400 `VALIDATION_ERROR`.

### POST /v1/auth/forgot-mpin

**File**: `src/modules/auth/auth.service.ts` → `initForgotMpin()`

Returns HTTP 202 Accepted:

```json
{
  "status": "accepted",
  "message": "Recovery request received. If a matching account exists, instructions will be sent to the registered contact. Please contact your school administrator if you need immediate assistance."
}
```

**V1 scope**: Entry point only. Full OTP/recovery flow deferred to external provider integration.

**DTO**: `ForgotMpinDto` — `studentId` (optional UUID), `contact` (optional string, max 256).

**Audit**: `FORGOT_MPIN_INITIATED` logged with requestId, IP, and whether contact was provided.

### Error Shape Consistency

All error responses follow the global pattern:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [{ "message": "studentId must be a valid UUID" }]
}
```

- 400 — DTO validation failure
- 403 — Account locked (via `verifyMpin` flow from Task 1.2)
- 429 — Rate limited (via ThrottlerGuard)

---

## Files Modified

| File | Change |
|---|---|
| `src/modules/auth/auth.service.ts` | Full `getLockoutStatus()` and `initForgotMpin()` implementations |
| `src/modules/auth/auth.controller.ts` | Updated lockout/status and forgot-mpin endpoints with request context |
| `src/modules/auth/dto/lockout-status.dto.ts` | Made `studentId` required (non-optional) |

---

## Verification Results

| Test | Expected | Actual | Pass |
|---|---|---|---|
| Lockout status — known student, no lockout | 200, isLocked:false, attemptsRemaining:5 | 200, isLocked:false, attemptsRemaining:5 | ✅ |
| Lockout status — unknown student | 200, isLocked:false (no leak) | 200, isLocked:false | ✅ |
| Lockout status — missing studentId | 400 VALIDATION_ERROR | 400 VALIDATION_ERROR | ✅ |
| Lockout status — invalid UUID | 400 VALIDATION_ERROR | 400 VALIDATION_ERROR | ✅ |
| Forgot MPIN — valid request | 202, status:accepted | 202, status:accepted | ✅ |
| Forgot MPIN — minimal body | 202, status:accepted | 202, status:accepted | ✅ |
| Error shape | {code, message, details?} | {code, message, details?} | ✅ |
