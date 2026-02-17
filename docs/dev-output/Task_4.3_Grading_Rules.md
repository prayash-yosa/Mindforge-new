# Task 4.3 — Deterministic and AI-Assisted Grading Rules

**Sprint**: 4 — AI Integration & Grading
**Status**: Done
**Date**: 2026-02-16
**Estimate**: 2 SP

---

## Checklist

- [x] MCQs and simple types use deterministic evaluation; open-ended may use AI with rubric.
- [x] Rubric and correct answer stored; score and feedback level stored per response.
- [x] No PII in AI grading prompts; pseudonymous ID and syllabus scope only.

---

## Implementation

### GradingService (`src/modules/activities/grading.service.ts`)

**Deterministic grading** (MCQ, TRUE_FALSE, FILL_BLANK):
- Case-insensitive, trimmed string comparison
- Score: 100 (correct) or 0 (incorrect)
- Feedback: "Correct!" or "Incorrect."

**AI-assisted grading** (SHORT_ANSWER, LONG_ANSWER):
- Builds prompt via `PromptBuilderService.buildGradingPrompt()`
- Includes: syllabusSubject, syllabusChapter, syllabusTopic, questionContent, rubric
- AI responds with JSON: `{isCorrect, score, feedback}`
- Score clamped to 0–100
- On AI failure: graceful "pending" status with user-friendly message
- On no API key: returns pending immediately (no network call)

**Integration**:
- `ActivitiesService.submitAnswer()` delegates to `GradingService.grade()`
- AI grading results stored: `aiFeedback` + `aiConversationRef` on response entity
- Rubric available on `QuestionEntity.rubric` column

**Seeder updated**: Added a `SHORT_ANSWER` question with rubric to the Science quiz for testing.

---

## Files Modified

| File | Action |
|------|--------|
| `src/modules/activities/grading.service.ts` | Rewritten: deterministic + AI-assisted with AiProviderService |
| `src/modules/activities/activities.service.ts` | Updated: delegates grading to GradingService |
| `src/modules/activities/doubt.service.ts` | Updated: uses AiProviderService instead of stub |
| `src/database/repositories/question.repository.ts` | Updated: `findById` loads syllabus relation |
| `src/database/seeders/dev-seeder.service.ts` | Updated: added SHORT_ANSWER question with rubric |

---

## Verification

```
MCQ "Friction"        → deterministic: isCorrect=true, score=100, gradingMethod=deterministic
TRUE_FALSE "true"     → deterministic: isCorrect=true, score=100
SHORT_ANSWER (no key) → pending: isCorrect=null, score=null, feedback="AI grading will be available..."
Results endpoint      → score=67 (2/3 correct, short answer pending)
```
