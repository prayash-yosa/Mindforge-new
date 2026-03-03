# Parent App — Cross-App Integration & Aggregation Rules

**Sprint 8.3** | Cross-app integration validation

---

## Data Flow

| Source | Parent Consumes | Mapping |
|--------|-----------------|---------|
| Teacher | Progress (tests, scores) | `studentExternalId` (e.g. 12131) = Teacher `class_student.studentId` |
| Teacher | Attendance (calendar) | Same `studentExternalId` per class; merge across classes |
| Parent DB | `parent_accounts.student_external_id` | Links Parent → Teacher studentId |
| Config | Fees, Pay Info | Stub when Admin unavailable |

---

## Aggregation Rules

### Progress
- Fetch classes from `GET /v1/cross-app/classes`
- For each class: `GET /v1/cross-app/performance/:classId` → scoreTrends (test list)
- For each test: `GET /v1/cross-app/performance/student/:studentId/test/:testId` → child marks
- Merge tests across classes; sort by date desc

### Attendance
- For each class: `GET /v1/cross-app/attendance/student/:studentId/class/:classId/calendar?from=&to=`
- Merge calendar: if same date in multiple classes, absent overrides present
- Compute present/absent counts and percent from merged calendar

### Dashboard
- Latest test: most recent by date from Progress
- Attendance this month: from Teacher calendar for current month
- Fees: from config stub

---

## Validation Checklist

- [x] Parent attendance % matches Teacher for same student (when Teacher has data)
- [x] Parent progress test results match Teacher evaluation
- [x] No client-supplied studentId; all from JWT linkedStudentId
- [x] parent_accounts.student_external_id required for Teacher sync
