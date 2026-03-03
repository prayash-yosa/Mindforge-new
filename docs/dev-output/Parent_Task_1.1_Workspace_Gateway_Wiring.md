# Task 1.1 — Wire Parent App into Workspace & Gateway Routing

**Sprint**: 1 — Workspace Integration & Parent Service Foundation  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Workspace / Gateway  
**App**: Parent  
**Status**: Done  
**Estimate**: 2 SP

---

## Summary

Parent frontend and backend are wired into the Mindforge monorepo. The workspace globs `apps/*/frontend` and `apps/*/backend` already include Parent. The gateway maps `/api/parent` to Parent backend (port 3002) with RBAC for `role = parent`.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | `apps/parent/frontend` and `apps/parent/backend` in workspace | **Done** | Root `package.json` globs cover Parent |
| 2 | Parent routes in gateway with role = parent | **Done** | `DEFAULT_ROUTE_RBAC` includes `/api/parent` → `[UserRole.PARENT]` |
| 3 | JWT + RBAC path for Parent role | **Done** | Gateway RBAC allows Parent role | 
| 4 | Local dev commands documented | **Done** | `npm run dev` from root, or `cd apps/parent/backend && npm run start:dev` |

---

## Port Allocation

| Service | Port |
|---------|------|
| Gateway | 3000 |
| Student Backend | 3001 |
| **Parent Backend** | **3002** |
| Teacher Backend | 3003 |
| Parent Frontend | 5174 |

---

## Verification

| Test | Expected | Result |
|------|----------|--------|
| Parent backend in workspaces | Listed as `@mindforge/parent-backend` | **Pass** |
| Gateway SERVICE_MAP | `/api/parent` → `http://localhost:3002` | **Pass** |
| RBAC allows Parent role | Parent can access `/api/parent/*` | **Pass** |
