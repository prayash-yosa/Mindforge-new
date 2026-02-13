# Task 3.4 — GET /student/results/:type/:id (Activity Results)

**Sprint**: 3 — Today's Plan & Activities API
**Status**: Done
**Date**: 2026-02-13
**Estimate**: 1 SP

---

## Checklist

- [x] `GET /v1/student/results/:type/:id` returns score, per-question breakdown (correct/incorrect), and suggested next activities; auth; scoped by student_id.
- [x] Response shape supports UX: score display, list of question results, suggested next task cards.

---

## Implementation

### GET /v1/student/results/:type/:id

**Response shape**:
```json
{
  "activityId": "uuid",
  "type": "homework",
  "title": "Ch 3 — Linear Equations in One Variable",
  "status": "completed",
  "totalQuestions": 3,
  "answeredQuestions": 3,
  "correctAnswers": 2,
  "score": 67,
  "breakdown": [
    { "questionId": "uuid", "isCorrect": true, "score": 100 },
    { "questionId": "uuid", "isCorrect": false, "score": 0 },
    { "questionId": "uuid", "isCorrect": true, "score": 100 }
  ],
  "suggestedNext": [
    { "type": "quiz", "title": "Practice quiz", "reason": "Good effort — practice more to master the topic." }
  ]
}
```

**Suggested next logic** (deterministic, based on score):
| Score Range | Suggestion |
|-------------|------------|
| < 60% | `gap_bridge`: "Review weak areas — score below 60%" |
| 60–89% | `quiz`: "Practice more to master the topic" |
| >= 90% | `homework`: "Excellent — move to next topic" |

**Edge cases**:
- Activity not found → 404
- No responses yet → `score: null`, `suggestedNext: []`

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/modules/activities/activities.controller.ts` | Updated: `getResult()` endpoint |
| `src/modules/activities/activities.service.ts` | Updated: `getResult()` with suggestedNext logic |

---

## Verification

```
GET /v1/student/results/homework/:id → 200: score=67, 2 correct / 3 total, suggested "Practice quiz"
GET /v1/student/results/homework/00000000-... → 404 ACTIVITY_NOT_FOUND
```
