# Task 2.2 — Data Access Layer (Repositories/DAOs)

| Field | Value |
|---|---|
| **Sprint** | 2 — Data & Backend Core |
| **Task** | 2.2 |
| **Title** | Data access layer (repositories/DAOs) |
| **Type** | Feature |
| **Stack** | TypeORM Repositories |
| **Status** | Done |
| **Started** | 2026-02-12 |
| **Completed** | 2026-02-12 |
| **Dependencies** | Task 2.1 |

---

## Checklist

- [x] CRUD and queries for students, sessions, syllabus_metadata, activities, questions, responses, attendance, doubt_threads
- [x] All queries scoped by student_id or tenant where applicable; parameterized; no raw concatenation
- [x] Transient DB errors handled with retry/backoff; duplicate/key errors mapped to 409 or domain message

---

## Implementation Details

### Repositories (10 total)

| Repository | Entity | Key Methods |
|---|---|---|
| `StudentRepository` | students | findById, findByExternalId, findByClassAndBoard, create, update |
| `SyllabusRepository` | syllabus_metadata | findByClassAndBoard, getSubjects, getChapters, getTopics |
| `TeachingFeedRepository` | teaching_feed | findByClassAndDate, findRecentByClass |
| `ActivityRepository` | activities | findByIdForStudent, findTodayForStudent, findByStatusForStudent, countCompleted |
| `QuestionRepository` | questions | findById, findByActivityId, createMany |
| `ResponseRepository` | responses | findByStudentAndActivity, findByStudentAndQuestion, countCorrectForActivity |
| `AttendanceRepository` | attendance | findByStudentAndDateRange, getSummaryForStudent, createMany |
| `DoubtRepository` | doubt_threads + messages | findThreadsByStudent, findThreadByIdForStudent, createThread, addMessage |
| `SessionRepository` | sessions | findActiveByStudent, revokeAllForStudent, deleteExpired |
| `AuditLogRepository` | audit_log | create, findByAction, findByStudent |

### BaseRepository — Error Handling

All repositories extend `BaseRepository` which provides `withErrorHandling()`:

- **Transient errors** (deadlock, connection failure, serialization): Retry up to 3 times with exponential backoff (200ms → 400ms → 800ms)
- **Duplicate/unique constraint**: Mapped to `409 ConflictException` with `DUPLICATE_ENTRY` code
- **All retries exhausted**: `503 ServiceUnavailableException` with `DATABASE_UNAVAILABLE` code
- **All queries**: Parameterized via TypeORM (no raw SQL concatenation)

### Student Scoping

All activity, response, attendance, and doubt queries include `studentId` in their WHERE clause — enforced at the repository level. No cross-student access possible.

### AuthRepository Migration

The Sprint 1 in-memory `AuthRepository` now delegates to:
- `StudentRepository` for student CRUD
- `SessionRepository` for session management
- Lockout state remains in-memory (migrated to Redis in Task 8.3)

### AuditService Persistence

`AuditService.log()` now persists to the `audit_log` table via `AuditLogRepository` (best-effort — never blocks the caller on DB failure).

---

## Files Created/Modified

| File | Purpose |
|---|---|
| `src/database/repositories/base.repository.ts` | Shared error handling (retry, conflict mapping) |
| `src/database/repositories/*.ts` (10 files) | Repository implementations |
| `src/database/repositories/index.ts` | Barrel export |
| `src/modules/auth/auth.repository.ts` | **Modified** — now uses TypeORM repos |
| `src/shared/audit/audit.service.ts` | **Modified** — persists to audit_log table |
| `src/database/database.module.ts` | **Modified** — registers and exports all repos globally |

---

## Verification

| Test | Result |
|---|---|
| Login via TypeORM-backed StudentRepository | Pass — MPIN hash compare works |
| Session persisted to sessions table | Pass |
| Audit log persisted to audit_log table | Pass |
| Lockout status via in-memory (pending Redis) | Pass |
| Protected route with JWT still works | Pass |
| TypeScript build clean | Pass |
