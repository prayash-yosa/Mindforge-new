# Task 2.1 — Database Schema and Migrations

| Field | Value |
|---|---|
| **Sprint** | 2 — Data & Backend Core |
| **Task** | 2.1 |
| **Title** | Database schema and migrations |
| **Type** | Hardening |
| **Stack** | TypeORM + PostgreSQL (prod) / better-sqlite3 (dev) |
| **Status** | Done |
| **Started** | 2026-02-12 |
| **Completed** | 2026-02-12 |

---

## Checklist

- [x] Tables: students, syllabus_metadata, teaching_feed, activities, questions, responses, attendance, doubt_threads, sessions, audit_log per architecture §5.1
- [x] Indexes on student_id, activity_id, date (attendance), syllabus keys
- [x] Migrations versioned and idempotent; applied via CI/deploy
- [x] No direct DB access from business layer; only via data access layer

---

## Implementation Details

### Technology

- **TypeORM** for ORM and migrations
- **PostgreSQL** driver (`pg`) for production
- **better-sqlite3** for development (no external DB needed)
- Configuration via `ConfigService` — auto-detects environment

### Entities (11 total)

| Entity | Table | Key Fields |
|---|---|---|
| `StudentEntity` | `students` | id, external_id, display_name, class, board, school, mpin_hash, consent flags |
| `SyllabusMetadataEntity` | `syllabus_metadata` | class, board, subject, chapter, topic, sort_order |
| `TeachingFeedEntity` | `teaching_feed` | class, date, summary, key_points, source_ref |
| `ActivityEntity` | `activities` | student_id, type (homework/quiz/test/gap_bridge), syllabus_id, status, score |
| `QuestionEntity` | `questions` | activity_id, type (mcq/short/long/tf/fill), content, options, correct_answer, rubric |
| `ResponseEntity` | `responses` | student_id, activity_id, question_id, answer, is_correct, score, feedback_level |
| `AttendanceEntity` | `attendance` | student_id, date, status (present/absent/late/excused), source_label |
| `DoubtThreadEntity` | `doubt_threads` | student_id, syllabus context (class/subject/chapter/topic), is_resolved |
| `DoubtMessageEntity` | `doubt_messages` | thread_id, role (student/ai/system), content, ai_model |
| `SessionEntity` | `sessions` | student_id, token, device_info, expires_at, is_revoked |
| `AuditLogEntity` | `audit_log` | request_id, action, student_id, ip_address, metadata |

### Indexes

- `students`: external_id (unique), class
- `syllabus_metadata`: (class, board, subject), (class, board, subject, chapter)
- `teaching_feed`: (class, date), date
- `activities`: student_id, (student_id, status), (student_id, type)
- `questions`: activity_id
- `responses`: student_id, (student_id, activity_id), (student_id, question_id)
- `attendance`: student_id, (student_id, date), date
- `doubt_threads`: student_id
- `doubt_messages`: thread_id
- `sessions`: student_id
- `audit_log`: action, student_id, created_at

### Migration

File: `src/database/migrations/20260211_001_initial_schema.ts`

- Class: `InitialSchema20260211001`
- Idempotent: uses `createTable(table, true)` — IF NOT EXISTS
- Full `down()` method drops tables in reverse dependency order
- Production: `migrationsRun: true` auto-runs pending migrations on startup

### DatabaseModule

- Dual mode: PostgreSQL (when `DATABASE_URL` or `isProduction`) / SQLite (dev default)
- Dev: `synchronize: true`, SQLite in-memory
- Production: `synchronize: false`, migrations only, `retryAttempts: 3`

---

## Files Created

| File | Purpose |
|---|---|
| `src/database/database.module.ts` | TypeORM configuration module |
| `src/database/entities/*.ts` (11 files) | Entity definitions |
| `src/database/entities/index.ts` | Barrel export |
| `src/database/data-source.ts` | CLI migration data source |
| `src/database/migrations/20260211_001_initial_schema.ts` | Versioned migration |
| `src/config/configuration.ts` | Added database config section |
| `.env.example` | Added DB connection variables |

---

## Verification

| Test | Result |
|---|---|
| Server starts with SQLite in-memory | Pass — all 11 tables created |
| Test student seeded via TypeORM | Pass — UUID auto-generated |
| Auth flow works (login → JWT → protected route) | Pass |
| No TypeScript build errors | Pass |
