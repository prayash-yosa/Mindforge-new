# Task 7.1 — Attendance Screen (Screen 5) — Calendar and Summary

**Sprint**: 7 — Client: Attendance, Doubts, Profile & Sync  
**Status**: Done  
**Date**: 2026-02-19  

## Summary

Built the Attendance screen at `/attendance` with period-based filtering, summary stats, and an interactive calendar grid.

## Implementation

### Route & Data Flow
- **Route**: `/attendance` (protected)
- **API**: `GET /v1/student/attendance?period={this_month|last_month|this_term}`
- **Response type**: `AttendanceResponse` (added to `api/types.ts`)

### Features
1. **Period Selector** — 3 toggle buttons: This Month, Last Month, This Term. Active state uses sage green fill.
2. **Summary Card** — 4-column layout: Present (green), Absent (red), Late (orange), Rate (sage dark). Large numerics.
3. **Calendar Grid** — 7-column CSS grid aligned to day-of-week. Day numbers rendered inside coloured circles based on attendance status. Null-padded for alignment.
4. **Legend** — Present, Absent, Late, No data color legend.
5. **States**: Loading (skeleton), error (retry button), empty ("No attendance data for this period").

### Key Implementation Details
- `buildCalendarGrid()` constructs a week-aligned grid from flat date array
- `formatLocal()` avoids timezone shift (consistent with backend fix from Sprint 5)
- Calendar cells use `T00:00:00` suffix to prevent Date parsing timezone issues

## Files

| File | Action |
|------|--------|
| `client/src/screens/AttendanceScreen.tsx` | Created |
| `client/src/api/types.ts` | Modified — added `AttendanceResponse` |
| `client/src/App.tsx` | Modified — routed `/attendance` |
