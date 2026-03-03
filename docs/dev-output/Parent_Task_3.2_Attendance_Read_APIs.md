# Task 3.2 — Attendance Read APIs

**Sprint**: 3 — Read APIs: Progress, Attendance, Fees, Pay Info  
**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Backend — Attendance  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Implemented GET /v1/parent/child/attendance/weekly, monthly, yearly. Integration with Teacher cross-app attendance calendar. Merges attendance from all classes. Returns present/absent counts, percent, absent dates list.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | GET /v1/parent/child/attendance/weekly | **Done** | weekStart? query |
| 2 | GET /v1/parent/child/attendance/monthly | **Done** | month, year query |
| 3 | GET /v1/parent/child/attendance/yearly | **Done** | year query |
| 4 | Teacher calendar integration | **Done** | TeacherSyncService.fetchAttendance |
| 5 | Merge across classes | **Done** | Same pattern as Student TeacherSyncService |

---

## API

GET /v1/parent/child/attendance/weekly (Auth: Bearer) — Query: weekStart?

GET /v1/parent/child/attendance/monthly (Auth: Bearer) — Query: month, year

GET /v1/parent/child/attendance/yearly (Auth: Bearer) — Query: year

Response: { success, data: ChildAttendanceSummaryDto }
