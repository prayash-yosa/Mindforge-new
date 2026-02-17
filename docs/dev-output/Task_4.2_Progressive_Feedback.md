# Task 4.2 — GET /student/activities/:type/:id/feedback (Progressive Guidance)

**Sprint**: 4 — AI Integration & Grading
**Status**: Done
**Date**: 2026-02-16
**Estimate**: 3 SP

---

## Checklist

- [x] `GET /student/activities/:type/:id/feedback` returns next guidance level for current question; level tracked (1–4: Hint, Approach, Concept, Solution).
- [x] Business layer enforces level order; no skipping to solution unless allowed; response includes help level and content.
- [x] AI prompt includes syllabus context and question/attempt only; response persisted via data access; fallback on AI failure per Task 4.1.

---

## Implementation

### FeedbackService (`src/modules/activities/feedback.service.ts`)

**Level progression**: `Hint → Approach → Concept → Solution`

**Rules**:
- Auto-advances to next level if no `level` query param specified
- Monotonic: cannot go back to a lower level
- `maxLevelReached: true` when Solution is reached
- `nextLevel: null` at Solution

**Response shape**:
```json
{
  "questionId": "uuid",
  "level": "hint",
  "content": "Think about the key concepts in Types of Forces...",
  "fromAi": false,
  "nextLevel": "approach",
  "maxLevelReached": false
}
```

**Persistence**: Updates `feedbackLevel`, `aiFeedback`, `aiConversationRef` on the response entity.

**Fallback**: Static syllabus-aware hints per level when AI is unavailable.

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/modules/activities/feedback.service.ts` | Created: progressive feedback logic |
| `src/modules/activities/dto/feedback-query.dto.ts` | Created: query param validation |
| `src/modules/activities/activities.controller.ts` | Updated: added `/feedback` GET endpoint |
| `src/modules/activities/activities.module.ts` | Updated: registered FeedbackService |

---

## Verification

```
GET feedback (no level)       → 200: level=hint, nextLevel=approach
GET feedback (auto-advance)   → 200: level=approach, nextLevel=concept
GET feedback (level=concept)  → 200: level=concept, nextLevel=solution
GET feedback (level=solution) → 200: level=solution, maxLevelReached=true, nextLevel=null
GET feedback (unknown q)      → 404: QUESTION_NOT_FOUND
```
