# Task 5.1 — GET /student/attendance (Summary and Calendar)

**Sprint**: 5 — Attendance & Doubts API  
**Status**: Done  
**Completed**: 2026-02-17  
**Estimate**: 2 SP

---

## Checklist

- [x] `GET /v1/student/attendance` accepts query: period (this_month, last_month, this_term) or explicit startDate/endDate
- [x] Returns summary (present, absent, late counts, attendancePercent) and per-day calendar (P/A/L)
- [x] Auth required; scoped by student_id; read-only
- [x] Empty and error states supported (0 counts + empty calendar when no data)
- [x] DTO validation: enum for period, regex for YYYY-MM-DD, proper error messages

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/modules/attendance/attendance.controller.ts` | HTTP layer — delegates to AttendanceService |
| `backend/src/modules/attendance/dto/attendance-query.dto.ts` | DTO with period enum + date regex validation |

### Files Modified

| File | Change |
|------|--------|
| `backend/src/modules/attendance/attendance.module.ts` | Added AttendanceController registration |

### Endpoint

```
GET /v1/student/attendance
  Query: period=this_month|last_month|this_term  (default: this_month)
     OR: startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  Auth: Bearer token required
```

### Response Shape

```json
{
  "summary": {
    "studentId": "uuid",
    "period": { "startDate": "2026-02-01", "endDate": "2026-02-28" },
    "totalDays": 10,
    "present": 8,
    "absent": 2,
    "late": 0,
    "attendancePercent": 80
  },
  "calendar": [
    { "date": "2026-02-07", "status": "absent" },
    { "date": "2026-02-08", "status": "present" }
  ]
}
```

### Key Decisions

- **Period shortcuts**: `this_month`, `last_month`, `this_term` (academic: Apr–Sep / Oct–Mar)
- **Timezone-safe**: Uses `getFullYear()/getMonth()/getDate()` instead of `toISOString()` to avoid UTC shift
- **Default period**: `this_month` when no params provided
- **Read-only**: No write endpoint for students per architecture

---

## Verification

```bash
# Default (this_month)
curl -s http://localhost:3000/v1/student/attendance -H "Authorization: Bearer $TOKEN"

# Explicit dates
curl -s "http://localhost:3000/v1/student/attendance?startDate=2026-02-01&endDate=2026-02-17" -H "Authorization: Bearer $TOKEN"

# Validation errors
curl -s "http://localhost:3000/v1/student/attendance?period=invalid" -H "Authorization: Bearer $TOKEN"
# → 400: "period must be one of: this_month, last_month, this_term"
```
