# Mindforge Admin App — UX Design Specification (v1)

**Artifact name**: Mindforge_Admin_App_UX_Design_Specification_v1  
**Artifact produced by**: UX/UI Designer AI Agent  
**Date**: February 4, 2026  
**Architecture source**: `docs/architecture/admin/Mindforge_Admin_App_Architecture_v1.md`  
**Images folder**: `docs/architecture/admin/images/`

---

## 1. UX System Overview

### UX Principles

- **Control-plane clarity**: Admins see the state of the system (users, fees, payments) at a glance.
- **Safety over speed**: Destructive or high-impact actions are guarded with confirmations and context.
- **Bulk-friendly**: Lists and filters support day-to-day admin workflows.
- **Single source of truth**: UI reflects that Admin is authoritative for approvals and fees.
- **Consistent with other apps**: Same sage green / cream / deep brown palette and typography.

### Primary Navigation (Desktop Sidebar)

- `Dashboard`
- `Users` (Approvals & Accounts)
- `Fees` (Grade fees & extra subject fees)
- `Payments` (Fee ledger & entry)
- `Payment Info` (Parent app pay config)
- `Audit Logs` (v1: simple log view)

---

## 2. Key Admin Flows

### 2.1 Review & Approve Users

**Goal**: Approve or reject pending student/teacher/parent accounts and manage statuses.

**Entry**: Sidebar → `Users`, or Dashboard → Pending approvals table.

**Happy path**:
1. Admin filters by role (`Students` / `Teachers` / `Parents`) and status `Pending`.
2. Admin selects a row → user detail panel opens on the right (profile + linked students for parents).
3. Admin clicks **Approve**:
   - Confirmation modal explains:
     - Default MPIN will be `000000`.
     - User must change MPIN on first login.
   - On confirm:
     - Status becomes **Active**.
     - Audit log written.
4. If user should not be approved, admin clicks **Reject** or **Disable** with reason.

**States**:
- Filters: All / Students / Teachers / Parents; Pending / Active / Disabled.
- Row badges for status (Pending, Active, Disabled).
- Confirmation dialogs on Approve, Reject, Activate, Deactivate, Delete.

**Image**: `images/admin-users.png`

---

### 2.2 Configure Grade Fees & Extra Subject Fees

**Goal**: Configure base annual fees per grade and additional fees for specific subjects/students.

**Entry**: Sidebar → `Fees`.

**Grade fees (happy path)**:
1. Admin lands on `Grade fees` tab.
2. Table shows rows for grades (8, 9, 10) with Academic year, Total annual fee, Last updated, Updated by.
3. Admin clicks **Edit** for Grade 9:
   - Fee cell becomes editable.
   - Warning line above table: “Changes affect fee summaries for all Grade 9 students.”
4. Admin edits amount and clicks **Save**:
   - Confirmation tooltip/message appears.
   - On success, Last updated and Updated by refresh; audit log written.

**Extra subject fees (entry)**:
1. Admin clicks `Manage per-student extra subject fees`.
2. Opens per-student screen (not fully detailed here) to add/edit extra subject fee rows.

**Image**: `images/admin-fees.png`

---

### 2.3 Record & Correct Fee Payments

**Goal**: Keep accurate fee ledgers per student.

**Entry**: Sidebar → `Payments`.

**Happy path**:
1. Admin searches for student by name/ID and selects academic year.
2. **Student fee summary** card shows:
   - Base fee, extra fees, total, paid, balance, last payment.
3. **Payment history** table lists payments with Date, Amount, Mode, Reference, Recorded by.
4. Admin clicks **Record new payment**:
   - Modal opens with fields: Date, Amount, Mode (dropdown), Reference.
   - Small note: “Admin-only manual entry. Please verify details before saving.”
5. Admin submits:
   - Payment appears in history and summary updates.
6. To correct a payment, admin clicks **Edit** on a row:
   - Modal allows changing fields and requires a short audit note (future enhancement) before saving.

**Image**: `images/admin-payments.png`

---

### 2.4 Configure Payment Info for Parent App

**Goal**: Configure static payment details that Parent app displays read-only.

**Entry**: Sidebar → `Payment Info`.

**Happy path**:
1. Admin sees `Pay Info (Parent App)` card.
2. Left side: QR code preview with **Upload new QR** button.
3. Right side: text fields for UPI ID, Bank name, Account name, Account number, IFSC.
4. Info banner at top: “This information appears read-only in the Parent app. No payments are processed here.”
5. Admin makes changes and clicks **Save changes**:
   - Success toast; footer text updates: “Last updated by [Admin] on [timestamp].”

**Image**: `images/admin-payment-info.png`

---

### 2.5 Monitor Dashboard

**Goal**: Quick view of system state and entry points to detailed screens.

**Entry**: Sidebar → `Dashboard`.

**Dashboard content**:
- KPI cards:
  - Pending approvals (count).
  - Active students.
  - Outstanding fees (total unpaid).
  - Payments recorded this month.
- `Pending user approvals` table with Approve/Reject actions.
- `Fee collection this term` chart.
- `Recent fee payments` list with amounts and timestamps.

**Image**: `images/admin-dashboard.png`

---

## 3. Navigation Map (Desktop)

```text
Sidebar:
  Dashboard
  Users
  Fees
  Payments
  Payment Info
  Audit Logs

Dashboard:
  → Users (pending approvals)
  → Payments (recent payments)
  → Fees (grade fees needing attention)
```

---

## 4. Screen Reference Summary

- `admin-dashboard.png` – Admin dashboard (KPIs, pending approvals, fee collection, recent payments).
- `admin-users.png` – User Approvals & Accounts (filters, detail panel, approval modal).
- `admin-fees.png` – Fees Configuration (grade fees table + extra subject entry).
- `admin-payments.png` – Payments ledger with student summary and record-payment modal.
- `admin-payment-info.png` – Payment Info configuration (QR/UPI/bank fields).

All images are in `docs/architecture/admin/images/`.

---

## STANDARD HANDOFF (Admin App UX → Planner → Dev)

- **Screens covered**:
  - Dashboard.
  - Users (approvals & account statuses).
  - Fees (grade + extra subject fees).
  - Payments (entry & ledger).
  - Payment Info configuration.
- **Images**:
  - `admin-dashboard.png`
  - `admin-users.png`
  - `admin-fees.png`
  - `admin-payments.png`
  - `admin-payment-info.png`
- **Constraints obeyed**:
  - Admin is source of truth for approvals, fees, payments, payment info.
  - High-impact operations always gated with confirmations and warnings.
  - No payment gateway actions; Admin only records payments and configures static info.

**Next steps**:

- **Planner Agent**:
  - Break this UX into implementation epics/stories for `apps/admin/frontend` (routes, pages, components, state management, API wiring).
- **Developer Agent**:
  - Implement React/Vite admin UI according to this spec and architecture v1, reusing shared components and design tokens from Mindforge.

