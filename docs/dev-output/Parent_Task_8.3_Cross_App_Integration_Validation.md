# Task 8.3 — Cross-App Integration Validation

**Sprint**: 8 — Hardening & Validation  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Integration  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Cross-check: Parent attendance vs Teacher dashboard (same student). Cross-check: Parent progress vs Teacher test results. Document aggregation rules. Fix discrepancies.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Attendance cross-check | **Done** | Same Teacher calendar API |
| 2 | Progress cross-check | **Done** | Same Teacher performance API |
| 3 | Aggregation rules doc | **Done** | Parent_Integration_Aggregation_Rules.md |
| 4 | Integration health | **Done** | GET /v1/health/integration |
