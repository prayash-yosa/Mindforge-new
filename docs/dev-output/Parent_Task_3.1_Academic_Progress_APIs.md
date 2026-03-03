# Task 3.1 — Academic Progress Read APIs

**Sprint**: 3 — Read APIs: Progress, Attendance, Fees, Pay Info  
**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Backend — Progress  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Implemented `GET /v1/parent/child/progress/tests` and `GET /v1/parent/child/progress/summary`. Integration with Teacher cross-app API: `GET /v1/cross-app/classes`, `GET /v1/cross-app/performance/:classId`, `GET /v1/cross-app/performance/student/:studentId/test/:testId`. Resolves `linkedStudentId` → `studentExternalId` from parent_accounts for Teacher API calls.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | GET /v1/parent/child/progress/tests | **Done** | ProgressController, query: subject?, from?, to?, page?, limit? |
| 2 | GET /v1/parent/child/progress/summary | **Done** | Line/bar series for charts |
| 3 | Teacher cross-app integration | **Done** | TeacherSyncService fetches classes, performance, test results |
| 4 | Resolve linkedStudentId → externalId | **Done** | parent_accounts.student_external_id |
| 5 | Scope by linkedStudentId from JWT | **Done** | Parent decorator; no client-supplied studentId |

---

## API

**GET /v1/parent/child/progress/tests** (Auth: Bearer)

Query: `subject?`, `from?`, `to?`, `page?`, `limit?`

Response: `{ success, data: { tests: ChildProgressTestDto[], total } }`

**GET /v1/parent/child/progress/summary** (Auth: Bearer)

Query: `from?`, `to?`

Response: `{ success, data: { series } }`

---

## Config

`TEACHER_SERVICE_URL=http://localhost:3003`
