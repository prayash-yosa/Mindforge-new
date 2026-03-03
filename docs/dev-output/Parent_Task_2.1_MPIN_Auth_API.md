# Task 2.1 — Parent MPIN Auth API (Mobile + MPIN)

**Sprint**: 2 — Parent Auth & Linkage  
**Labels**: Type: Feature | AI: Non-AI | Risk: Medium | Area: Parent Backend — Auth  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Implemented `POST /v1/parent/auth/login` accepting `mobileNumber` and `mpin`. Validates credentials, returns JWT with `sub`, `role`, `linkedStudentId`. MPIN stored as bcrypt hash; generic error on failure.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | POST /v1/parent/auth/login | **Done** | LoginDto validation; AuthService.login |
| 2 | MPIN hashed only; never in logs | **Done** | bcrypt.hash; no mpin in logger |
| 3 | Generic error on failure | **Done** | "Invalid credentials" (no hint mobile vs MPIN) |

---

## API

**POST /v1/parent/auth/login**

Request: `{ mobileNumber: string, mpin: string }`

Response: `{ accessToken: string, expiresIn: string, tokenType: "Bearer" }`

Errors: 401 INVALID_CREDENTIALS, 401 LOCKED_OUT (with retryAfter)
