# Mindforge Admin App – Architecture (v1)

**Artifact name**: Mindforge_Admin_App_Architecture_v1  
**Suggested file path**: `docs/architecture/admin/Mindforge_Admin_App_Architecture_v1.md`  

**Related artifacts**:  
- Workspace Architecture: `docs/architecture/workspace-architecture.md`  
- Student Light Architecture: `docs/architecture/light/Mindforge_Student_Experience_Light_Architecture_v2.md`  
- Teacher App Architecture: `docs/architecture/teacher/Mindforge_Teacher_App_Architecture_v1.md`  
- Parent App Architecture: `docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md`  
- Admin App Product Requirements: `docs/Requirements/Admin_App_Product_Requirements.pdf`  

> Scope: Architecture for the **Admin application** (frontend + backend) within the existing Mindforge monorepo.  
> Admin is the **control plane** for user approval, account lifecycle, and fee/payment configuration consumed by Student, Teacher, and Parent apps.

---

## 1. Goals & Non‑Goals

### 1.1 Goals

- Provide a dedicated **Admin app** that enables:
  - **User approval & access control**:
    - Review and approve student, teacher, and parent accounts.
    - Block login for unapproved or disabled users.
    - Auto‑assign default MPIN `000000` on approval.
    - Enforce mandatory MPIN change on first login (via respective apps).
  - **Fees payment configuration** for Parent app:
    - Manage QR code image upload.
    - Manage UPI ID and full bank account details.
    - Changes reflect instantly in Parent app.
  - **Annual grade fee setup**:
    - Define and update total annual fee for Grades 8/9/10.
    - Auto‑propagate grade fees to student profiles.
  - **Extra subject fee management**:
    - Set per‑student extra subject fees (Computer, AI, Economics, etc.).
    - Edit at any time.
  - **Fee payment entry & tracking**:
    - Manually record parent payments (online or offline).
    - Modify/correct payment records with full audit trail.
    - Changes reflect instantly in Parent app.
  - **Account management**:
    - Edit, activate/deactivate, or delete user accounts.
    - All changes logged in audit trail.

### 1.2 Non‑Goals (v1)

- No direct classroom or academic content management (belongs to Teacher domain).
- No direct Student/Parent/Teacher UI redesign or UX changes.
- No external payment gateway integration (Admin only records payments and configures static payment information).
- No multi‑school/tenant admin panel; v1 assumes a single institution context.

---

## 2. Placement in Workspace Architecture

From `workspace-architecture.md`:

```text
Mindforge/
├── apps/
│   ├── student/
│   ├── parent/
│   ├── teacher/
│   └── admin/
│       ├── frontend/   # React 19 + Vite — Admin UI (:5176)
│       └── backend/    # NestJS — Admin microservice (:3004)
├── services/
│   └── gateway/        # API Gateway — JWT validation, RBAC, routing
├── shared/             # @mindforge/shared
└── docs/
```

**Key rules**:

- Admin frontend → **Gateway** → Admin backend.
- Admin backend:
  - Owns:
    - User approval state and account lifecycle.
    - MPIN provisioning (`000000` default) and flags for first‑login MPIN change.
    - Fee configuration (grade fees, extra subject fees, payment config).
    - Recorded payments and fee ledger (source of truth for fees).
    - User account status (active / disabled / deleted) and audit trail.
  - Exposes APIs consumed by:
    - Student/Teacher/Parent backends for:
      - Checking account approval and status.
      - Fetching fee structures/payment info.
      - Evaluating MPIN‑change‑required flags on login.
- Shared types and contracts live in `@mindforge/shared`:
  - `UserRole`, `UserStatus`, `AdminFeeConfigDto`, `PaymentRecordDto`, etc.

---

## 3. High‑Level Architecture

### 3.1 Components

1. **Admin Frontend (React + Vite)**  
   - Role: `Admin`.  
   - Key UI areas:
     - **User Approval & Accounts**:
       - Pending users list (students, teachers, parents).
       - Approve/reject and activate/deactivate actions.
       - User detail view (profile + linked student for parents).
     - **Fees Configuration**:
       - Annual grade fee setup for Grades 8/9/10.
       - Extra subject fee configuration per student.
     - **Payment Entry & Ledger**:
       - Create/edit payment records.
       - View per‑student fee summary and history.
     - **Payment Info (Parent app)**:
       - QR image upload.
       - UPI ID and bank account fields.
     - **Audit & Logs** (simplified in v1):
       - View changes to accounts and fees.

2. **Admin Backend (NestJS)**  
   Logical modules:

   - **User Management & Approval Module**  
     - Entities:
       - `admin_users` (if separate admin auth) or reuses common `users` with `role = admin`.
       - `user_accounts` (or integrates with shared/user domain).
     - Capabilities:
       - Approve/deny registration requests for students, teachers, parents.
       - Set default MPIN `000000` on approval.
       - Set `mustChangeMpinOnFirstLogin = true`.
       - Activate/deactivate/delete user accounts.
       - Log all changes in audit trail.
     - Integration:
       - Expose read APIs for other services to check:
         - `isApproved`, `status`.
         - `mustChangeMpinOnFirstLogin`.

   - **Fee Configuration Module**  
     - Annual grade fee:
       - Persistent configuration for each grade (8/9/10).
       - Propagation into student fee records when:
         - New student is created.
         - Grade changes.
     - Extra subject fees:
       - Per‑student fee entries for optional subjects (Computer, AI, Economics, etc.).
     - APIs:
       - CRUD for grade fee configuration.
       - CRUD for extra subject fee configuration.

   - **Payment Entry & Ledger Module**  
     - Entities:
       - `fee_payments` (per transaction).
       - `student_fee_summary` (denormalised per student, or computed on the fly).
     - Capabilities:
       - Record new payments (with mode, reference, date, amount).
       - Edit or correct existing records.
       - Reflect changes in:
         - Parent app fee summary.
         - Admin fee reports.
     - All mutations are audit‑logged.

   - **Payment Info Configuration Module**  
     - Manages:
       - QR code image storage location (URL).
       - UPI ID string.
       - Bank account metadata (bank, account name, account number, IFSC).
     - Exposes a read API consumed by Parent backend for:
       - `/parent/child/fees/pay-info`.

   - **Audit Trail Module**  
     - Entity:
       - `admin_audit_logs` capturing:
         - Actor (`admin_id`).
         - Target (user/fee/payment record).
         - Action type (create/update/delete/approve/disable).
         - Before/after snapshot (serialized JSON or ref).
         - Timestamp.

   - **Integration Module**  
     - Provides APIs (or internal clients) for:
       - Student/Teacher/Parent services to:
         - Validate user approval status & MPIN first‑login requirement.
         - Read fee configuration and student fee summaries.
         - Read payment info configuration.

3. **Admin Database (RDBMS)**  
   - PostgreSQL schema for admin‑owned entities:
     - User approval state (if not fully centralised elsewhere).
     - Grade fee configs, extra subject fee mappings.
     - Fee payments and summaries.
     - Payment info config.
     - Admin audit logs.

---

## 4. Data Model (High‑Level)

> Exact naming may align with shared user/fee schemas; below is logical.

### 4.1 User & Approval

- `user_accounts` (or shared `users` table extended):
  - `id`
  - `role` (`STUDENT`, `TEACHER`, `PARENT`, `ADMIN`)
  - `username` / identifier
  - `mobile_number`
  - `status` (`PENDING_APPROVAL`, `ACTIVE`, `DISABLED`, `DELETED`)
  - `isApproved` (boolean or derived from status)
  - `must_change_mpin_on_first_login` (boolean)
  - `created_at`, `updated_at`

- `parent_links` (may already exist in Parent domain; Admin writes into it):
  - `parent_user_id`
  - `student_user_id`
  - `relationship`

### 4.2 Fees Configuration

- `grade_fee_configs`:
  - `id`
  - `grade` (`8`, `9`, `10`, etc.)
  - `academic_year`
  - `total_fee_amount`
  - `is_active`
  - `created_at`, `updated_at`

- `extra_subject_fee_configs`:
  - `id`
  - `student_id`
  - `subject_code` (e.g. `COMPUTER`, `AI`, `ECONOMICS`)
  - `extra_fee_amount`
  - `created_at`, `updated_at`

### 4.3 Fee Payments & Summaries

- `fee_payments`:
  - `id`
  - `student_id`
  - `amount_paid`
  - `payment_date`
  - `payment_mode` (e.g. `CASH`, `UPI`, `BANK_TRANSFER`, `CHEQUE`)
  - `reference` / notes
  - `recorded_by_admin_id`
  - `created_at`, `updated_at`

- `student_fee_summary` (optional denormalised table):
  - `student_id`
  - `academic_year`
  - `base_fee_amount`
  - `extra_fee_amount`
  - `total_fee_amount`
  - `total_paid_amount`
  - `balance_amount`
  - `last_payment_date`

### 4.4 Payment Info Configuration

- `payment_info_config` (single row or per‑school):
  - `id`
  - `qr_image_url`
  - `upi_id`
  - `bank_name`
  - `account_name`
  - `account_number`
  - `ifsc_code`
  - `updated_by_admin_id`
  - `updated_at`

### 4.5 Audit Logs

- `admin_audit_logs`:
  - `id`
  - `admin_id`
  - `entity_type` (`USER`, `GRADE_FEE`, `EXTRA_FEE`, `PAYMENT`, `PAYMENT_INFO`)
  - `entity_id`
  - `action` (`CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `DISABLE`)
  - `before_state` (JSON, nullable)
  - `after_state` (JSON, nullable)
  - `created_at`

---

## 5. API Contracts (Logical)

All Admin endpoints are protected by `role = admin` at the Gateway.

### 5.1 User Approval & Account Management

- `GET /admin/users/pending`  
  - Returns list of users awaiting approval (students, teachers, parents).

- `POST /admin/users/:id/approve`  
  - Sets:
    - `status = ACTIVE`
    - `must_change_mpin_on_first_login = true`
    - Default MPIN = `000000` (via user identity domain or secure service call).
  - Writes audit log.

- `POST /admin/users/:id/reject`  
  - Sets status to `DELETED` or `REJECTED`.

- `PATCH /admin/users/:id`  
  - Edit user account details (e.g., name, mobile, role‑specific fields).

- `POST /admin/users/:id/activate` / `POST /admin/users/:id/deactivate`  
  - Toggle `status` (ACTIVE / DISABLED) with audit.

- **Service‑facing** (for Student/Teacher/Parent backends):
  - `GET /internal/admin/users/:id/status`  
    - Returns `status`, `isApproved`, `must_change_mpin_on_first_login`.

### 5.2 Fees & Payment Config

- `GET /admin/fees/grade-configs`  
  - List grade fee configs.

- `POST /admin/fees/grade-configs`  
  - Create/update grade fee for a grade/year.

- `GET /admin/fees/extra-configs/:studentId`  
  - Get extra subject fees for a student.

- `POST /admin/fees/extra-configs/:studentId`  
  - Set or update extra subject fees for a student.

- `GET /admin/fees/payments/:studentId`  
- `POST /admin/fees/payments/:studentId`  
  - CRUD operations for fee payments.

- `GET /admin/fees/summary/:studentId`  
  - Returns `student_fee_summary` (Admin view).

- **Service‑facing** (for Parent backend):
  - `GET /internal/admin/fees/summary/:studentId`  
  - `GET /internal/admin/payment-info`  
    - Used by Parent backend to build fee summary + Pay Info.

### 5.3 Payment Info

- `GET /admin/payment-info`  
  - Admin UI fetches current QR/UPI/bank config.

- `POST /admin/payment-info`  
  - Update QR image and bank/UPI details.

---

## 6. Security & Compliance

- **AuthN**:
  - Admin login via dedicated Admin credentials (separate from student/parent MPIN model).
  - JWT with `role = admin`.

- **AuthZ**:
  - Gateway ensures only admins hit `/admin/**`.
  - Admin backend enforces fine‑grained permissions (if multiple admin roles appear later).

- **Data sensitivity**:
  - User identity data (students, teachers, parents) includes minors’ PII.
  - Fee and payment records include financial data.
  - Payment configuration includes bank and account details.
  - All traffic over HTTPS; DB encrypted at rest; strict DB credentials and roles.

- **Audit**:
  - All changes to:
    - User status and profile data.
    - Grade/extra fee configs.
    - Payment records.
    - Payment info config.
  - Logged with `admin_id`, before/after snapshots, timestamps.

---

## 7. Error Handling & Consistency

- Standard error shape: `{ code, message, details? }`.
- HTTP status codes:
  - 400 for validation errors.
  - 401 for unauthenticated.
  - 403 for non‑admin or missing permission.
  - 404 for missing resources.
  - 409 for conflicting state (e.g., duplicate configs).
  - 500 for internal errors.
- Consistency:
  - Where grade fees or extra fees change, derived summaries are recomputed in a single transaction (or eventual consistency with clear last‑updated timestamps).
  - Downstream consumers (Parent backend) always rely on Admin as single source of truth for fees.

---

## 8. Key Risks & Mitigations

1. **Incorrect fee configuration propagating to many students**  
   - Mitigation:
     - Confirmation dialogs and clear “academic year + grade” context.
     - Audit trail with ability to trace who changed what and when.

2. **Misrecorded payments causing trust issues**  
   - Mitigation:
     - Edit capabilities with full audit.
     - Clear separation of “configured total” vs “recorded payments”.

3. **Unapproved/disabled users accessing the system**  
   - Mitigation:
     - Student/Teacher/Parent backends call Admin status API during login.
     - Gateway or app backends enforce `status = ACTIVE` and `isApproved = true`.

4. **Admin misuse or accidental deletes**  
   - Mitigation:
     - “Soft delete” status instead of hard delete.
     - Confirmation and warnings for destructive actions.

5. **Stale payment info in Parent app**  
   - Mitigation:
     - Parent backend always fetches payment info from Admin service (or caches for short intervals only).

---

## 9. Implementation Order (Architecture‑Aligned)

1. Admin authentication + role enforcement.
2. User approval and account status module (including MPIN default + first‑login flag).
3. Grade fee configuration model and APIs.
4. Extra subject fee configuration model and APIs.
5. Payment entry & summary computation.
6. Payment info configuration (QR/UPI/bank details).
7. Internal service APIs for Student/Teacher/Parent backends.
8. Admin frontend screens:
   - User approval & accounts.
   - Grade fee & extra subject configuration.
   - Payment entry & ledger.
   - Payment info settings.
9. Observability & audit log views.

---

## STANDARD HANDOFF – To UX / UI Agent (Admin App)

**PROJECT**: Mindforge Admin App  
**PHASE**: Architecture → UX / UI (navigation‑first)  
**ARTIFACT SOURCE**: `docs/architecture/admin/Mindforge_Admin_App_Architecture_v1.md`  

### Context summary (for UX)

- Admin app is the **control plane**:
  - Approves/blocks students, teachers, and parents.
  - Configures grade fees and extra subject fees.
  - Records and corrects fee payments.
  - Manages payment info (QR/UPI/bank details) consumed by Parent app.
- Admin actions directly impact:
  - Who can log in.
  - What fee data appears in Parent app.
  - How fee balances and payment histories are computed.

### What UX SHOULD design now

- **Global navigation** for Admin:
  - Suggested sections:
    - Dashboard (overview of pending approvals and key stats).
    - Users (approval & account management).
    - Fees (grade fees & extra subject fees).
    - Payments (entry & history).
    - Payment Info (QR/UPI/bank settings).
    - Audit / Settings (basic view).

- **User Approval flows**:
  - Pending user list with filters by role.
  - User detail drawer/page with:
    - Basic profile.
    - Linked student (for parents).
  - Approve/Reject actions with confirmations and contextual messaging about default MPIN `000000` and first‑login MPIN change.
  - Activate/Deactivate and (soft) Delete flows with clear warning copy.

- **Fees configuration screens**:
  - Grade fee setup:
    - Per grade (8/9/10) with academic year.
    - Clear indication when changes will apply.
  - Extra subject fee management:
    - Per‑student table or detail screen to add/edit extra subject fee rows.

- **Payment entry & tracking screens**:
  - Per‑student fee summary view:
    - Total fee, extra fees, total, paid, balance.
    - Payment history timeline/table.
  - “Record payment” form:
    - Amount, date, mode, reference.
    - Validation and confirmation.
  - Edit/correct payment flow with audit note field.

- **Payment Info configuration screen**:
  - QR image upload UI with preview.
  - Text fields for UPI ID and bank account details.
  - Clear “last updated by / when” indicators.

- **Audit visibility (lightweight)**:
  - Simple log view filtered by entity (user/fee/payment/payment info).

### UX constraints & rules

- Admin operations are **critical and high‑impact**:
  - Require confirmations for destructive or large‑scope actions (e.g., disabling user, changing grade fee mid‑year).
- Clearly communicate:
  - That default MPIN is `000000` and must be changed by user on first login.
  - That Parent app is view‑only and fees are configured + updated from Admin only.
- Keep workflows efficient:
  - Admin users may process many records; lists and bulk‑friendly UI patterns are preferred.

### Open questions for UX / Product

1. Do we need **bulk approval** and **bulk activation/deactivation** in v1, or is per‑user sufficient?  
2. What is the expected **volume of payments per day**, and do we need advanced filters and exports now or later?  
3. How strict should confirmation patterns be (e.g., typed confirmation for deleting users or changing fees mid‑year)?  

### Handoff status

- Admin app architecture and module boundaries are defined and aligned with the overall Mindforge workspace and Student/Teacher/Parent architectures.
- Admin backend is the authoritative source for approval state, fees, payments, and payment info, and exposes read APIs for other apps.
- **UX / UI may now proceed** to design Admin app navigation and screens using this document and the Admin App Product Requirements as constraints.

**Signature**:  
Architect AI Agent – Mindforge Admin App (v1)

