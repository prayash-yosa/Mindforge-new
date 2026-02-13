# Task 3.2 — GET /student/activities/:type/:id and POST pause

**Sprint**: 3 — Today's Plan & Activities API
**Status**: Done
**Date**: 2026-02-13
**Estimate**: 2 SP

---

## Checklist

- [x] `GET /v1/student/activities/:type/:id` returns activity metadata and questions; auth; scoped by student_id.
- [x] `POST /v1/student/activities/:type/:id/pause` saves progress and marks pause; client can resume later.
- [x] Types: homework, quiz, test, gap_bridge; 404 if not found or not assigned to student.

---

## Implementation

### GET /v1/student/activities/:type/:id

**Controller**: `ActivitiesController.getActivity()` — validates path params, delegates to `ActivitiesService`.

**Response shape**:
```json
{
  "id": "uuid",
  "type": "homework",
  "title": "Ch 3 — Linear Equations",
  "status": "in_progress",
  "questionCount": 3,
  "estimatedMinutes": 15,
  "syllabusRef": { "subject": "Mathematics", "chapter": "Linear Equations", "topic": "One Variable" },
  "questions": [
    {
      "id": "uuid",
      "type": "mcq",
      "content": "Solve: 2x + 5 = 13. What is x?",
      "options": ["2", "3", "4", "5"],
      "difficulty": 2,
      "sortOrder": 1,
      "answered": false
    }
  ],
  "answeredCount": 0
}
```

**Security**: Correct answers are never exposed to the client.

**Status transitions**: `PENDING → IN_PROGRESS` on first access.

### POST /v1/student/activities/:type/:id/pause

Returns `{ status: "paused", activityId: "uuid" }`.
No-op if activity is already completed.

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/modules/activities/activities.controller.ts` | Created: `getActivity()`, `pauseActivity()` |
| `src/modules/activities/dto/activity-params.dto.ts` | Created: path param validation |
| `src/modules/activities/activities.service.ts` | Updated: enhanced `getActivity()`, `pauseActivity()` |

---

## Verification

```
GET /v1/student/activities/homework/:id → 200: activity with 3 questions
GET /v1/student/activities/homework/00000000-... → 404 NOT_FOUND
POST /v1/student/activities/quiz/:id/pause → 200: { status: "paused" }
GET /v1/student/today → quiz now shows "paused" status
```
