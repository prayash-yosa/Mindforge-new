# Task 1.4 — Auth Middleware and Bearer Token Validation

| Field | Value |
|---|---|
| **Sprint** | 1 — Foundation & Auth |
| **Task** | 1.4 |
| **Title** | Auth middleware and Bearer token validation |
| **Type** | Hardening |
| **Stack** | Node.js + NestJS (TypeScript) |
| **Status** | Done |
| **Started** | 2026-02-11 |
| **Completed** | 2026-02-11 |
| **Dependencies** | Task 1.2 |

---

## Checklist

- [x] Middleware validates token/session on all routes except `/auth/*` and health
- [x] Invalid or expired token → 401 with consistent error shape
- [x] Authenticated `student_id` available to business layer for scope (no cross-student access)

---

## Implementation Details

### AuthGuard — JWT Verification

**File**: `src/common/guards/auth.guard.ts`

The global `AuthGuard` (registered via `APP_GUARD`) now performs real JWT verification:

1. **@Public() bypass**: Routes decorated with `@Public()` skip authentication (auth endpoints, health check)
2. **Header check**: Missing or malformed `Authorization: Bearer <token>` → 401 `UNAUTHORIZED`
3. **JWT verification**: Uses `JwtService.verifyAsync(token, { secret })` with ConfigService secret
4. **Payload extraction**: Extracts `sub`, `studentId`, `class`, `board` from JWT claims
5. **Request attachment**: Attaches `AuthenticatedStudent` object to `request.student`

### Error Differentiation

| Scenario | Code | Message |
|---|---|---|
| No Authorization header | `UNAUTHORIZED` | Missing or invalid authorization token |
| Malformed Bearer | `UNAUTHORIZED` | Missing or invalid authorization token |
| Expired JWT | `TOKEN_EXPIRED` | Session expired. Please log in again. |
| Invalid/tampered JWT | `INVALID_TOKEN` | Invalid authorization token |
| Wrong secret | `INVALID_TOKEN` | Invalid authorization token |

All errors return consistent shape: `{ code, message }`

### @Student() Parameter Decorator

**File**: `src/common/decorators/student.decorator.ts`

Clean extraction of authenticated student in controllers:

```typescript
// Full student object
@Get('profile')
getProfile(@Student() student: AuthenticatedStudent) {
  return this.service.getProfile(student.id);
}

// Single property
@Get('settings')
getSettings(@Student('id') studentId: string) {
  return this.service.getSettings(studentId);
}
```

### Student Scoping (No Cross-Student Access)

The `AuthenticatedStudent` interface attached to the request:

```typescript
interface AuthenticatedStudent {
  id: string;        // from JWT sub
  studentId: string; // from JWT studentId
  class: string;     // from JWT class
  board: string;     // from JWT board
}
```

Business layer accesses only `request.student.id` — no way to query another student's data through the API.

### Protected Endpoint Demo

**File**: `src/modules/student/student.controller.ts`

`GET /v1/student/me` — returns the authenticated student context (requires Bearer token):

```json
{
  "studentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "class": "8",
  "board": "CBSE",
  "message": "Authenticated via JWT (AuthGuard Task 1.4)"
}
```

---

## Files Modified / Created

| File | Change |
|---|---|
| `src/common/guards/auth.guard.ts` | Full JWT verification via JwtService + ConfigService |
| `src/common/decorators/student.decorator.ts` | **New** — @Student() param decorator |
| `src/modules/auth/auth.module.ts` | Made `@Global()`, exports JwtModule for AuthGuard DI |
| `src/modules/student/student.controller.ts` | **New** — GET /v1/student/me (protected endpoint demo) |
| `src/modules/student/student.module.ts` | Registered StudentController |

---

## Verification Results

| Test | Expected | Actual | Pass |
|---|---|---|---|
| Protected route — no token | 401 UNAUTHORIZED | 401 UNAUTHORIZED | ✅ |
| Protected route — garbage token | 401 INVALID_TOKEN | 401 INVALID_TOKEN | ✅ |
| Protected route — expired token | 401 TOKEN_EXPIRED | 401 TOKEN_EXPIRED | ✅ |
| Protected route — wrong secret | 401 INVALID_TOKEN | 401 INVALID_TOKEN | ✅ |
| Protected route — valid token | 200 with student context | 200 with studentId, class, board | ✅ |
| Public route /health — no token | 200 | 200 | ✅ |
| Public route /v1/auth/* — no token | 200 | 200 | ✅ |
| Student scoping | JWT studentId in response | Matches JWT sub claim | ✅ |
