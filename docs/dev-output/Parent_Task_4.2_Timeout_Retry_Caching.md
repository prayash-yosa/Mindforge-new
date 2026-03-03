# Task 4.2 — Timeout, Retry, Caching

**Sprint**: 4 — Dashboard Aggregation & Caching  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Parent Backend — Integration  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

HTTP client timeout 5s; retry 1 for upstream (Teacher). Optional Redis cache for dashboard deferred. Fallback: partial dashboard with empty/zero data when upstream fails.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | HTTP timeout 5s | **Done** | TeacherSyncService timeoutMs |
| 2 | Retry 1 for upstream | **Done** | retryCount in TeacherSyncService |
| 3 | Fallback on upstream failure | **Done** | Returns partial dashboard (null/zero) |

---

## Config

TEACHER_SYNC_TIMEOUT_MS=5000, TEACHER_SYNC_RETRY_COUNT=1
