# Task 5.2 — Login Screen

**Sprint**: 5 — Parent Frontend: Shell, Login & Home  
**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Frontend  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Mobile input plus 6-digit MPIN keypad. Calls POST /v1/parent/auth/login. Handles incorrect MPIN, lockout (show retry-after), network errors. On success: store token, navigate to Home.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Mobile input | **Done** | 10-digit validation |
| 2 | 6-digit MPIN keypad | **Done** | On-screen keypad, dots |
| 3 | POST /v1/parent/auth/login | **Done** | AuthContext.login |
| 4 | Handle lockout | **Done** | LOCKED_OUT, retryAfter, countdown |
| 5 | On success navigate | **Done** | navigate to /home |
