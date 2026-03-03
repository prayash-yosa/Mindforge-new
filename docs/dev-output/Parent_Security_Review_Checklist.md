# Parent App — Security Review Checklist

**Sprint 8.2** | Security review: RBAC, data scoping, read-only guarantees

---

## Read-Only Guarantees

| Area | Status | Notes |
|------|--------|-------|
| All child-data APIs | **Enforced** | GET only; no POST/PUT/DELETE for progress, attendance, fees |
| Payment initiation | **N/A** | App does not process payments; Pay Info is informational |

---

## Data Scoping

| API | Scope | Implementation |
|-----|-------|----------------|
| GET /v1/parent/profile | parentId from JWT | @Parent('parentId') |
| GET /v1/parent/dashboard | parentId from JWT | DashboardService |
| GET /v1/parent/child/progress/* | parentId → studentExternalId | ProgressService.resolveExternalId |
| GET /v1/parent/child/attendance/* | parentId → studentExternalId | AttendanceService.resolveExternalId |
| GET /v1/parent/child/fees/* | No studentId | Config-driven; same for all |

---

## No Client-Supplied studentId

- **Rule**: All child data scoped by `linkedStudentId` from JWT
- **Implementation**: AuthGuard extracts `linkedStudentId`; Parent decorator provides `parentId`
- **Verification**: No route accepts `studentId` or `linkedStudentId` from query/body

---

## RBAC

- Gateway: `/api/parent` requires `role = parent`
- Backend: AuthGuard validates JWT; @Public() for login, health only
