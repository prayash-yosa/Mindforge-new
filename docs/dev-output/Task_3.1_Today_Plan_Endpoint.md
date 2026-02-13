# Task 3.1 — GET /student/today (Today's Plan)

**Sprint**: 3 — Today's Plan & Activities API
**Status**: Done
**Date**: 2026-02-13
**Estimate**: 2 SP

---

## Checklist

- [x] `GET /v1/student/today` returns today's tasks (homework, quiz, gap-bridge), progress summary; auth required; scoped by student_id.
- [x] Response shape supports UX: task cards (title, type, syllabus ref, question count, estimated time), completed today, progress numerator/denominator.
- [x] Empty state supported (e.g. no tasks); consistent JSON and HTTP status.

---

## Implementation

### Endpoint: `GET /v1/student/today`

**Controller**: `StudentController.getToday()` — HTTP-only, delegates to `StudentService.getTodayPlan()`.

**Response shape**:
```json
{
  "student": { "id": "...", "displayName": "Aarav", "class": "8", "board": "CBSE" },
  "tasks": [
    {
      "id": "uuid",
      "type": "homework",
      "title": "Ch 3 — Linear Equations in One Variable",
      "syllabusRef": { "subject": "Mathematics", "chapter": "Linear Equations", "topic": "One Variable" },
      "questionCount": 3,
      "estimatedMinutes": 15,
      "status": "pending",
      "score": null
    }
  ],
  "completedToday": 0,
  "totalToday": 3,
  "progressPercent": 0
}
```

**Empty state**: returns `tasks: []` with `completedToday: 0`, `totalToday: 0`, `progressPercent: 0`.

### Additional Endpoint: `GET /v1/student/profile`

Returns student profile with `totalActivitiesCompleted` count.

### Dev Data Seeder

`DevSeederService` (runs `OnApplicationBootstrap` in dev only):
- 6 syllabus entries (Class 8 CBSE Math + Science)
- 3 activities (homework + quiz + gap_bridge) with 5 questions
- 10 attendance records
- Idempotent: skips if already seeded

### Coding Standards Applied

- No TODOs or dead code
- Removed last remaining TODO from `AuthorizationGuard`
- Explicit edge cases: student not found → 404, empty tasks → valid empty response
- Domain exceptions only: `StudentNotFoundException`
- Deterministic behavior: same input → same output

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/modules/student/student.controller.ts` | Updated: added `getToday()` and `getProfile()` endpoints |
| `src/modules/activities/activities.controller.ts` | Created: all activity endpoints |
| `src/modules/activities/activities.module.ts` | Updated: registered controller |
| `src/database/seeders/dev-seeder.service.ts` | Created: development data seeder |
| `src/database/seeders/seeder.module.ts` | Created: seeder module |
| `src/app.module.ts` | Updated: imported SeederModule |

---

## Verification

```
GET /v1/student/today → 200: tasks + progress (3 tasks, 0 completed)
GET /v1/student/today (no token) → 401 UNAUTHORIZED
GET /v1/student/profile → 200: student profile + totalActivitiesCompleted
```
