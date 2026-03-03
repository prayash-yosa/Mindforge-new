# Mindforge Parent App — Planner Backlog

**Artifact name**: Mindforge_Parent_App_Planner_Backlog  
**Role**: Planner / Scrum Master AI Agent  
**Date**: February 20, 2026  
**Mode**: Enterprise (V3) — parent app (read-only, child-linked)

**Sources (no scope expansion)**:
- Architecture: `docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md`
- UX Spec: `docs/architecture/parent/Mindforge_Parent_App_UX_Design_Specification.md`
- Workspace: `docs/architecture/workspace-architecture.md`

**Capacity**: 1 engineer = 8–10 SP/sprint · 20% buffer · AI work = probabilistic (confidence % in forecast)

---

## Plan: Mindforge Parent App — Release 1

### Buckets (Sprint / Epic)

| Bucket | Type | Focus |
|--------|------|--------|
| **Sprint 1** | Sprint | Workspace integration & Parent service foundation |
| **Sprint 2** | Sprint | Parent auth & linkage (mobile + MPIN) |
| **Sprint 3** | Sprint | Read APIs: progress, attendance, fees, pay info |
| **Sprint 4** | Sprint | Parent dashboard aggregation & caching |
| **Sprint 5** | Sprint | Parent frontend — Shell, Login & Home |
| **Sprint 6** | Sprint | Parent frontend — Progress & Attendance |
| **Sprint 7** | Sprint | Parent frontend — Fees, Pay Info & Profile |
| **Sprint 8** | Sprint | Hardening, observability & integration validation |

---

## Sprint 1 — Workspace Integration & Parent Service Foundation

**Capacity**: 10 SP (1 eng) · Buffer 20% → 8 SP target

---

### Task 1.1 — Wire Parent app into workspace & gateway routing

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Workspace / Gateway

**Notes**:
- **As a** platform team  
- **I want** the Parent frontend/backend wired into the monorepo and API gateway  
- **So that** Parent traffic flows via `services/gateway` and respects workspace rules.  
- **Dependencies**: Existing workspace scaffolding.  
- **Risks**: Misconfigured routing could affect other apps.

**Checklist**:
- [ ] Ensure `apps/parent/frontend` and `apps/parent/backend` are registered in root workspaces and Turborepo tasks.
- [ ] Add Parent routes in `services/gateway` with `role = parent` and routing to Parent backend port.
- [ ] Verify JWT + RBAC path in gateway for Parent role.
- [ ] Document local dev commands for Parent app (frontend + backend).

**Estimate**: 2 SP

---

### Task 1.2 — Parent backend skeleton (NestJS service)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Backend

**Notes**:
- **As a** backend engineer  
- **I want** a Parent NestJS service skeleton with core modules  
- **So that** auth, profile, and read modules can be added cleanly.  
- **Dependencies**: Task 1.1.  
- **Risks**: None.

**Checklist**:
- [ ] Create `apps/parent/backend` NestJS app with module layout matching architecture (Auth, Profile & Linkage, Academic Progress Read, Attendance Read, Fees Read, Pay Info, Integration).
- [ ] Implement basic health check and version endpoint.
- [ ] Configure DB connection for Parent service per workspace pattern.
- [ ] Ensure only `@mindforge/shared` is used for cross-app contracts; no direct imports from Teacher/Student/Admin apps.

**Estimate**: 2 SP

---

### Task 1.3 — Parent DB schema & migrations (parent_accounts & support tables)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Backend — Data

**Notes**:
- **As a** system  
- **I want** versioned migrations for parent identity and linkage data  
- **So that** parent accounts, MPIN and parent↔student mapping are consistent.  
- **Dependencies**: Task 1.2.  
- **Risks**: Constraints misaligned with PRD (e.g., more than two parents per child).

**Checklist**:
- [ ] Define and migrate `parent_accounts` and `parent_login_attempts` (or equivalent) tables per architecture v1.
- [ ] Enforce uniqueness of `mobile_number` and application rule of at most two active parents per `linked_student_id`.
- [ ] Integrate migrations into CI/CD and local dev.

**Estimate**: 3 SP

---

### Task 1.4 — Shared contracts for Parent APIs in @mindforge/shared

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Shared

**Notes**:
- **As a** cross-app integrator  
- **I want** Parent DTOs and enums in `@mindforge/shared`  
- **So that** Gateway and other services can call Parent APIs without tight coupling.  
- **Dependencies**: Task 1.2.  
- **Risks**: Contract churn creating breaking changes.

**Checklist**:
- [ ] Add Parent-related DTOs (e.g., `ParentProfileDto`, `ParentDashboardDto`, `ChildProgressTestDto`, `ChildAttendanceSummaryDto`, `ChildFeesSummaryDto`) under `shared/src/interfaces/parent`.
- [ ] Expose Parent role and claims (`linkedStudentId`) in `shared/src/auth` as needed.
- [ ] Ensure Parent frontend and backend both consume these shared types.

**Estimate**: 1 SP

---

**Sprint 1 total**: 8 SP

---

## Sprint 2 — Parent Auth & Linkage (Mobile + MPIN)

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 2.1 — Parent MPIN auth API (mobile + MPIN)

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Backend — Auth

**Notes**:
- **As a** parent  
- **I want** to log in with my registered mobile number and 6-digit MPIN  
- **So that** I can securely access my child’s data.  
- **Dependencies**: Task 1.3.  
- **Risks**: Brute-force attacks if rate limiting and lockout are weak.

**Checklist**:
- [ ] Implement `POST /parent/auth/login` taking `mobile_number` + `mpin` and returning JWT/session on success.
- [ ] Store only hashed MPIN; no MPIN values in logs.
- [ ] On failure, return clear but non-revealing error (no indication whether mobile or MPIN is wrong).

**Estimate**: 3 SP

---

### Task 2.2 — Lockout & rate limiting for Parent login

**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Parent Backend — Auth

**Notes**:
- **As a** platform owner  
- **I want** lockout and rate limiting on failed MPIN attempts  
- **So that** brute-force attacks are mitigated.  
- **Dependencies**: Task 2.1.  
- **Risks**: Legitimate parents locked out if thresholds misconfigured.

**Checklist**:
- [ ] Implement attempt tracking in DB or Redis with thresholds (e.g., N failed attempts → lockout for 15 minutes).
- [ ] Provide lockout status endpoint or payload field for frontend to show timers.
- [ ] Ensure counters reset on successful login.

**Estimate**: 2 SP

---

### Task 2.3 — Parent profile & parent↔student linkage enforcement

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Backend — Profile & Linkage

**Notes**:
- **As a** parent  
- **I want** to see my profile and my linked child’s basic information  
- **So that** I trust that I am seeing the right student’s data.  
- **Dependencies**: Task 1.3, 2.1.  
- **Risks**: Data leaks if linkage is misapplied.

**Checklist**:
- [ ] Implement `GET /parent/profile` returning parent name, mobile, relationship, status, and child summary (name, class, section) based on `linkedStudentId`.
- [ ] Enforce exactly one `linked_student_id` per parent and at most two active parents per student at the service level.
- [ ] Ensure JWT includes `linkedStudentId` claim and all child data APIs use it for scoping.

**Estimate**: 3 SP

---

**Sprint 2 total**: 8 SP

---

## Sprint 3 — Read APIs: Progress, Attendance, Fees, Pay Info

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 3.1 — Academic progress read APIs (tests & summary)

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Backend — Academic Progress

**Notes**:
- **As a** parent  
- **I want** to view my child’s test history and performance summaries  
- **So that** I understand academic progress over time.  
- **Dependencies**: Task 2.3; Teacher/Test services available.  
- **Risks**: Cross-service contract drift.

**Checklist**:
- [ ] Implement `GET /parent/child/progress/tests` and `GET /parent/child/progress/summary` as per architecture.
- [ ] Integrate with Teacher/Test service via Integration module; read-only GETs; enforce `student_id = linkedStudentId`.
- [ ] Return data shaped for UX: test list with child/hi/lo marks and series for line/bar charts with subject filters.

**Estimate**: 3 SP

---

### Task 3.2 — Attendance read APIs (weekly/monthly/yearly)

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Backend — Attendance

**Notes**:
- **As a** parent  
- **I want** weekly, monthly and yearly attendance views  
- **So that** I can see patterns and specific absent days.  
- **Dependencies**: Task 2.3; Teacher/Attendance service available.  
- **Risks**: Off-by-one or holiday issues in aggregation.

**Checklist**:
- [ ] Implement `GET /parent/child/attendance/weekly`, `/monthly`, `/yearly` that wrap Teacher/Attendance service reads.
- [ ] Provide aggregated stats (present/absent counts, %) and monthly absent date lists as per UX.
- [ ] Enforce `student_id = linkedStudentId` on all calls.

**Estimate**: 3 SP

---

### Task 3.3 — Fees summary, history & pay info APIs

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Backend — Fees & Pay Info

**Notes**:
- **As a** parent  
- **I want** to view my child’s fee status and pay instructions  
- **So that** I know dues and how to pay offline  
- **Dependencies**: Admin/Fees service; Task 2.3.  
- **Risks**: None (read-only only).

**Checklist**:
- [ ] Implement `GET /parent/child/fees/summary` (+ optional `/history`) consuming Admin/Fees service; read-only.
- [ ] Implement `GET /parent/child/fees/pay-info` returning QR code URL, UPI ID and bank details per architecture.
- [ ] Ensure no payment initiation APIs exist; responses are informational only.

**Estimate**: 2 SP

---

**Sprint 3 total**: 8 SP

---

## Sprint 4 — Parent Dashboard Aggregation & Caching

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 4.1 — Parent dashboard DTO & aggregation logic

**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Backend — Dashboard

**Notes**:
- **As a** parent  
- **I want** a Dashboard with latest test, attendance % and fee balance  
- **So that** I see a quick, trustworthy summary on Home.  
- **Dependencies**: Tasks 3.1, 3.2, 3.3.  
- **Risks**: Inconsistent numbers if aggregation windows differ.

**Checklist**:
- [ ] Implement `GET /parent/dashboard` returning a `ParentDashboardDto` (latest test card, attendance this month, fees summary, quick links metadata).
- [ ] Reuse existing progress/attendance/fees modules for underlying data; define consistent time windows (e.g., this month for attendance).

**Estimate**: 3 SP

---

### Task 4.2 — Caching and timeout policies for upstream calls

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Backend — Integration

**Notes**:
- **As a** platform  
- **I want** caching and robust timeout/ retry for Teacher/Fees services  
- **So that** Parent dashboard loads reliably without overloading upstreams.  
- **Dependencies**: Tasks 3.1–3.3, 4.1.  
- **Risks**: Stale data vs responsiveness.

**Checklist**:
- [ ] Introduce reasonable timeouts and retry policies for upstream reads in the Integration module.
- [ ] Add optional Redis caching layer for dashboard aggregates (e.g., TTL few minutes).
- [ ] Define fallback behaviour when one upstream is down (e.g., partial dashboard with clear messaging).

**Estimate**: 3 SP

---

### Task 4.3 — Parent backend error mapping & observability (MVP)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Backend — Observability

**Notes**:
- **As a** developer  
- **I want** consistent error mapping and basic logs/metrics  
- **So that** issues in Parent flows can be debugged quickly.  
- **Dependencies**: Tasks 1.2–3.3.  
- **Risks**: None.

**Checklist**:
- [ ] Map upstream errors and internal failures to stable API error codes/messages for the Parent frontend.
- [ ] Add structured logging for key flows (login, dashboard, progress, attendance, fees) without PII.
- [ ] Expose health and metrics endpoints for Parent backend.

**Estimate**: 2 SP

---

**Sprint 4 total**: 8 SP

---

## Sprint 5 — Parent Frontend: Shell, Login & Home

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 5.1 — Parent frontend app shell, routing & bottom nav

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend

**Notes**:
- **As a** parent  
- **I want** a mobile-first app with clear navigation  
- **So that** I can reach Home, Progress, Attendance, Fees and Profile easily.  
- **Dependencies**: Task 1.1, 1.4.  
- **Risks**: None.

**Checklist**:
- [ ] Create `apps/parent/frontend` React app with routes for Home, Progress, Attendance, Fees, Profile.
- [ ] Implement bottom navigation (`Home`, `Progress`, `Attendance`, `Fees`, `Profile`) per UX.
- [ ] Integrate auth guard using Parent JWT from gateway; ensure non-parents cannot access.

**Estimate**: 2 SP

---

### Task 5.2 — Login screen (mobile + MPIN)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend — Auth

**Notes**:
- **As a** parent  
- **I want** to log in using my phone number and 6-digit MPIN  
- **So that** I can securely access my child’s dashboard.  
- **Dependencies**: Task 2.1, 2.2, 5.1.  
- **Risks**: Poor error handling leading to confusion.

**Checklist**:
- [ ] Implement Login screen per UX (`parent-login-mobile.png`): phone input, 6-digit MPIN keypad UI, error and lockout messages.
- [ ] Call Parent auth API; handle incorrect MPIN, lockout timer, and generic errors.
- [ ] On success, store token/session and navigate to Home.

**Estimate**: 3 SP

---

### Task 5.3 — Home (Dashboard) screen

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend — Dashboard

**Notes**:
- **As a** parent  
- **I want** a Dashboard with latest test, attendance %, and fee summary  
- **So that** I have a quick overview of my child’s situation.  
- **Dependencies**: Task 4.1, 5.1.  
- **Risks**: Data overload if layout not clear.

**Checklist**:
- [ ] Implement Home screen per UX (`parent-mobile-dashboard.png`): child pill, latest test card, attendance this month card, fees summary card, quick links.
- [ ] Call `GET /parent/dashboard`; show loading, error and empty states.
- [ ] Ensure all content is read-only and clearly labelled.

**Estimate**: 3 SP

---

**Sprint 5 total**: 8 SP

---

## Sprint 6 — Parent Frontend: Progress & Attendance

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 6.1 — Academic Progress screen

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend — Progress

**Notes**:
- **As a** parent  
- **I want** to see test history, subject-wise trends and comparisons  
- **So that** I understand my child’s academic performance over time.  
- **Dependencies**: Task 3.1, 5.1.  
- **Risks**: Chart readability on small screens.

**Checklist**:
- [ ] Implement Progress screen per UX (`parent-mobile-progress.png`): subject chips, marks-over-time line chart, Recent tests list.
- [ ] Call academic progress APIs; map DTOs to chart and list models.
- [ ] Handle no-data and error states with clear messaging.

**Estimate**: 3 SP

---

### Task 6.2 — Attendance screen (weekly/monthly/yearly views)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend — Attendance

**Notes**:
- **As a** parent  
- **I want** weekly, monthly and yearly attendance views with absent days list  
- **So that** I can monitor attendance patterns easily.  
- **Dependencies**: Task 3.2, 5.1.  
- **Risks**: Calendar performance and clarity.

**Checklist**:
- [ ] Implement Attendance screen per UX (`parent-mobile-attendance.png`): segmented control (Weekly/Monthly/Yearly), calendar grid with present/absent dots, summary %, week bars, absent days list.
- [ ] Call attendance APIs for each mode; ensure correct scoping by student and date ranges.
- [ ] Handle holidays and no-data periods explicitly.

**Estimate**: 3 SP

---

### Task 6.3 — Basic accessibility & mobile optimisations (Parent core screens)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Frontend — Accessibility

**Notes**:
- **As a** parent  
- **I want** the app to be usable and readable on my phone  
- **So that** I can access my child’s data comfortably.  
- **Dependencies**: Tasks 5.2, 5.3, 6.1, 6.2.  
- **Risks**: None.

**Checklist**:
- [ ] Ensure tap targets and text sizes meet UX guidance.
- [ ] Add accessible labels for charts and cards (textual summaries).
- [ ] Verify layout on common mobile screen sizes.

**Estimate**: 2 SP

---

**Sprint 6 total**: 8 SP

---

## Sprint 7 — Parent Frontend: Fees, Pay Info & Profile

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 7.1 — Fees & Pay Info screen

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend — Fees

**Notes**:
- **As a** parent  
- **I want** to view my child’s fees summary and pay instructions  
- **So that** I know dues and how to pay manually.  
- **Dependencies**: Task 3.3, 5.1.  
- **Risks**: None.

**Checklist**:
- [ ] Implement Fees & Pay Info screen per UX (`parent-mobile-fees.png`): fees summary card, optional history, Pay Info card (QR, UPI ID, bank details), informational copy.
- [ ] Call fees and pay info APIs; clearly indicate that payments happen outside the app.

**Estimate**: 3 SP

---

### Task 7.2 — Profile screen (parent & child summary)

**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend — Profile

**Notes**:
- **As a** parent  
- **I want** to see my details and my linked child’s summary  
- **So that** I can confirm the account is set up correctly.  
- **Dependencies**: Task 2.3, 5.1.  
- **Risks**: None.

**Checklist**:
- [ ] Implement Profile screen listing parent name, phone, relationship, and linked child summary (name, class, section).
- [ ] Include static “Contact school” information; ensure everything is read-only.

**Estimate**: 2 SP

---

### Task 7.3 — Empty/error/offline states across Parent screens

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Frontend — UX Polish

**Notes**:
- **As a** parent  
- **I want** clear messages when data is unavailable or offline  
- **So that** I understand what is happening.  
- **Dependencies**: Sprints 5–7 screens.  
- **Risks**: None.

**Checklist**:
- [ ] Implement consistent loading, error, empty and offline patterns across Home, Progress, Attendance, Fees and Profile.
- [ ] Ensure no partial or misleading data is shown when upstreams fail.

**Estimate**: 3 SP

---

**Sprint 7 total**: 8 SP

---

## Sprint 8 — Hardening, Observability & Integration Validation

**Capacity**: 10 SP · Buffer 20% → 8 SP target

---

### Task 8.1 — Parent service observability (logs, metrics, tracing)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: DevOps / Parent Backend

**Notes**:
- **As a** team  
- **I want** logs, metrics and basic tracing for Parent backend  
- **So that** we can monitor performance and errors in production.  
- **Dependencies**: Sprints 1–4.  
- **Risks**: None.

**Checklist**:
- [ ] Integrate Parent backend with platform logging/monitoring stack (structured logs, metrics).
- [ ] Add health checks and readiness probes for Parent backend and gateway routes.

**Estimate**: 2 SP

---

### Task 8.2 — Security review: RBAC, data scoping & read-only guarantees

**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Parent Backend — Security

**Notes**:
- **As a** platform owner  
- **I want** to ensure Parent app is strictly read-only and correctly scoped  
- **So that** parents cannot mutate or see other students’ data.  
- **Dependencies**: Sprints 2–4.  
- **Risks**: Data leaks or accidental writes.

**Checklist**:
- [ ] Review all Parent APIs to confirm they are read-only and always filter by `linkedStudentId`.
- [ ] Validate RBAC rules in the gateway for Parent role.
- [ ] Run targeted security tests for cross-student access attempts.

**Estimate**: 3 SP

---

### Task 8.3 — Cross-app integration validation (Teacher/Admin/Student)

**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Integration

**Notes**:
- **As a** platform  
- **I want** to validate that Parent reads align with Teacher/Admin sources  
- **So that** numbers match and parents trust the app.  
- **Dependencies**: Tasks 3.1–3.3; Teacher/Admin services.  
- **Risks**: Cross-app data drift.

**Checklist**:
- [ ] Cross-check a sample set of tests, attendance and fees between Parent views and Teacher/Admin dashboards.
- [ ] Document any discrepancies and align aggregation rules where needed.

**Estimate**: 3 SP

---

**Sprint 8 total**: 8 SP

---

## Risk Register (Planner — Parent App)

| ID | Risk | Mitigation | Owner |
|----|------|------------|--------|
| PR1 | Cross-app data drift (Parent vs Teacher/Admin) | Shared contracts in `@mindforge/shared`; cross-app validation in Sprint 8 | Backend + Gateway |
| PR2 | Weak MPIN security for parents | Lockout & rate limiting; hashed MPIN; no MPIN in logs | Parent Backend |
| PR3 | Parent sees wrong student’s data | Enforce `linkedStudentId` in all queries and JWT; security tests | Parent Backend |
| PR4 | Performance issues due to upstream dependencies | Caching, timeouts, fallbacks; monitor latency | Parent Backend + DevOps |
| PR5 | Confusing read-only behaviour on Fees & Pay Info | Clear copy that payments happen outside the app; no pay buttons | Parent Frontend |

---

## Forecast Summary (Parent App)

| Sprint | Focus | SP | Confidence |
|--------|--------|-----|------------|
| 1 | Workspace integration & Parent service foundation | 8 | 95% |
| 2 | Parent auth & linkage | 8 | 95% |
| 3 | Read APIs: progress, attendance, fees, pay info | 8 | 90% |
| 4 | Dashboard aggregation & caching | 8 | 90% |
| 5 | Parent frontend — Shell, Login & Home | 8 | 90% |
| 6 | Parent frontend — Progress & Attendance | 8 | 85% |
| 7 | Parent frontend — Fees, Pay Info & Profile | 8 | 85% |
| 8 | Hardening, observability & integration validation | 8 | 90% |

**Total**: ~64 SP over 8 sprints. **No scope expansion**; all items trace to Parent Architecture + UX + Workspace docs only.

---

## STANDARD HANDOFF – To Dev Agent (Parent App)

```
============================================
HANDOFF: Planner / Scrum Master AI Agent → Dev Agent (Parent App)
============================================

PROJECT: Mindforge Parent App

ARTIFACT SOURCE: docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md
PLANNING SOURCE: docs/planning/Mindforge_Parent_App_Planner_Backlog.md

PLANNING STATUS: Backlog and sprints defined for Parent app; no architecture or UX changes.

WHAT THE DEV RECEIVES:
- Plan: Mindforge Parent App — Release 1
- Buckets: Sprints 1–8 (Workspace & Parent service foundation → Auth & linkage → Read APIs → Dashboard aggregation → Frontend Shell/Login/Home → Frontend Progress/Attendance → Frontend Fees/Pay Info/Profile → Hardening & integration validation)
- Tasks: Each task has Title, User story (As/I want/So that), Acceptance criteria (Checklist), Dependencies, Risks, Labels (Type | AI/Non-AI | Risk | Area)
- Notes: Full details in each task's Notes block
- Capacity: 1 engineer = 8–10 SP/sprint; 20% buffer; AI work treated as probabilistic where relevant
- Risk register: PR1–PR5 with mitigations and owner area

CONSTRAINTS (DO NOT BREAK):
- Parent Architecture v1 is locked (docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md).
- Parent UX Spec v1 is locked (docs/architecture/parent/Mindforge_Parent_App_UX_Design_Specification.md). No screen, flow, or feature changes.
- Workspace architecture is locked (docs/architecture/workspace-architecture.md). Apps remain decoupled; traffic via gateway; shared types in @mindforge/shared.
- Parent app is strictly read-only for academic, attendance and fees data; no payment or edit flows.
- No scope expansion; only implement approved design.

DEV NEXT STEPS:
1. Implement in sprint order (Sprint 1 → 2 → … → 8) or as directed by PM; respect dependencies in task Notes.
2. Use Checklist per task as acceptance criteria; satisfy all items before marking done.
3. Ensure all Parent APIs are read-only and correctly scoped to `linkedStudentId`.
4. Run tests and migrations per CI/CD; adhere to workspace coding standards and security (auth, RBAC, secrets).

BLOCKERS: None.

DEPENDENCIES:
- Reads: docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md
- Reads: docs/architecture/parent/Mindforge_Parent_App_UX_Design_Specification.md
- Reads: docs/architecture/workspace-architecture.md

============================================
Signature: Planner / Scrum Master AI Agent – Mindforge Parent App
============================================
```
