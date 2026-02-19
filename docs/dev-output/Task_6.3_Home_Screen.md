# Task 6.3 — Home Screen

**Sprint**: 6 — Client: Login, Home, Activity, Results  
**Status**: Done  
**Completed**: 2026-02-18  
**Estimate**: 2 SP

---

## Checklist

- [x] Route `/home`
- [x] `GET /student/today` integration
- [x] Greeting, progress bar, task cards, bottom nav
- [x] States: loading, default, empty, error

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `client/src/screens/HomeScreen.tsx` | Main home screen component |

### Features

- **Time-based greeting**: Morning/Afternoon/Evening based on time of day
- **Progress card**: Percent bar + X of Y tasks completed
- **Task cards**: type badge, status badge (color-coded), title, syllabusRef, questionCount, estimatedMinutes, score
- **Empty state**: "All caught up!" with emoji
- **Error state**: Try Again button
- **BottomNav**: Home, Attendance, Doubts, Profile

### Key Decisions

- **Completed tasks**: Navigate to `/results/:type/:id`
- **Active tasks**: Navigate to `/activity/:type/:id`

---

## Verification

- Manual load of home screen with data
- Empty state when no tasks
- Error state with retry
- Navigation from task cards to correct routes
