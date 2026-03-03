# Task 8.2 — Security Review

**Sprint**: 8 — Hardening & Validation  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Parent Backend — Security  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

All APIs read-only. Filter by linkedStudentId. No client-supplied studentId. RBAC for Parent role in gateway. Security review checklist documented.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Read-only APIs | **Done** | No write endpoints for child data |
| 2 | linkedStudentId scoping | **Done** | All child APIs use JWT |
| 3 | No client studentId | **Done** | Verified in code |
| 4 | RBAC | **Done** | Gateway + AuthGuard |
| 5 | Security checklist | **Done** | Parent_Security_Review_Checklist.md |
