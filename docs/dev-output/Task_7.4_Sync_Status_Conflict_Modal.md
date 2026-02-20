# Task 7.4 — Sync Status and Conflict Modal

**Sprint**: 7 — Client: Attendance, Doubts, Profile & Sync  
**Status**: Done  
**Date**: 2026-02-19  

## Summary

Built the `SyncBanner` component for the Home screen that polls sync status and shows a conflict resolution modal.

## Implementation

### Data Flow
- **API**: `GET /v1/student/sync/status`
- **Response type**: `SyncStatus` (added to `api/types.ts`)
- **Polling**: Every 60 seconds via `setInterval`

### Features
1. **Status Banner** — Green dot + "All caught up!" when synced. Orange dot + "Sync conflict detected" on conflict.
2. **Conflict Modal** — Full-screen overlay with modal card: "Found newer progress on another device" + hint text. Two actions:
   - **Keep Current** — Dismisses modal.
   - **Use Latest** — Dismisses modal and reloads the page (fetches fresh data).
3. **Non-blocking** — Silent catch on poll failures. Banner hidden until first successful poll.

### Integration
- `SyncBanner` rendered at top of `HomeScreen` content area
- Cleanup: `clearInterval` on component unmount

## Files

| File | Action |
|------|--------|
| `client/src/components/SyncBanner.tsx` | Created |
| `client/src/screens/HomeScreen.tsx` | Modified — integrated `SyncBanner` |
| `client/src/api/types.ts` | Modified — added `SyncStatus` |

## Additional UI Improvements (Sprint 7)

### Bottom Navigation Icons
- Replaced emoji icons (🏠📅💬👤) with custom SVG stroke icons in `Icons.tsx`
- `HomeIcon`, `CalendarIcon`, `ChatIcon`, `UserIcon` — 24×24, stroke-based, `currentColor`
- No external font/CDN dependency

### Results Screen Score Circle
- Fixed `alignItems: 'baseline'` → `alignItems: 'center'` in `scoreCircle` style
- Percentage text now perfectly centered vertically and horizontally
