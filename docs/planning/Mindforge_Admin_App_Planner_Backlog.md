# Mindforge Admin App — Planner Backlog

**Artifact name**: Mindforge_Admin_App_Planner_Backlog  
**Role**: Planner / Scrum Master AI Agent  
**Date**: February 20, 2026  
**Mode**: Enterprise (V3) — admin control-plane (approvals & fees)

**Sources (no scope expansion)**:
- Architecture: `docs/architecture/admin/Mindforge_Admin_App_Architecture_v1.md`
- UX Spec: `docs/architecture/admin/Mindforge_Admin_App_UX_Design_Specification_v1.md`
- Workspace: `docs/architecture/workspace-architecture.md`

**Capacity**: 1 engineer = 8–10 SP/sprint · 20% buffer · AI work = minimal (mostly Non-AI)

---

## Plan: Mindforge Admin App — Release 1

### Buckets (Sprint / Epic)

| Bucket | Type | Focus |
|--------|------|--------|
| **Sprint 1** | Sprint | Workspace integration & Admin service foundation |
| **Sprint 2** | Sprint | User approval & account lifecycle |
| **Sprint 3** | Sprint | Fees configuration & payment info backend |
| **Sprint 4** | Sprint | Payment entry & fee ledger backend |
| **Sprint 5** | Sprint | Admin frontend — Shell, Dashboard & Users |
| **Sprint 6** | Sprint | Admin frontend — Fees & Payments |
| **Sprint 7** | Sprint | Admin frontend — Payment Info & Audit Logs |
| **Sprint 8** | Sprint | Hardening, observability & cross-app validation |

---

## Sprint 1 — Workspace Integration & Admin Service Foundation

**Capacity**: 10 SP (1 eng) · Buffer 20% → 8 SP target

---

### Task 1.1 — Wire Admin app into workspace & gateway routing

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Workspace / Gateway

**Notes**:
- **As a** platform team  
- **I want** the Admin frontend/backend wired into the monorepo and API gateway  
- **So that** Admin traffic flows via `services/gateway` and respects workspace rules.  
- **Dependencies**: Workspace architecture and tooling in place.  
- **Risks**: Misconfigured routing impacting other roles.

**Checklist**:
- [ ] Ensure `apps/admin/frontend` and `apps/admin/backend` are registered in root workspaces and Turborepo tasks.
- [ ] Add Admin routes in `services/gateway` with `role = admin` and routing to Admin backend port.
- [ ] Verify JWT + RBAC path in gateway for Admin role.
- [ ] Document local dev commands for Admin app (frontend + backend).

**Estimate**: 2 SP

---

### Task 1.2 — Admin backend skeleton (NestJS service)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Admin Backend

**Notes**:
- **As a** backend engineer  
- **I want** an Admin NestJS service skeleton with core modules  
- **So that** user approval, fees and payments features can be added coherently.  
- **Dependencies**: Task 1.1.  
- **Risks**: None.

**Checklist**:
- [ ] Create `apps/admin/backend` NestJS app with module layout matching architecture (User Management & Approval, Fee Configuration, Payment Entry & Ledger, Payment Info, Audit Trail, Integration).
- [ ] Implement basic health check and version endpoint.
- [ ] Configure DB connection for Admin service per workspace pattern.
- [ ] Ensure cross-app contracts are via `@mindforge/shared` only.

**Estimate**: 2 SP

---

### Task 1.3 — Admin DB schema & migrations (user approval, fees & payments)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Admin Backend — Data

**Notes**:
- **As a** system  
- **I want** versioned migrations for admin-owned entities  
- **So that** approvals, fees, payments and audit logs have a stable schema.  
- **Dependencies**: Task 1.2.  
- **Risks**: Schema misalignment with Student/Parent/Teacher expectations.

**Checklist**:
- [ ] Define and migrate tables for `user_accounts` (or integration with shared user table), `grade_fee_configs`, `extra_subject_fee_configs`, `fee_payments`, `student_fee_summary`, `payment_info_config`, `admin_audit_logs` as per architecture.
- [ ] Add indexes for common access patterns (by student_id, grade, academic_year, status, dates).
- [ ] Integrate migrations into CI/CD and local dev workflows.

**Estimate**: 3 SP

---

### Task 1.4 — Shared contracts for Admin APIs in @mindforge/shared

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Shared

**Notes**:
- **As a** cross-app integrator  
- **I want** Admin DTOs and enums in `@mindforge/shared`  
- **So that** Student/Teacher/Parent backends and the gateway can call Admin APIs without tight coupling.  
- **Dependencies**: Task 1.2.  
- **Risks**: Contract churn creating breaking changes.

**Checklist**:
- [ ] Add Admin-related DTOs (e.g., `AdminUserApprovalDto`, `AdminFeeConfigDto`, `AdminPaymentRecordDto`, `AdminPaymentInfoDto`) under `shared/src/interfaces/admin`.
- [ ] Expose relevant enums/constants such as `UserStatus`, fee/subject codes, and payment modes in `shared/src/constants`.
- [ ] Ensure Admin frontend and backend both consume these shared types.

**Estimate**: 1 SP

---

**Sprint 1 total**: 8 SP

---

## Sprint 2 — User Approval & Account Lifecycle

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 2.1 — User approval APIs (pending → active/disabled)

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Backend — User Management

**Notes**:
- **As an** admin  
- **I want** to approve or reject pending student/teacher/parent accounts  
- **So that** only authorised users can access the system.  
- **Dependencies**: Task 1.3.  
- **Risks**: Incorrect status transitions.

**Checklist**:
- [ ] Implement APIs to list pending users by role and status.
- [ ] Implement approve/reject/activate/deactivate endpoints that update `status` and write audit logs.
- [ ] Ensure business rules: only `PENDING_APPROVAL` can be approved; disabled users cannot log in.

**Estimate**: 3 SP

---

### Task 2.2 — Default MPIN and first-login change flagging

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Backend — User Management

**Notes**:
- **As an** admin  
- **I want** approved users to get a default MPIN and be forced to change it on first login  
- **So that** access is both simple and secure.  
- **Dependencies**: Task 2.1.  
- **Risks**: Weak default MPIN if flag not enforced downstream.

**Checklist**:
- [ ] On approval, set MPIN hash for default `000000` and `must_change_mpin_on_first_login = true`.
- [ ] Expose read API for other services to check `mustChangeMpinOnFirstLogin` and `status`.
- [ ] Coordinate with Student/Teacher/Parent auth flows (via shared contracts) to enforce first-login MPIN change.

**Estimate**: 3 SP

---

### Task 2.3 — User account status & audit logging

**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Admin Backend — Audit Trail

**Notes**:
- **As a** platform owner  
- **I want** all admin operations on user accounts to be audit-logged  
- **So that** we can trace who changed what and when.  
- **Dependencies**: Task 2.1.  
- **Risks**: Missing logs for critical changes.

**Checklist**:
- [ ] Implement `admin_audit_logs` writes for approval, rejection, activation, deactivation and deletion actions.
- [ ] Include actor, target, action type, timestamp and before/after snapshot or references.
- [ ] Provide basic read API for Audit Logs module (v1 simple view).

**Estimate**: 2 SP

---

**Sprint 2 total**: 8 SP

---

## Sprint 3 — Fees Configuration & Payment Info Backend

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 3.1 — Grade fee configuration APIs

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Backend — Fees

**Notes**:
- **As an** admin  
- **I want** to configure annual grade fees for Grades 8/9/10  
- **So that** student fee summaries reflect the correct base fee.  
- **Dependencies**: Task 1.3.  
- **Risks**: Retroactive changes and propagation logic.

**Checklist**:
- [ ] Implement CRUD APIs for `grade_fee_configs` with academic year and total annual fee.
- [ ] Implement propagation logic to update student fee summaries when grade fees change, per architecture.
- [ ] Audit-log all grade fee changes.

**Estimate**: 3 SP

---

### Task 3.2 — Extra subject fee configuration APIs

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Backend — Fees

**Notes**:
- **As an** admin  
- **I want** to configure extra subject fees per student  
- **So that** fees reflect optional subjects like Computer, AI, Economics.  
- **Dependencies**: Task 1.3.  
- **Risks**: Data drift if subjects or amounts are inconsistent.

**Checklist**:
- [ ] Implement CRUD APIs for `extra_subject_fee_configs` per student and subject.
- [ ] Ensure integration with `student_fee_summary` or equivalent to recalc totals.
- [ ] Audit-log all extra subject fee changes.

**Estimate**: 3 SP

---

### Task 3.3 — Payment Info configuration APIs (QR, UPI, bank details)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Admin Backend — Payment Info

**Notes**:
- **As an** admin  
- **I want** to configure payment info (QR, UPI, bank details)  
- **So that** Parent app can show correct Pay Info read-only.  
- **Dependencies**: Task 1.3.  
- **Risks**: None (read API for parents is informational only).

**Checklist**:
- [ ] Implement APIs to create/update `payment_info_config` (QR image URL, UPI ID, bank details).
- [ ] Expose read API consumed by Parent backend to feed `/parent/child/fees/pay-info`.
- [ ] Audit-log all payment info changes.

**Estimate**: 2 SP

---

**Sprint 3 total**: 8 SP

---

## Sprint 4 — Payment Entry & Fee Ledger Backend

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 4.1 — Fee payment entry APIs (create & edit)

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Backend — Payments

**Notes**:
- **As an** admin  
- **I want** to record and correct fee payments per student  
- **So that** fee ledgers and Parent fee summaries remain accurate.  
- **Dependencies**: Task 1.3, 3.1, 3.2.  
- **Risks**: Misapplied edits causing reconciliation issues.

**Checklist**:
- [ ] Implement APIs to record new payments into `fee_payments` with date, amount, mode and reference.
- [ ] Implement APIs to edit existing payments with audit notes (where feasible) and propagate changes into `student_fee_summary`.
- [ ] Audit-log all payment create/edit actions.

**Estimate**: 3 SP

---

### Task 4.2 — Fee summary and history APIs for Admin & Parent

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Backend — Payments

**Notes**:
- **As an** admin  
- **I want** per-student fee summary and history APIs  
- **So that** Admin and Parent apps share the same view of fees.  
- **Dependencies**: Task 4.1.  
- **Risks**: Cross-app data drift.

**Checklist**:
- [ ] Implement read APIs returning `student_fee_summary` plus payment history for a student/academic year.
- [ ] Ensure Parent backend can reuse or proxy these APIs for Parent fees summary/history.
- [ ] Add indexes to keep queries performant on expected dataset.

**Estimate**: 3 SP

---

### Task 4.3 — Admin fee KPIs & collection reports (backend only)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Admin Backend — Analytics

**Notes**:
- **As an** admin  
- **I want** API endpoints for fee KPIs and collection charts  
- **So that** the Admin dashboard can visualise outstanding fees and payments over time.  
- **Dependencies**: Task 4.2.  
- **Risks**: Expensive aggregate queries.

**Checklist**:
- [ ] Implement APIs for total outstanding fees, payments recorded this month/term, and collection over time per architecture.
- [ ] Consider pre-aggregated snapshots or efficient group-by queries.

**Estimate**: 2 SP

---

**Sprint 4 total**: 8 SP

---

## Sprint 5 — Admin Frontend: Shell, Dashboard & Users

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 5.1 — Admin frontend app shell & sidebar navigation

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Admin Frontend

**Notes**:
- **As an** admin  
- **I want** a web app with clear sidebar navigation  
- **So that** I can access Dashboard, Users, Fees, Payments, Payment Info and Audit Logs.  
- **Dependencies**: Task 1.1, 1.4.  
- **Risks**: None.

**Checklist**:
- [ ] Create `apps/admin/frontend` React app with routes and sidebar items per UX.
- [ ] Integrate auth with Admin JWT via gateway; ensure only Admin role can access.

**Estimate**: 2 SP

---

### Task 5.2 — Dashboard screen

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Admin Frontend — Dashboard

**Notes**:
- **As an** admin  
- **I want** a dashboard showing pending approvals, active users and fee KPIs  
- **So that** I see system state at a glance.  
- **Dependencies**: Tasks 2.1, 4.3.  
- **Risks**: Cluttered UI.

**Checklist**:
- [ ] Implement Dashboard per UX (`admin-dashboard.png`): KPI cards, pending approvals table, fee collection chart, recent payments.
- [ ] Wire to backend APIs for user counts, outstanding fees, payments this month and recent payment list.

**Estimate**: 3 SP

---

### Task 5.3 — Users screen (approvals & account statuses)

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Frontend — Users

**Notes**:
- **As an** admin  
- **I want** to review and approve users and manage account statuses  
- **So that** system access is controlled.  
- **Dependencies**: Tasks 2.1, 2.2, 2.3.  
- **Risks**: Misleading UI if status mappings are wrong.

**Checklist**:
- [ ] Implement Users screen per UX (`admin-users.png`): filters by role/status, table of users, detail panel, approve/reject/activate/deactivate actions.
- [ ] Integrate with user approval/status APIs and show confirmation dialogs for high-impact actions.

**Estimate**: 3 SP

---

**Sprint 5 total**: 8 SP

---

## Sprint 6 — Admin Frontend: Fees & Payments

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 6.1 — Fees configuration screen (grade & extra subject)

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Frontend — Fees

**Notes**:
- **As an** admin  
- **I want** to configure grade fees and per-student extra subject fees  
- **So that** fee summaries are accurate.  
- **Dependencies**: Tasks 3.1, 3.2, 5.1.  
- **Risks**: Confusing warnings about propagation.

**Checklist**:
- [ ] Implement Fees screen per UX (`admin-fees.png`): Grade fees table (edit inline with warning), entry point for per-student extra subject fees.
- [ ] Wire to grade and extra subject fee APIs; show confirmations and audit messages where needed.

**Estimate**: 3 SP

---

### Task 6.2 — Payments ledger & entry screen

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Admin Frontend — Payments

**Notes**:
- **As an** admin  
- **I want** a per-student fee ledger with payment history and record/edit flows  
- **So that** I can keep accurate fee records.  
- **Dependencies**: Tasks 4.1, 4.2, 5.1.  
- **Risks**: UX mistakes leading to wrong student selection.

**Checklist**:
- [ ] Implement Payments screen per UX (`admin-payments.png`): student search, fee summary card, payment history table, Record new payment modal, Edit payment modal with audit note.
- [ ] Wire to payment entry, edit and summary/history APIs; handle loading, error and confirmation states.

**Estimate**: 3 SP

---

### Task 6.3 — Basic accessibility & table performance tuning

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Admin Frontend — Accessibility

**Notes**:
- **As an** admin  
- **I want** tables and modals to be usable for long sessions  
- **So that** I can manage data without fatigue.  
- **Dependencies**: Tasks 5.2, 5.3, 6.1, 6.2.  
- **Risks**: None.

**Checklist**:
- [ ] Ensure tables and forms follow accessibility and keyboard navigation best practices.
- [ ] Add pagination or virtualisation if lists get large.

**Estimate**: 2 SP

---

**Sprint 6 total**: 8 SP

---

## Sprint 7 — Admin Frontend: Payment Info & Audit Logs

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 7.1 — Payment Info configuration screen

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Admin Frontend — Payment Info

**Notes**:
- **As an** admin  
- **I want** a Payment Info configuration screen  
- **So that** I can update QR/UPI/bank details that Parents see.  
- **Dependencies**: Task 3.3, 5.1.  
- **Risks**: Misleading if changes not clearly saved.

**Checklist**:
- [ ] Implement Payment Info screen per UX (`admin-payment-info.png`): QR preview + upload, fields for UPI ID and bank details, info banner, Save changes action.
- [ ] Wire to payment info configuration APIs; show success/failure and last-updated metadata.

**Estimate**: 3 SP

---

### Task 7.2 — Audit Logs screen (simple v1)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Admin Frontend — Audit Logs

**Notes**:
- **As an** admin  
- **I want** a basic view of audit logs  
- **So that** I can see who changed what recently.  
- **Dependencies**: Tasks 2.3, 3.1–3.3, 4.1, 4.3.  
- **Risks**: Large volumes of logs.

**Checklist**:
- [ ] Implement Audit Logs screen: table with actor, target, action, timestamp and short description.
- [ ] Wire to audit logs read API; include filters (date range, action type).

**Estimate**: 2 SP

---

### Task 7.3 — Empty/error/offline states across Admin screens

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Admin Frontend — UX Polish

**Notes**:
- **As an** admin  
- **I want** clear messages when data is unavailable or offline  
- **So that** I can understand issues without guessing.  
- **Dependencies**: Sprints 5–7 screens.  
- **Risks**: None.

**Checklist**:
- [ ] Implement consistent loading, error, empty and offline patterns on Dashboard, Users, Fees, Payments, Payment Info and Audit Logs.
- [ ] Ensure destructive actions have clear confirmation and undo/rollback pathways where supported.

**Estimate**: 3 SP

---

**Sprint 7 total**: 8 SP

---

## Sprint 8 — Hardening, Observability & Cross-App Validation

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 8.1 — Admin service observability (logs, metrics, tracing)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: DevOps / Admin Backend

**Notes**:
- **As a** team  
- **I want** logs, metrics and basic tracing for Admin backend  
- **So that** we can monitor performance and errors in production.  
- **Dependencies**: Sprints 1–4.  
- **Risks**: None.

**Checklist**:
- [ ] Integrate Admin backend with platform logging/monitoring stack.
- [ ] Add health checks and readiness probes for Admin backend and gateway routes.

**Estimate**: 2 SP

---

### Task 8.2 — Security review: RBAC, approval states & fee/payment changes

**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Admin Backend — Security

**Notes**:
- **As a** platform owner  
- **I want** to ensure admin operations are secure and correctly authorised  
- **So that** approvals, fees and payments cannot be misused.  
- **Dependencies**: Sprints 2–4.  
- **Risks**: Data misuse or privilege escalation.

**Checklist**:
- [ ] Review RBAC rules and permissions for all Admin APIs.
- [ ] Validate that only Admin role can change approvals, fees, payments and payment info.
- [ ] Run targeted security tests for common abuse scenarios.

**Estimate**: 3 SP

---

### Task 8.3 — Cross-app integration validation (Student/Teacher/Parent)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Integration

**Notes**:
- **As a** platform  
- **I want** to validate that Admin-owned approvals and fees align with Student/Teacher/Parent views  
- **So that** data appears consistent across apps.  
- **Dependencies**: Sprints 2–4, and other apps.  
- **Risks**: Cross-app data drift.

**Checklist**:
- [ ] Cross-check sample users’ approval statuses between Admin and login behaviour in other apps.
- [ ] Cross-check sample students’ fee summaries between Admin and Parent apps.

**Estimate**: 3 SP

---

**Sprint 8 total**: 8 SP

---

## Risk Register (Planner — Admin App)

| ID | Risk | Mitigation | Owner |
|----|------|------------|--------|
| AR1 | Cross-app data drift (fees and approvals) | Shared contracts in `@mindforge/shared`; Sprint 8 validation | Backend + Gateway |
| AR2 | Incorrect approval or fee changes by admins | Confirmation dialogs, audit logging, limited Admin access | Admin Backend + Frontend |
| AR3 | Performance issues on large ledgers | Indexing, pagination, and efficient queries | Admin Backend |
| AR4 | Confusing propagation of grade fee changes | Clear UI warnings; backend documentation; audit logs | Admin Frontend + Backend |

---

## Forecast Summary (Admin App)

| Sprint | Focus | SP | Confidence |
|--------|--------|-----|------------|
| 1 | Workspace integration & Admin service foundation | 8 | 95% |
| 2 | User approval & account lifecycle | 8 | 95% |
| 3 | Fees configuration & payment info backend | 8 | 90% |
| 4 | Payment entry & fee ledger backend | 8 | 90% |
| 5 | Admin frontend — Shell, Dashboard & Users | 8 | 90% |
| 6 | Admin frontend — Fees & Payments | 8 | 85% |
| 7 | Admin frontend — Payment Info & Audit Logs | 8 | 85% |
| 8 | Hardening, observability & cross-app validation | 8 | 90% |

**Total**: ~64 SP over 8 sprints. **No scope expansion**; all items trace to Admin Architecture + UX + Workspace docs only.

---

## STANDARD HANDOFF – To Dev Agent (Admin App)

```
============================================
HANDOFF: Planner / Scrum Master AI Agent → Dev Agent (Admin App)
============================================

PROJECT: Mindforge Admin App

ARTIFACT SOURCE: docs/architecture/admin/Mindforge_Admin_App_Architecture_v1.md
PLANNING SOURCE: docs/planning/Mindforge_Admin_App_Planner_Backlog.md

PLANNING STATUS: Backlog and sprints defined for Admin app; no architecture or UX changes.

WHAT THE DEV RECEIVES:
- Plan: Mindforge Admin App — Release 1
- Buckets: Sprints 1–8 (Workspace & Admin service foundation → User approval & lifecycle → Fees config & payment info → Payment entry & ledger → Frontend Shell/Dashboard/Users → Frontend Fees/Payments → Frontend Payment Info/Audit Logs → Hardening & validation)
- Tasks: Each task has Title, User story (As/I want/So that), Acceptance criteria (Checklist), Dependencies, Risks, Labels (Type | AI/Non-AI | Risk | Area)
- Notes: Full details in each task's Notes block
- Capacity: 1 engineer = 8–10 SP/sprint; 20% buffer; AI work minimal (mostly Non-AI)
- Risk register: AR1–AR4 with mitigations and owner area

CONSTRAINTS (DO NOT BREAK):
- Admin Architecture v1 is locked (docs/architecture/admin/Mindforge_Admin_App_Architecture_v1.md).
- Admin UX Spec v1 is locked (docs/architecture/admin/Mindforge_Admin_App_UX_Design_Specification_v1.md). No screen, flow, or feature changes.
- Workspace architecture is locked (docs/architecture/workspace-architecture.md). Apps remain decoupled; traffic via gateway; shared types in @mindforge/shared.
- Admin is the authoritative source for approvals, fees, payments and payment info; other apps are consumers only.
- No scope expansion; only implement approved design.

DEV NEXT STEPS:
1. Implement in sprint order (Sprint 1 → 2 → … → 8) or as directed by PM; respect dependencies in task Notes.
2. Use Checklist per task as acceptance criteria; satisfy all items before marking done.
3. Ensure admin actions are guarded with confirmations and fully audit-logged.
4. Run tests and migrations per CI/CD; adhere to workspace coding standards and security (auth, RBAC, secrets).

BLOCKERS: None.

DEPENDENCIES:
- Reads: docs/architecture/admin/Mindforge_Admin_App_Architecture_v1.md
- Reads: docs/architecture/admin/Mindforge_Admin_App_UX_Design_Specification_v1.md
- Reads: docs/architecture/workspace-architecture.md

============================================
Signature: Planner / Scrum Master AI Agent – Mindforge Admin App
============================================
```
