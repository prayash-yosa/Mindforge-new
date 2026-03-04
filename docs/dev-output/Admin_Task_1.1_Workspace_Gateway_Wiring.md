# Task 1.1 — Wire Admin App into Workspace & Gateway Routing

**Sprint**: 1 — Workspace Integration & Admin Service Foundation  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Workspace / Gateway  
**App**: Admin  
**Status**: Done  
**Estimate**: 2 SP

---

## Summary

Admin frontend and backend are wired into the Mindforge monorepo. Vite proxy `/v1` and `/health` to Admin backend (port 3004). Dev commands documented in `apps/admin/README.md`.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | `apps/admin/frontend` and `apps/admin/backend` in workspace | **Done** | Root `package.json` globs cover Admin |
| 2 | Admin routes in gateway with role = admin | **Done** | Gateway SERVICE_MAP includes `/api/admin` → `:3004` |
| 3 | JWT + RBAC path for Admin role | **Done** | Gateway RBAC allows Admin role |
| 4 | Local dev commands documented | **Done** | `apps/admin/README.md` |

---

## Port Allocation

| Service | Port |
|---------|------|
| Gateway | 3000 |
| Student Backend | 3001 |
| Parent Backend | 3002 |
| Teacher Backend | 3003 |
| **Admin Backend** | **3004** |
| Admin Frontend | 5176 |

---

## Verification

| Test | Expected | Result |
|------|----------|--------|
| Admin backend in workspaces | Listed as `@mindforge/admin-backend` | **Pass** |
| Vite proxy /v1 | `/v1` → `http://localhost:3004` | **Pass** |
| RBAC allows Admin role | Admin can access `/api/admin/*` | **Pass** |
