# Task 7.2 — Doubts Screen (Screen 6) with Syllabus Context Selector

**Sprint**: 7 — Client: Attendance, Doubts, Profile & Sync  
**Status**: Done  
**Date**: 2026-02-19  

## Summary

Built the Doubts screen at `/doubts` with a thread-based chat interface and cascading syllabus context selector.

## Implementation

### Route & Data Flow
- **Route**: `/doubts` (protected)
- **APIs**: `GET /v1/student/doubts`, `GET /v1/student/doubts/:threadId`, `POST /v1/student/doubts`, `GET /v1/student/syllabus/tree`
- **Response types**: `DoubtThread`, `DoubtThreadDetail`, `SyllabusTree` (added to `api/types.ts`)

### Features
1. **Syllabus Context Bar** — Shows current Subject · Chapter · Topic. "Change" toggles a cascading picker (Subject → Chapter → Topic dropdowns).
2. **Thread List View** — Lists existing doubt threads with title, resolved badge, and syllabus meta. "Ask a Doubt" button.
3. **Chat View** — Student (right, sage-light) and AI (left, white) bubbles. Auto-scroll. "Thinking..." indicator while AI responds.
4. **Context Inheritance** — Replies carry the current syllabus context. Changing context does not clear the thread.
5. **States**: Loading (skeleton), empty ("Ask your first question!"), error (retry).

### Key Implementation Details
- Parallel fetch on mount: threads + syllabus tree (fetched once, cached in state)
- `CtxSelect` component for each dropdown level
- Enter-to-send + Send button with SVG icon
- Back navigation returns to thread list and refreshes

## Files

| File | Action |
|------|--------|
| `client/src/screens/DoubtsScreen.tsx` | Created |
| `client/src/api/types.ts` | Modified — added `DoubtThread`, `DoubtThreadDetail`, `SyllabusTree` |
| `client/src/App.tsx` | Modified — routed `/doubts` |
