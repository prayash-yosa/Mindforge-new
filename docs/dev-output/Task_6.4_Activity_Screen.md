# Task 6.4 — Activity Screen

**Sprint**: 6 — Client: Login, Home, Activity, Results  
**Status**: Done  
**Completed**: 2026-02-18  
**Estimate**: 3 SP

---

## Checklist

- [x] Route `/activity/:type/:id`
- [x] Load activity + questions
- [x] Question display, answer input, Check Answer
- [x] Progress bar
- [x] Correct/incorrect states
- [x] AI feedback panel
- [x] Pause saves progress
- [x] Accessibility

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `client/src/screens/ActivityScreen.tsx` | Main activity screen component |

### Flow States

| State | Description |
|-------|-------------|
| loading | Fetching activity and questions |
| question | Displaying current question with answer input |
| submitting | Check Answer in progress |
| correct/incorrect | Feedback after answer check |
| complete | All questions answered |

### Features

- **MCQ**: Selectable option buttons
- **Text**: Textarea for free-form answers
- **On incorrect**: AI feedback panel with progressive levels (Get a Hint → More Help)
- **AI thinking indicator**: Shown during feedback fetch
- **Pause button**: Calls `POST /pause` and navigates home
- **Auto-advance**: To next unanswered question
- **Complete state**: "Activity Complete!" with View Results + Back to Home

### Key Decisions

- **Local question.answered tracking**: Client-side state for answered questions
- **Auto-advance to next unanswered**: Skip already-answered questions
- **Feedback panel fetches on-demand**: When user requests hint or more help

---

## Verification

- Full activity flow: MCQ and text questions
- Incorrect feedback with progressive hints
- Pause saves and navigates home
- Complete state navigation to results
