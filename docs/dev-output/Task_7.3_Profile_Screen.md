# Task 7.3 — Profile Screen and Logout

**Sprint**: 7 — Client: Attendance, Doubts, Profile & Sync  
**Status**: Done  
**Date**: 2026-02-19  

## Summary

Built the Profile screen at `/profile` with student details, progress overview, quick links, and logout with confirmation.

## Implementation

### Route & Data Flow
- **Route**: `/profile` (protected)
- **API**: `GET /v1/student/profile`
- **Response type**: `StudentProfile` (added to `api/types.ts`)

### Features
1. **Info Card** — Avatar (initial letter, gradient background), display name, Class/Board detail chips, school name.
2. **Progress Overview** — Per activity type: label, mini progress bar (completed/total), average score. Uses `progressOverview[]` from API.
3. **Quick Links** — "View Attendance" and "My Doubts" with chevron-right icons, navigating to respective routes.
4. **Logout** — Two-step: "Log Out" button → confirmation card ("Are you sure?") → [Cancel] [Log Out]. Logout clears token + sessionStorage and navigates to `/login`.

### Key Implementation Details
- `ProgressCard` calculates completion percentage from total/completed
- `DetailChip` for clean Class/Board display
- Confirmation dialog prevents accidental logout
- Uses `useAuth().logout()` from AuthContext

## Files

| File | Action |
|------|--------|
| `client/src/screens/ProfileScreen.tsx` | Created |
| `client/src/api/types.ts` | Modified — added `StudentProfile` |
| `client/src/App.tsx` | Modified — routed `/profile` |
