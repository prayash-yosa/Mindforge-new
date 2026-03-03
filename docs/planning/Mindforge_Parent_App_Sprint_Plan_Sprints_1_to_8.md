# Mindforge Parent App — Sprint Plan (Sprints 1–8)

**Artifact**: Mindforge_Parent_App_Sprint_Plan_Sprints_1_to_8  
**Date**: February 2026  
**Sources**: Architecture v1, UX Spec v1, Planner Backlog  
**Goal**: Production-ready Parent app, synced with Teacher & Student apps, minimal bugs

---

## Production-Ready Standards

All code must adhere to:

- **Type safety**: Full TypeScript, no `any`; typed API responses and DTOs
- **Validation**: class-validator on all inputs; whitelist + forbidNonWhitelisted
- **Error handling**: Consistent `{ code, message, details? }`; no raw stack traces to client
- **Security**: Never trust client-supplied `studentId`; always use `linkedStudentId` from JWT
- **Sync alignment**: Parent reads from Teacher cross-app API; student mapping via `externalId` (Teacher) ↔ `linked_student_id` (Parent)
- **Testing**: Unit tests for services; integration tests for auth and data scoping

---

## Teacher & Student Sync Integration

### Teacher Cross-App API (Parent consumes)

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/cross-app/classes` | List classes (for resolving classIds) |
| `GET /v1/cross-app/attendance/summary/:classId?from=&to=` | Attendance summary per class |
| `GET /v1/cross-app/attendance/student/:studentId/class/:classId?from=&to=` | Per-student attendance |
| `GET /v1/cross-app/attendance/student/:studentId/class/:classId/calendar?from=&to=` | Per-day calendar (present/absent) |
| `GET /v1/cross-app/performance/:classId` | Class KPIs (avg score, attendance %, etc.) |
| `GET /v1/cross-app/performance/student/:studentId/test/:testId` | Student test result |

**Student ID mapping**: Teacher uses `studentId` from `class_student` (e.g. `12131`). Parent's `linked_student_id` points to Student backend's student. Parent must resolve: `Student.id` → `Student.externalId` → use as `studentId` when calling Teacher.

### Student Backend (for profile/linkage)

- Student has `externalId` (e.g. `12131`) matching Teacher `class_student.studentId`
- Parent `linked_student_id` = Student backend `students.id` (UUID)
- Parent Integration service fetches student profile from Student API or Parent DB copy

### Fees (v1)

- Admin/Fees service may not exist. Implement **stub** in Parent: config-driven fees summary + pay-info.
- Add `GET /parent/child/fees/summary` and `GET /parent/child/fees/pay-info` returning config/mock data until Admin service is ready.

---

## Sprint 1 — Workspace Integration & Parent Service Foundation

**Target**: 8 SP | Production-ready foundation

### Task 1.1 — Wire Parent app into workspace & gateway routing (2 SP)

**Checklist**:
- [ ] Confirm `apps/parent/frontend` and `apps/parent/backend` in root `package.json` workspaces
- [ ] Add Parent backend to Turborepo `turbo.json` if present (build, dev, lint)
- [ ] If gateway exists: add Parent routes with `role = parent`, route to `localhost:3004`
- [ ] Document: `npm run dev` from root starts Parent; or `cd apps/parent/backend && npm run start:dev`, `cd apps/parent/frontend && npm run dev`

**Ports**:
- Parent backend: `3004`
- Parent frontend: `5174` (Vite)

---

### Task 1.2 — Parent backend skeleton (NestJS) (2 SP)

**Checklist**:
- [ ] NestJS app with modules: `Auth`, `Profile`, `Progress`, `Attendance`, `Fees`, `PayInfo`, `Integration`
- [ ] Health: `GET /health` (liveness), `GET /health/ready` (readiness)
- [ ] Config: `ConfigModule`, env-based (PORT, NODE_ENV, DB, TEACHER_SERVICE_URL, STUDENT_SERVICE_URL)
- [ ] Global ValidationPipe (whitelist, forbidNonWhitelisted)
- [ ] CORS for `http://localhost:5174`
- [ ] Use `@mindforge/shared` only; no direct imports from Teacher/Student/Admin

**Structure**:
```
apps/parent/backend/src/
├── main.ts
├── app.module.ts
├── config/
├── common/ (guards, decorators, filters, dto)
├── database/ (entities, repositories)
├── modules/
│   ├── auth/
│   ├── profile/
│   ├── progress/
│   ├── attendance/
│   ├── fees/
│   ├── pay-info/
│   └── integration/
```

---

### Task 1.3 — Parent DB schema & migrations (3 SP)

**Checklist**:
- [ ] `parent_accounts`: id, mobile_number (unique), mpin_hash, name, relationship, linked_student_id, status, created_by_admin_id, created_at, updated_at
- [ ] `parent_login_attempts`: id, parent_id, success, ip (optional), created_at
- [ ] Unique `mobile_number`; app-level rule: max 2 active parents per `linked_student_id`
- [ ] TypeORM migrations; SQLite for dev, PostgreSQL for prod
- [ ] Seed: one test parent (mobile `9876543210`, MPIN `123456`) linked to Student `12131` (Aarav)

---

### Task 1.4 — Shared contracts in @mindforge/shared (1 SP)

**Checklist**:
- [ ] `shared/src/interfaces/parent/`: ParentProfileDto, ParentDashboardDto, ChildProgressTestDto, ChildAttendanceSummaryDto, ChildFeesSummaryDto, PayInfoDto
- [ ] `shared/src/auth/`: ParentRole, ParentJwtPayload (sub, role, linkedStudentId)
- [ ] Export from `shared/src/index.ts`

---

## Sprint 2 — Parent Auth & Linkage

**Target**: 8 SP

### Task 2.1 — Parent MPIN auth API (3 SP)

**Checklist**:
- [ ] `POST /v1/parent/auth/login` body: `{ mobileNumber: string, mpin: string }`
- [ ] Validate mobile format; MPIN 6 digits
- [ ] Hash MPIN with bcrypt (cost 10); never log MPIN
- [ ] On success: JWT with `sub=parent_id`, `role=parent`, `linkedStudentId`
- [ ] On failure: generic "Invalid credentials" (no hint whether mobile or MPIN wrong)

---

### Task 2.2 — Lockout & rate limiting (2 SP)

**Checklist**:
- [ ] Track failed attempts in DB or in-memory map (parent_id → count, lockedUntil)
- [ ] After 5 failed attempts: lockout 15 minutes
- [ ] Return 429 with `retryAfter` seconds when locked out
- [ ] Reset counters on successful login

---

### Task 2.3 — Parent profile & linkage (3 SP)

**Checklist**:
- [ ] `GET /v1/parent/profile` — parent name, mobile, relationship, status; child name, class, section (from Student or local cache)
- [ ] Enforce: exactly one `linked_student_id` per parent; max 2 parents per student
- [ ] JWT guard: extract `linkedStudentId`; all child-data APIs use it, never client-supplied studentId

---

## Sprint 3 — Read APIs: Progress, Attendance, Fees, Pay Info

**Target**: 8 SP | **Sync with Teacher**

### Task 3.1 — Academic progress read APIs (3 SP)

**Checklist**:
- [ ] `GET /v1/parent/child/progress/tests` — query: subject?, from?, to?, page?, limit?
- [ ] `GET /v1/parent/child/progress/summary` — line/bar series for charts
- [ ] Integration: call Teacher `GET /v1/cross-app/performance/:classId` and `GET /v1/cross-app/performance/student/:studentId/test/:testId`
- [ ] Resolve `linkedStudentId` → Student.externalId (e.g. 12131) for Teacher API
- [ ] Get classIds from Teacher `GET /v1/cross-app/classes`; aggregate across classes
- [ ] Scope: `student_id = externalId` (Teacher) = `linkedStudentId` (Parent) via Student.externalId

**Config**: `TEACHER_SERVICE_URL=http://localhost:3003`

---

### Task 3.2 — Attendance read APIs (3 SP)

**Checklist**:
- [ ] `GET /v1/parent/child/attendance/weekly` — weekStart?
- [ ] `GET /v1/parent/child/attendance/monthly` — month, year
- [ ] `GET /v1/parent/child/attendance/yearly` — year
- [ ] Integration: Teacher `GET /v1/cross-app/attendance/student/:studentId/class/:classId/calendar?from=&to=`
- [ ] Merge attendance from all classes (same pattern as Student TeacherSyncService)
- [ ] Return: present/absent counts, %, absent dates list

---

### Task 3.3 — Fees & Pay Info APIs (2 SP)

**Checklist**:
- [ ] `GET /v1/parent/child/fees/summary` — total, paid, balance, lastPaymentDate (stub from config if Admin unavailable)
- [ ] `GET /v1/parent/child/fees/history` — optional list (stub)
- [ ] `GET /v1/parent/child/fees/pay-info` — qrCodeUrl, upiId, bankName, accountName, accountNumber, ifsc (from config/env)
- [ ] No payment initiation; informational only

---

## Sprint 4 — Dashboard Aggregation & Caching

**Target**: 8 SP

### Task 4.1 — Dashboard DTO & aggregation (3 SP)

**Checklist**:
- [ ] `GET /v1/parent/dashboard` — latest test, attendance this month %, fees summary
- [ ] Reuse Progress, Attendance, Fees modules
- [ ] Consistent windows: "this month" for attendance

---

### Task 4.2 — Timeout, retry, caching (3 SP)

**Checklist**:
- [ ] HTTP client timeout 5s; retry 1 for upstream (Teacher)
- [ ] Optional Redis cache for dashboard (TTL 2–5 min)
- [ ] Fallback: partial dashboard with "Data temporarily unavailable" for failed upstreams

---

### Task 4.3 — Error mapping & observability (2 SP)

**Checklist**:
- [ ] Map upstream errors → 503 with domain-specific messages
- [ ] Structured logging (no PII)
- [ ] Health + metrics endpoints

---

## Sprint 5 — Parent Frontend: Shell, Login & Home

**Target**: 8 SP

### Task 5.1 — App shell, routing, bottom nav (2 SP)

**Checklist**:
- [ ] React + Vite; routes: `/login`, `/home`, `/progress`, `/attendance`, `/fees`, `/profile`
- [ ] Bottom nav: Home | Progress | Attendance | Fees | Profile
- [ ] Auth guard: redirect to `/login` if no token
- [ ] Proxy: `/v1` → `http://localhost:3004` (Parent backend)

---

### Task 5.2 — Login screen (3 SP)

**Checklist**:
- [ ] Mobile input + 6-digit MPIN keypad
- [ ] Call `POST /v1/parent/auth/login`
- [ ] Handle: incorrect MPIN, lockout (show retry-after), network errors
- [ ] On success: store token, navigate to Home

---

### Task 5.3 — Home (Dashboard) screen (3 SP)

**Checklist**:
- [ ] Child pill: "Child: Aarav • Class 8B"
- [ ] Cards: latest test, attendance %, fees summary
- [ ] Quick links: Progress, Attendance, Fees
- [ ] Loading, error, empty states

---

## Sprint 6 — Parent Frontend: Progress & Attendance

**Target**: 8 SP

### Task 6.1 — Academic Progress screen (3 SP)

**Checklist**:
- [ ] Subject filter chips; marks-over-time line chart
- [ ] Recent tests list: name, subject, date, child marks, highest/lowest
- [ ] Call progress APIs; handle no-data, errors

---

### Task 6.2 — Attendance screen (3 SP)

**Checklist**:
- [ ] Segmented: Weekly | Monthly | Yearly
- [ ] Monthly: calendar grid (green=present, red=absent)
- [ ] Summary: "92% (21/23 days present)"
- [ ] Absent days list

---

### Task 6.3 — Accessibility & mobile (2 SP)

**Checklist**:
- [ ] Tap targets ≥ 44px; readable font sizes
- [ ] Accessible labels for charts
- [ ] Test on common mobile viewports

---

## Sprint 7 — Parent Frontend: Fees, Pay Info & Profile

**Target**: 8 SP

### Task 7.1 — Fees & Pay Info screen (3 SP)

**Checklist**:
- [ ] Fees summary card; optional history
- [ ] Pay Info: QR code, UPI ID, bank details
- [ ] Copy: "Use your banking app to pay. This app does not process payments."

---

### Task 7.2 — Profile screen (2 SP)

**Checklist**:
- [ ] Parent: name, phone, relationship
- [ ] Child: name, class, section
- [ ] "Contact school" static info

---

### Task 7.3 — Empty/error/offline states (3 SP)

**Checklist**:
- [ ] Consistent loading, error, empty, offline across all screens
- [ ] No partial/misleading data when upstreams fail

---

## Sprint 8 — Hardening, Observability & Integration Validation

**Target**: 8 SP

### Task 8.1 — Observability (2 SP)

**Checklist**:
- [ ] Structured logs; metrics; health/ready probes
- [ ] Startup diagnostics (DB, Teacher connectivity)

---

### Task 8.2 — Security review (3 SP)

**Checklist**:
- [ ] All APIs read-only; filter by `linkedStudentId`
- [ ] No client-supplied studentId used
- [ ] RBAC for Parent role in gateway (if applicable)
- [ ] Security tests: cross-student access attempts return 403

---

### Task 8.3 — Cross-app integration validation (3 SP)

**Checklist**:
- [ ] Cross-check: Parent attendance vs Teacher dashboard (same student)
- [ ] Cross-check: Parent progress vs Teacher test results
- [ ] Document aggregation rules; fix discrepancies

---

## Environment Variables (Parent Backend)

```env
PORT=3004
NODE_ENV=development

# Teacher sync (required for progress & attendance)
TEACHER_SERVICE_URL=http://localhost:3003

# Student service (for profile/linkage; optional if stored locally)
STUDENT_SERVICE_URL=http://localhost:3000

# JWT
JWT_SECRET=CHANGE_ME_IN_PRODUCTION
JWT_EXPIRES_IN=8h

# Database (SQLite dev / PostgreSQL prod)
DATABASE_URL=
# or SQLITE_PATH=./parent-dev.sqlite

# Fees/Pay Info (stub)
FEES_TOTAL=50000
FEES_PAID=25000
PAY_INFO_UPI_ID=school@upi
PAY_INFO_QR_URL=/assets/qr-placeholder.png
```

---

## Implementation Order Summary

| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| 1 | Foundation | Workspace, NestJS skeleton, DB, shared contracts |
| 2 | Auth | Login, lockout, profile, linkage |
| 3 | Read APIs | Progress, Attendance, Fees, Pay Info (Teacher sync) |
| 4 | Dashboard | Aggregation, caching, error mapping |
| 5 | Frontend shell | Login, Home, nav |
| 6 | Progress & Attendance | Charts, lists, calendar |
| 7 | Fees, Pay Info, Profile | All screens, error states |
| 8 | Hardening | Observability, security, integration validation |

---

## Handoff to Dev

- Implement in sprint order; respect dependencies.
- Use checklists as acceptance criteria.
- Ensure `linkedStudentId` scoping on every child-data API.
- Sync with Teacher via cross-app API; map Student.id → externalId for Teacher calls.
- Production-ready: typed, validated, secure, tested.
