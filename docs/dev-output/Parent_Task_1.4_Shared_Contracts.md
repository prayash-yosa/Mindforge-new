# Task 1.4 — Shared Contracts for Parent APIs in @mindforge/shared

**Sprint**: 1 — Workspace Integration & Parent Service Foundation  
**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Shared  
**App**: Parent  
**Status**: Done  
**Estimate**: 1 SP

---

## Summary

Added Parent-related DTOs (ParentProfileDto, ParentDashboardDto, ChildProgressTestDto, ChildAttendanceSummaryDto, ChildFeesSummaryDto, PayInfoDto) under `shared/src/interfaces/parent`. Exported from shared index.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Parent DTOs in shared | **Done** | parent.interfaces.ts, parent/index.ts |
| 2 | Parent role and claims | **Done** | JWT includes linkedStudentId |
| 3 | Frontend and backend consume | **Done** | Export from shared/interfaces |

---

## DTOs Added

- ParentProfileDto
- ChildSummaryDto
- ParentDashboardDto
- ChildProgressTestDto
- ChildAttendanceSummaryDto
- ChildFeesSummaryDto
- PayInfoDto
