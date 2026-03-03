# Mindforge Parent App – Architecture (v1)

**Artifact name**: Mindforge_Parent_App_Architecture_v1  
**Suggested file path**: `docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md`  

**Related artifacts**:  
- Student Light Architecture: `docs/architecture/light/Mindforge_Student_Experience_Light_Architecture_v2.md`  
- Teacher App Architecture: `docs/architecture/teacher/Mindforge_Teacher_App_Architecture_v1.md`  
- Parents Portal PRD: `docs/Requirements/Parents_Portal_PRD.pdf`  

> Scope: Architecture for the **Parent application** (frontend + backend) within the existing Mindforge monorepo.  
> Student and Teacher apps already exist; this document defines **parent-facing capabilities** and the **backend changes** needed to support the Parents Portal PRD, without modifying Student/Teacher UX.

---

## 1. Goals & Non‑Goals

### 1.1 Goals

- Provide a dedicated **Parent app** (frontend + backend) that supports:
  - Secure, **read‑only access** to the parent’s own child’s:
    - **Academic progress** (tests & marks, comparisons).
    - **Attendance** (weekly / monthly / yearly views).
    - **Fees** (total, paid, balance, last payment, history).
  - A **Pay Info** section that shows payment instructions only:
    - QR code image.
    - UPI ID.
    - Bank & account details.
  - Simple parent profile & linked student context.
- Enforce **strict role‑based isolation**:
  - Parent accounts are created by Admin only.
  - Each parent is linked to exactly **one student**.
  - Each student can have a maximum of **two parents**.
  - Parent can only see data where `student_id = linked_student_id`.
- Reuse existing Teacher/Admin domains as **sources of truth**:
  - Tests and scores from Teacher / assessment services.
  - Attendance from Teacher / attendance service.
  - Fees from Admin / fees service.
- Integrate Parent app cleanly into the workspace:
  - Dedicated `apps/parent/frontend` & `apps/parent/backend`.
  - All traffic via the **API Gateway** with `role = parent`.
  - Use `@mindforge/shared` for shared DTOs, enums, and IDs.

### 1.2 Non‑Goals (v1)

- No write operations from Parent app:
  - No editing academic records, attendance, or fees.
  - No online payments or payment gateway integrations.
  - No uploads (documents, images, etc.).
- No multi‑student parent view in v1:
  - Each parent account is linked to **one** student.
- No teacher messaging, homework approval, or notes flows (separate scope).
- No redesign of Student/Teacher UX; Parent app consumes existing data services.

---

## 2. Placement in Workspace Architecture

The Parent app fits into the existing monorepo as per `workspace-architecture.md`:

```text
Mindforge/
├── apps/
│   ├── student/
│   ├── teacher/
│   ├── parent/
│   │   ├── frontend/   # React + Vite — Parent UI (:5177, for example)
│   │   └── backend/    # NestJS — Parent microservice (:3004)
├── services/
│   └── gateway/        # API Gateway (NestJS) — role-based routing
├── shared/             # @mindforge/shared (types, DTOs, enums)
└── docs/
```

**Key rules**:

- Parent frontend → **Gateway** → Parent backend.
- Parent backend:
  - Owns **parent account & linkage domain**:
    - Parent accounts, MPIN login, and parent ↔ student linkage.
  - Exposes **read‑only APIs** that aggregate:
    - Academic progress for the linked student.
    - Attendance analytics for the linked student.
    - Fee summary & history for the linked student.
    - Pay Info configuration.
- Parent backend *does not* own the academic/attendance/fee source data:
  - Reads those from Teacher/Admin services (via gateway or service‑to‑service calls).
- Shared types and contracts live in `@mindforge/shared`:
  - `ParentRole`, `ParentProfileDto`, `ParentDashboardDto`, `ChildProgressDto`, etc.

---

## 3. High‑Level Architecture

### 3.1 Components

1. **Parent Frontend (React + Vite)**  
   - Role: `Parent`.  
   - Key modules:
     - **Auth**: Login with mobile number + 6‑digit MPIN.
     - **Layout & Navigation**:
       - Top/side navigation with main sections:
         - Dashboard.
         - Academic Progress.
         - Attendance.
         - Fees.
         - Pay Info.
         - Profile.
     - **Dashboard**:
       - Snapshot cards for latest test, attendance %, fee balance.
     - **Academic Progress**:
       - Test list view.
       - Filters by subject/date.
       - Graphs: line chart (trend), bar chart (child vs highest/lowest).
     - **Attendance**:
       - Weekly, monthly, yearly views with % and trends.
       - Monthly absent dates list.
     - **Fees**:
       - Total, paid, balance, last payment, optional payment history.
     - **Pay Info**:
       - QR code, UPI ID, bank details (read‑only informational).
     - **Profile**:
       - Parent details and linked student summary (read‑only).

2. **Parent Backend (NestJS)**  
   Logical modules:

   - **Auth Module (Parent)**  
     - Parent login with `mobile_number + 6‑digit MPIN`.  
     - Lockout and rate‑limiting on failed attempts.  
     - Issues short‑lived JWT/session with:
       - `sub = parent_id`
       - `role = parent`
       - `linkedStudentId`

   - **Parent Profile & Linkage Module**  
     - Stores parent accounts and enforces:
       - Exactly one linked student per parent.
       - Maximum two parents per student.
     - Provides `GET /parent/profile`:
       - Parent name, mobile, relationship, status.
       - Linked student basic info (name, class, section).

   - **Academic Progress Read Module**  
     - Provides:
       - `GET /parent/child/progress/tests`
       - `GET /parent/child/progress/summary`
     - Reads test data from Teacher/Test domain (via Gateway).
     - Aggregates:
       - Test list with test name, date, child marks, highest/lowest marks, top/bottom scorer names.
       - Data series for line & bar charts (subject filter).
     - Always filters by `linkedStudentId` from token.

   - **Attendance Read Module**  
     - Provides:
       - `GET /parent/child/attendance/weekly`
       - `GET /parent/child/attendance/monthly`
       - `GET /parent/child/attendance/yearly`
     - Reads from the Attendance domain (Teacher backend or shared attendance service).
     - Aggregates:
       - Weekly working days, present/absent counts, %.
       - Monthly % and absent dates list.
       - Yearly overall % and month-wise trend.
     - Enforces `student_id = linkedStudentId`.

   - **Fees Read Module**  
     - Provides:
       - `GET /parent/child/fees/summary`
       - `GET /parent/child/fees/history` (optional).
     - Reads from Admin/Fees service:
       - Total fees, paid, balance, last payment date, history.
     - No write APIs; Admin updates fees manually.

   - **Pay Info Module**  
     - Provides:
       - `GET /parent/child/fees/pay-info`
     - Returns:
       - QR code URL (served from assets or object store).
       - UPI ID.
       - Bank name, account name, account number, IFSC.
     - Data stored as configuration in Parent DB or retrieved from Admin service.

   - **Integration Module (internal)**  
     - HTTP clients or service clients for:
       - Teacher/Test service.
       - Attendance service.
       - Admin/Fees service.
     - Concerns:
       - Service auth, timeout & retry policies.
       - Error mapping and fallbacks.

3. **Parent Database (RDBMS)**  
   - Owns parent identity and linkage data.
   - Optional Redis cache for:
     - Login attempts & lockout counters.
     - Cached dashboard aggregates to reduce upstream calls.

### 3.2 Communication Patterns

- **Parent Frontend → Gateway → Parent Backend**:
  - REST over HTTPS, JSON payloads.
  - Auth via JWT (Authorization: Bearer) or secure cookies.

- **Parent Backend → Teacher / Attendance / Fees services**:
  - REST over internal network (via Gateway or direct service‑to‑service).
  - Machine‑to‑machine authentication (e.g., service tokens).
  - Idempotent GET requests only (read‑only).

- **Parent Backend → Parent DB / Redis**:
  - ORM / repository pattern (`TypeORM` or Prisma) for DB.
  - Redis client for rate‑limiting and caching.

---

## 4. Data Model & Ownership (High‑Level)

### 4.1 Parent Service Tables

- `parent_accounts`:
  - `id` (PK)
  - `mobile_number` (unique, mandatory)
  - `mpin_hash` (hashed 6‑digit MPIN)
  - `name`
  - `relationship` (`FATHER` / `MOTHER` / `GUARDIAN`)
  - `linked_student_id` (FK to shared student ID)
  - `status` (`ACTIVE` / `DISABLED`)
  - `created_by_admin_id`
  - `created_at`, `updated_at`

- `parent_login_attempts` (or Redis‑based counters):
  - `parent_id`
  - `timestamp`
  - `success` / `failure`
  - `ip` / device metadata (optional)

**Constraints**:

- `mobile_number` unique across parent accounts.
- Application‑level rule:
  - At most **two active parent_accounts** per `linked_student_id`.

### 4.2 Read‑only Domains (Owned Elsewhere)

- **Student master**:
  - Owned by Student/Identity service.
  - Parent reads `student_name`, `class`, `section` via shared API.

- **Tests and performance**:
  - Owned by Teacher/Test services.
  - Parent reads:
    - Per‑test results for the linked student.
    - Highest/lowest marks & names for that test.
    - Subject metadata for filtering.

- **Attendance records**:
  - Owned by Teacher/Attendance service.
  - Parent reads:
    - Per‑day status.
    - Aggregated stats for weekly/monthly/yearly views.

- **Fees**:
  - Owned by Admin/Fees service.
  - Parent reads:
    - Total, paid, balance.
    - Last payment date and optional payment history.

Parent service must not duplicate or become a second source of truth for these domains beyond short‑term caching.

---

## 5. API Contracts (Logical)

> All endpoints are **read‑only** except login, and all are implicitly scoped to the authenticated `parent_id` and `linkedStudentId`.

### 5.1 Auth

- `POST /parent/auth/login`
  - Body: `{ mobileNumber: string, mpin: string }`
  - Behavior: Validate credentials, apply rate limits/lockout, issue token.

- `GET /parent/auth/me`
  - Returns: Parent profile + linked student basic info from token context.

### 5.2 Dashboard

- `GET /parent/dashboard`
  - Returns an aggregated dashboard DTO:
    - Latest test summary.
    - Current attendance % (configurable period).
    - Fee summary (total/paid/balance).

### 5.3 Academic Progress

- `GET /parent/child/progress/tests`
  - Query: `subject?`, `from?`, `to?`, `page?`, `limit?`
  - Returns:
    - Paged list: test name, date, child marks, highest/lowest marks, top/bottom scorer names.

- `GET /parent/child/progress/summary`
  - Returns:
    - Line series for child’s marks over time (for graphs).
    - Bar series for child vs highest/lowest marks.
    - Subject filter metadata.

### 5.4 Attendance

- `GET /parent/child/attendance/weekly`
  - Query: `weekStart?` (or derive from current date).
  - Returns working days, present/absent counts, %.

- `GET /parent/child/attendance/monthly`
  - Query: `month`, `year`.
  - Returns monthly % + absent dates list for the calendar.

- `GET /parent/child/attendance/yearly`
  - Query: `year`.
  - Returns overall % and month-wise trend.

### 5.5 Fees

- `GET /parent/child/fees/summary`
  - Returns: total fees, paid fees, balance, last payment date.

- `GET /parent/child/fees/history`
  - Optional; returns: list of payments (date, amount, mode/reference).

### 5.6 Pay Info

- `GET /parent/child/fees/pay-info`
  - Returns:
    - QR code URL.
    - UPI ID.
    - Bank name, account name, account number, IFSC.
  - No payment initiation or callbacks; purely informational.

---

## 6. Security, Roles & Data Sensitivity

### 6.1 Roles & Access

- **Parent**:
  - Can log in using mobile number + 6‑digit MPIN.
  - Can only access:
    - `parent` endpoints.
    - Data for their single `linkedStudentId`.
  - Read‑only access across all domains (academic, attendance, fees).

- **Admin / Teacher / Student**:
  - Access Parent backend only via:
    - Internal, service‑to‑service calls (e.g., Admin for create/update parent accounts).
  - No cross‑role UI exposure in this app.

### 6.2 AuthN & AuthZ

- Authentication:
  - MPIN stored as salted hash.
  - Login attempts limited via Redis counters and DB flags.
  - Token/session includes `role = parent` and `linkedStudentId`.

- Authorization:
  - Gateway enforces `role = parent` for `/parent/**`.
  - Parent backend ignores any client‑supplied student IDs:
    - Always derives `student_id` from `linkedStudentId` claim.
  - Upstream services (Teacher/Admin) treat Parent backend as a privileged machine client, not as the parent directly.

### 6.3 Data Sensitivity

- **Student identity & performance**:
  - PII; protected in transit (HTTPS) and at rest.
- **Fee data**:
  - Sensitive financial information (for the family); also encrypted at rest.
- **Attendance data**:
  - Educational record; treated as sensitive as per Student Light Architecture.

---

## 7. Error Handling & Resilience

- **API error shape**:
  - `{ code: string, message: string, details?: any }`.
  - 400 (validation), 401 (invalid credentials), 403 (disabled), 404 (no data), 429 (rate limit/lockout), 500/503 (internal/upstream failures).

- **Upstream failures** (Teacher/Admin/Attendance services):
  - Map to 503 with domain‑specific messages:
    - Academic data unavailable.
    - Attendance data unavailable.
    - Fees data unavailable.
  - Parent frontend shows graceful “temporary issue” states and retry options.

- **Client‑side patterns**:
  - Login:
    - Show clear errors for incorrect MPIN and lockouts.
  - Dashboard/sections:
    - Skeleton loaders for initial load.
    - Error banners with “Retry” and clear domain messages.

---

## 8. Key Risks & Mitigations

1. **Data leakage across students (broken isolation)**  
   - Mitigation:
     - Never trust client‑supplied student IDs.
     - Enforce `linkedStudentId` filtering at backend for all reads.
     - Contract tests and security tests for isolation.

2. **Weakness from MPIN‑only auth**  
   - Mitigation:
     - Rate limiting and lockout after repeated failures.
     - Strong hashing of MPIN.
     - Optional device‑level protections later (OS biometrics as convenience).

3. **Inconsistent data across Teacher/Admin and Parent views**  
   - Mitigation:
     - Parent reads directly from source services (or through a single aggregation service).
     - Show “Last updated” where feasible for fees and attendance.

4. **Upstream service downtime**  
   - Mitigation:
     - Clear UI messaging for partial outages (e.g., fees unavailable but attendance OK).
     - Cached aggregates for dashboard (short‑term).

5. **Misinterpretation of Pay Info as payment gateway**  
   - Mitigation:
     - Copy/UX content must clearly state that payments are **offline/manual**.
     - No buttons that imply “Pay now” or online gateways.

---

## 9. Implementation Order (Architecture‑Aligned)

1. Parent identity & linkage data model (`parent_accounts`), including Admin‑side create/update (via Admin app/service).
2. Parent backend Auth module (login, MPIN hashing, rate limiting, lockout).
3. Parent profile & linkage read API.
4. Integration clients to Teacher/Test, Attendance, and Fees services.
5. Academic Progress read APIs (list + summary).
6. Attendance read APIs (weekly, monthly, yearly).
7. Fees read APIs (summary + optional history).
8. Pay Info configuration and read API.
9. Parent frontend:
   - Auth flow (mobile + MPIN).
   - Dashboard + navigation shell.
   - Academic Progress, Attendance, Fees, Pay Info, Profile screens.
10. Observability and alerting (login failures, upstream errors).

---

## STANDARD HANDOFF – To UX / UI Agent (Parent App)

**PROJECT**: Mindforge Parent App  
**PHASE**: Architecture → UX / UI (navigation‑first)  
**ARTIFACT SOURCE**: `docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md`  

### Context summary (for UX)

- New Parent app (React + Vite) with its own backend (NestJS), integrated via the API Gateway with `role = parent`.
- Parents:
  - Are created only by Admin.
  - Log in with **mobile number + 6‑digit MPIN**.
  - Are linked to **exactly one student**; each student has at most **two parents**.
  - Have **read‑only access** to academic, attendance, and fee data; no write or payment actions.
- Core experiences:
  - **Dashboard** with quick view of child’s latest performance, attendance, and fee status.
  - **Academic Progress** with lists and charts per PRD (test name, date, child marks, highest/lowest, names of top/bottom scorers).
  - **Attendance** with **weekly, monthly, and yearly** views and associated charts and lists.
  - **Fees** with summary and optional history.
  - **Pay Info** with QR code and bank/UPI details (informational only).
  - **Profile** with parent details and linked child info.

### What UX SHOULD design now

- **Global navigation & layout** for Parent persona:
  - Clearly separated sections: Dashboard, Academic Progress, Attendance, Fees, Pay Info, Profile.
  - Mobile/desktop layout consistent with Student/Teacher visual language but tuned for quick, glanceable data.

- **Authentication flow**:
  - Mobile + MPIN login screen.
  - Error, lockout, and disabled account states.
  - Basic session timeout behavior (e.g., re‑auth after inactivity).

- **Dashboard screen**:
  - Compact cards for:
    - Latest test result (subject, marks).
    - Current attendance %.
    - Fee balance and last payment.
  - Clear CTAs into detail pages (Academic Progress, Attendance, Fees).

- **Academic Progress screens**:
  - Test list view with:
    - Test Name, Test Date, Child Marks, Highest/Lowest Marks, Highest/Lowest Scorer names.
  - Subject filters and date range filters.
  - Charts:
    - Line graph for trend over time.
    - Bar chart for child vs highest/lowest for selected scope.
  - Empty/error/loading states.

- **Attendance screens**:
  - Weekly view: working days, present/absent counts, attendance %.
  - Monthly view:
    - Bar chart + %.
    - List or calendar of absent dates.
  - Yearly view:
    - Overall annual %.
    - Month‑wise trend chart.
  - Visual consistency with Student attendance calendar where appropriate, but tuned for parent consumption.

- **Fees & Pay Info screens**:
  - Fees summary:
    - Total, paid, balance, last payment date.
    - Optional payment history list.
  - Pay Info:
    - QR code image.
    - UPI ID and bank/account details.
  - Explicit copy that payments are made **outside** the app; no in‑app pay actions.

- **Profile screen**:
  - Parent name, mobile, relationship, account status.
  - Linked child: name, class, section.
  - Simple “Contact school” / support CTAs for corrections.

### UX constraints & rules

- Parent app is **view‑only**:
  - No edit affordances for academic, attendance, or fee information.
  - No buttons that imply “Pay now” or modify records.
- Data must always be clearly **scoped to the linked child**:
  - Avoid UI elements that look like multi‑child switching in v1.
- Authentication:
  - MPIN UX should be easy and familiar (numeric keypad, 6 fields).
  - Show clear messaging for incorrect attempts and lockouts.
- Visual language:
  - Align with Mindforge’s existing color and typography system.
  - Prioritise clarity and quick scanning for parents (graphs + simple lists).

### Open questions for UX / Product

1. How much **historical depth** is required for graphs by default (e.g., last 3 months vs full academic year)?  
2. How should we visually communicate **partial data availability** (e.g., fees data present but attendance service temporarily unavailable)?  
3. Do we want lightweight **device‑specific patterns** (e.g., mobile‑first vertical layout vs desktop side‑by‑side cards) in v1?  

### Handoff status

- Parent app architecture and module boundaries are defined and aligned with Student Light Architecture v2 and Teacher App Architecture v1.
- Parent backend is a read‑only façade over academic, attendance, and fees domains with strict per‑student isolation.
- **UX / UI may now proceed** to design Parent app navigational structure and screens using this document as the architecture constraint and the Parents Portal PRD as the product source of truth.

**Signature**:  
Architect AI Agent – Mindforge Parent App (v1)

