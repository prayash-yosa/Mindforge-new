# Task 2.3 — Parent Profile & Parent↔Student Linkage

**Sprint**: 2 — Parent Auth & Linkage  
**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Backend — Profile  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Implemented `GET /v1/parent/profile` and `GET /v1/parent/auth/me` returning parent name, mobile, relationship, status, and child summary (name, class, section) based on linkedStudentId from JWT. All child-data APIs use linkedStudentId from token; never client-supplied.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | GET /v1/parent/profile | **Done** | ProfileService.getProfile; Parent decorator |
| 2 | Exactly one linked_student_id per parent | **Done** | Schema enforced |
| 3 | JWT includes linkedStudentId | **Done** | AuthService.login payload |
| 4 | All child APIs use linkedStudentId from token | **Done** | Parent guard; no client studentId |

---

## API

**GET /v1/parent/profile** (Auth: Bearer)

Response: `{ success, data: { parent: {...}, child: {...} } }`

**GET /v1/parent/auth/me** (Auth: Bearer)

Response: Same as profile.
