# Task 2.2 — Lockout & Rate Limiting for Parent Login

**Sprint**: 2 — Parent Auth & Linkage  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Medium | Area: Parent Backend — Auth  
**App**: Parent  
**Status**: Done  
**Estimate**: 2 SP

---

## Summary

Implemented lockout after 5 failed MPIN attempts; 15-minute lockout. Counters reset on success. Returns 429 with retryAfter when locked out. Login attempts recorded in parent_login_attempts.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Attempt tracking with thresholds | **Done** | In-memory lockouts Map; 5 attempts → 15 min |
| 2 | Lockout status for frontend | **Done** | 401 LOCKED_OUT with retryAfter seconds |
| 3 | Counters reset on success | **Done** | lockouts.delete(parent.id) on valid login |

---

## Thresholds

| Setting | Value |
|---------|-------|
| Failed attempts before lockout | 5 |
| Lockout duration | 15 minutes |
