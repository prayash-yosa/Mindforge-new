# Task 3.3 — POST /student/activities/:type/:id/respond (Submit Answer, Deterministic Grading)

**Sprint**: 3 — Today's Plan & Activities API
**Status**: Done
**Date**: 2026-02-13
**Estimate**: 3 SP

---

## Checklist

- [x] `POST /v1/student/activities/:type/:id/respond` accepts questionId, answer, optional requestFeedbackLevel.
- [x] Business layer evaluates answer (deterministic for MCQs and simple types); persists response; returns correct/incorrect and next question or completion.
- [x] If requestFeedbackLevel present, returns placeholder (AI feedback deferred to Task 4.x).
- [x] Progress and attempt stored; idempotency considered for duplicate submit.

---

## Implementation

### POST /v1/student/activities/:type/:id/respond

**DTO**: `RespondDto` — validates `questionId` (UUID), `answer` (non-empty, max 10000 chars), optional `requestFeedbackLevel` (enum: none, hint, approach, concept, solution).

**Grading logic (deterministic)**:
- MCQ / TRUE_FALSE / FILL_BLANK: case-insensitive string comparison against `correctAnswer`
- SHORT_ANSWER / LONG_ANSWER: `isCorrect = null`, `score = null` (AI grading in Sprint 4)

**Response shape**:
```json
{
  "questionId": "uuid",
  "isCorrect": true,
  "score": 100,
  "feedback": "Correct!",
  "feedbackLevel": "none",
  "isComplete": false,
  "nextQuestionId": "uuid-of-next"
}
```

**Idempotency**: Re-submitting for an already-answered question returns the existing result without creating a duplicate response.

**Auto-completion**: When all questions are answered, the activity is auto-marked as `COMPLETED` with an overall score computed as `(correct / total) * 100`.

**Error cases**:
- 404 `ACTIVITY_NOT_FOUND` — activity doesn't exist or not assigned to student
- 404 `QUESTION_NOT_FOUND` — question doesn't belong to activity
- 409 `ACTIVITY_ALREADY_COMPLETED` — cannot submit to a completed activity
- 400 `VALIDATION_ERROR` — invalid DTO fields

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/modules/activities/dto/respond.dto.ts` | Created: DTO with class-validator |
| `src/modules/activities/activities.service.ts` | Updated: idempotency, auto-complete, nextQuestionId, feedbackLevel |
| `src/modules/activities/activities.controller.ts` | Updated: `respond()` endpoint |

---

## Verification

```
POST respond (Q1, correct answer "4") → 200: isCorrect=true, score=100, nextQuestionId=Q2
POST respond (Q2, wrong answer "5")   → 200: isCorrect=false, score=0, nextQuestionId=Q3
POST respond (Q1, duplicate)          → 200: returns existing result (idempotent)
POST respond (Q3, correct answer "6") → 200: isComplete=true, nextQuestionId=null
POST respond (Q1, after completion)   → 409: ACTIVITY_ALREADY_COMPLETED
POST respond (invalid DTO)            → 400: VALIDATION_ERROR with details
```
