# Task 2.3 — Business Layer Skeleton and Dependency Injection

| Field | Value |
|---|---|
| **Sprint** | 2 — Data & Backend Core |
| **Task** | 2.3 |
| **Title** | Business layer skeleton and dependency injection |
| **Type** | Hardening |
| **Stack** | NestJS Services + Domain Exceptions |
| **Status** | Done |
| **Started** | 2026-02-12 |
| **Completed** | 2026-02-12 |
| **Dependencies** | Task 2.2 |

---

## Checklist

- [x] Business services for: auth (MPIN verify, lockout), today's plan, activities, grading, attendance, doubts (stubs OK where not yet implemented)
- [x] API layer calls business layer only; business layer calls data access and external (AI, NotebookLM) only
- [x] Domain exceptions (e.g. InvalidMPIN, LockedOut, ActivityNotFound) mapped to API codes/messages; no stack to client

---

## Implementation Details

### Business Services

| Service | Module | Key Methods | Status |
|---|---|---|---|
| `AuthService` | auth | verifyMpin, getLockoutStatus, initForgotMpin | Full (Sprint 1) |
| `StudentService` | student | getTodayPlan, getProfile, getSyncStatus | Full (today's plan) + stubs |
| `ActivitiesService` | activities | getActivity, submitAnswer, pauseActivity, getResult | Full logic |
| `GradingService` | activities | grade (deterministic for MCQ/TF/fill; AI stub) | Partial — AI deferred |
| `AttendanceService` | attendance | getAttendance (summary + calendar) | Full |
| `DoubtService` | activities | getThreads, getThread, createMessage (AI stub) | Full structure, AI stub |

### Domain Exceptions

| Exception | HTTP Status | Code | Usage |
|---|---|---|---|
| `InvalidMpinException` | 401 | `INVALID_CREDENTIALS` | Wrong MPIN |
| `AccountLockedException` | 403 | `ACCOUNT_LOCKED` | Too many failed attempts |
| `TokenExpiredException` | 401 | `TOKEN_EXPIRED` | JWT expired |
| `ActivityNotFoundException` | 404 | `ACTIVITY_NOT_FOUND` | Activity doesn't exist or not accessible |
| `ActivityAlreadyCompletedException` | 409 | `ACTIVITY_ALREADY_COMPLETED` | Trying to submit to completed activity |
| `ActivityExpiredException` | 410 | `ACTIVITY_EXPIRED` | Past due date |
| `QuestionNotFoundException` | 404 | `QUESTION_NOT_FOUND` | Question doesn't exist |
| `DoubtThreadNotFoundException` | 404 | `DOUBT_THREAD_NOT_FOUND` | Thread doesn't exist or not accessible |
| `StudentNotFoundException` | 404 | `STUDENT_NOT_FOUND` | Student doesn't exist |
| `AiUnavailableException` | 503 | `AI_UNAVAILABLE` | AI provider timeout/failure |

All domain exceptions are caught by `GlobalExceptionFilter` and returned as `{ code, message, details? }`.

### Layering Enforcement

```
Controller (HTTP only)
    → Service (business logic only)
        → Repository (DB only)
        → External service (AI, NotebookLM) — stubs
```

- Controllers have NO business logic
- Services have NO HTTP concerns and NO direct DB access
- Repositories have NO business logic
- Cross-module DB access is forbidden (each module uses its own repos or global DatabaseModule)

### Module Wiring

| Module | Controller | Service | Dependencies |
|---|---|---|---|
| `AuthModule` | AuthController | AuthService, AuthPolicy | AuthRepository, JwtModule |
| `StudentModule` | StudentController | StudentService | StudentRepository, ActivityRepository, ResponseRepository |
| `ActivitiesModule` | (Sprint 3) | ActivitiesService, GradingService, DoubtService | ActivityRepo, QuestionRepo, ResponseRepo, DoubtRepo, StudentRepo |
| `AttendanceModule` | (Sprint 5) | AttendanceService | AttendanceRepository, StudentRepository |

---

## Files Created

| File | Purpose |
|---|---|
| `src/common/exceptions/domain.exceptions.ts` | All domain exception classes |
| `src/modules/student/student.service.ts` | Today's plan, profile, sync status |
| `src/modules/activities/activities.service.ts` | Activity lifecycle (get, submit, pause, results) |
| `src/modules/activities/grading.service.ts` | Deterministic + AI grading rules |
| `src/modules/activities/doubt.service.ts` | Doubt threads with AI stub |
| `src/modules/attendance/attendance.service.ts` | Attendance summary + calendar |
| `src/modules/student/student.module.ts` | **Modified** — wired StudentService |
| `src/modules/activities/activities.module.ts` | **Modified** — wired all services |
| `src/modules/attendance/attendance.module.ts` | **Modified** — wired AttendanceService |

---

## Verification

| Test | Result |
|---|---|
| Server starts with all modules initialized | Pass |
| Auth flow (login, JWT, protected route) works end-to-end with TypeORM | Pass |
| Health check returns 200 | Pass |
| Invalid token returns 401 with domain error code | Pass |
| OpenAPI docs accessible at /api/docs | Pass |
| TypeScript build clean (zero errors) | Pass |
