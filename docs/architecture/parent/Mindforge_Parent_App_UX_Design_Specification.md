# Mindforge Parent App — UX Design Specification (v1, Mobile-focused)

**Artifact name**: Mindforge_Parent_App_UX_Design_Specification_v1  
**Artifact produced by**: UX/UI Designer AI Agent  
**Date**: February 4, 2026  
**Architecture source**: `docs/architecture/parent/Mindforge_Parent_App_Architecture_v1.md`  
**Images folder**: `docs/architecture/parent/images/`

---

## 1. UX System Overview

### UX Principles
- **Read-only, trust-building**: Parents can see everything they need, change nothing by mistake.
- **Mobile-first**: Primary target is phone; desktop/tablet layouts can be derived from these flows.
- **One-child focus**: Every screen clearly scoped to the linked child, no multi-child switching in v1.
- **Calm, informative**: Emphasis on clear numbers, trends, and explanations (not heavy interactions).
- **Alignment with Student/Teacher apps**: Same sage-green / cream / deep-brown palette and typography.

### Global Navigation (Mobile)

Bottom navigation (mobile):

- `Home` (Dashboard)
- `Progress` (Academic Progress)
- `Attendance`
- `Fees`
- `Profile`

All sections are **read-only**.

---

## 2. Key User Flows (Mobile)

### 2.1 Log in with Mobile + MPIN

**Goal**: Let a parent securely access their child’s data.

**Entry**: App launch → Login screen.

**Happy path**:
1. Parent enters registered **phone number**.
2. Parent enters **6-digit MPIN** using numeric keypad UI.
3. App validates via backend; on success, navigates to `Home` with child context loaded.

**Error states**:
- Incorrect MPIN:
  - Message: “Incorrect MPIN. Please try again or contact school admin.”
- Lockout:
  - After N failed attempts, show lockout timer and message “Too many failed attempts. Try again after 15 minutes.”

**Image**: `images/parent-login-mobile.png`

---

### 2.2 View Dashboard (Home)

**Goal**: Give parents a quick, at-a-glance view of how their child is doing.

**Entry**: Post-login landing tab `Home`.

**Happy path**:
1. Parent sees top bar with **Mindforge Parent** logo and child pill `Child: Aarav • Class 8B`.
2. Scrollable cards show:
   - **Latest test**: subject, test name, child marks vs highest marks, short “Good job / Needs improvement” text.
   - **Attendance this month**: large % and “X of Y days present”.
   - **Fees summary**: total, paid, balance.
3. `Quick links` list sends parent to:
   - `View Academic Progress`
   - `View Attendance calendar`
   - `View Fees & Pay Info`

**Image**: `images/parent-mobile-dashboard.png`

---

### 2.3 Academic Progress

**Goal**: Let parents understand academic performance over time by subject and test.

**Entry**: Bottom nav `Progress` or dashboard quick link.

**Happy path**:
1. Screen header: `Academic Progress` + back icon (if deep-linked).
2. Subject filter chips (All / Math / Science / English / …).
3. At top: mini **line chart** “Marks over time” for selected subject with a short textual summary below.
4. Below chart: `Recent tests` list. Each row:
   - Test name
   - Subject icon/label
   - Date
   - Child marks
   - Highest marks
   - Optional “Top 10%” badge.
5. Parent scrolls to see more tests; may tap a row for a more detailed static view (future v1.1, not required here).

**Image**: `images/parent-mobile-progress.png`

---

### 2.4 Attendance (Weekly / Monthly / Yearly)

**Goal**: Provide clear visibility into attendance patterns and specific absent days.

**Entry**: Bottom nav `Attendance` or dashboard quick link.

**Happy path (Monthly view)**:
1. Header: `Attendance` + child pill.
2. Segmented control: `Weekly | Monthly | Yearly` (Monthly selected).
3. Month selector row: `< October 2023 >`.
4. Monthly calendar grid:
   - Each date has a small **green dot** for Present, **red dot** for Absent, or neutral for holidays.
5. Summary section:
   - “This month: **92%** (21/23 days present)”.
   - Mini week bars W1–W4 showing week-wise %.
6. `Absent days this month` list:
   - Each row: date + optional reason (from Teacher/Admin).

**Image**: `images/parent-mobile-attendance.png`  
(**Note**: `images/parent-attendance.png` shows the same concept for desktop.)

---

### 2.5 Fees & Pay Info

**Goal**: Show fee status and static pay instructions, without any in-app payments.

**Entry**: Bottom nav `Fees` or dashboard quick link.

**Happy path**:
1. Header: `Fees & Pay Info`.
2. `Fees Summary` card:
   - Total fees
   - Paid
   - Balance
   - Last payment date
3. Optional `Payment history` list (3–5 latest entries):
   - Date – Amount – Mode/Ref (read-only).
4. Divider heading: `Pay Info (manual payments)`.
5. `Pay Info` card:
   - QR code area.
   - UPI ID.
   - Bank name.
   - Account name.
   - Account number.
   - IFSC.
6. Informational text: “Use your banking app to pay. This app does not process payments.”

**Image**: `images/parent-mobile-fees.png`

---

## 3. Mobile Navigation Map

```text
Login → Home (Dashboard)

Home (Dashboard)
  ↓ quick links
  → Progress (Academic Progress)
  → Attendance
  → Fees & Pay Info

Bottom Nav:
  Home | Progress | Attendance | Fees | Profile

Profile (not detailed here):
  • Parent details (name, phone, relationship)
  • Linked child summary (name, class, section)
  • Static “Contact school” info
```

---

## 4. Screen Reference Summary (Mobile)

- `parent-login-mobile.png` – MPIN login (phone + 6-digit MPIN, lockout messaging).
- `parent-mobile-dashboard.png` – Dashboard with latest test, attendance %, fees summary, quick links.
- `parent-mobile-progress.png` – Academic Progress with subject filters, marks-over-time chart, recent tests list.
- `parent-mobile-attendance.png` – Attendance with monthly calendar, summary %, absent-days list.
- `parent-mobile-fees.png` – Fees summary + Pay Info for manual payments only.

All are stored in `docs/architecture/parent/images/`.

---

## 5. Accessibility & Content Notes

- **Clear labels**: Each card and chart has a textual label and summary (no data-only charts).
- **Color + text**: Present/Absent status uses both color and icons/text (e.g., dot + legend, “Absent” in list).
- **Tap targets**: Buttons and list items meet 44×44px minimum.
- **Read-only clarity**: Fees screen contains explicit copy stating that payments happen outside the app.
- **Single-child focus**: Child context is always visible in header or top of screen.

---

## STANDARD HANDOFF (Parent App UX → Planner → Dev)

- **Screens covered (mobile)**:
  - Login (phone + MPIN).
  - Dashboard (Home).
  - Academic Progress.
  - Attendance.
  - Fees & Pay Info.
- **Images**:
  - `parent-login-mobile.png`
  - `parent-mobile-dashboard.png`
  - `parent-mobile-progress.png`
  - `parent-mobile-attendance.png`
  - `parent-mobile-fees.png`
- **Constraints obeyed**:
  - Strictly **read-only** across academic, attendance, and fees.
  - Clear one-child scope derived from `linkedStudentId`.
  - No payment initiation; Pay Info is informational only.

**Next steps**:
- **Planner Agent**:
  - Break this UX spec into implementation epics/stories for `apps/parent/frontend` (routes, screens, navigation shell, integration with existing APIs).
- **Developer Agent**:
  - Implement mobile-first React/Vite screens following this contract (no backend shape changes beyond Architecture v1).

