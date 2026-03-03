# Task 3.3 — Fees & Pay Info APIs

**Sprint**: 3 — Read APIs: Progress, Attendance, Fees, Pay Info  
**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Backend — Fees  
**App**: Parent  
**Status**: Done  
**Estimate**: 2 SP

---

## Summary

Implemented `GET /v1/parent/child/fees/summary`, `GET /v1/parent/child/fees/history`, `GET /v1/parent/child/fees/pay-info`. Stub from config/env when Admin service unavailable. No payment initiation; informational only.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | GET /v1/parent/child/fees/summary | **Done** | total, paid, balance, lastPaymentDate from config |
| 2 | GET /v1/parent/child/fees/history | **Done** | Optional list (stub) |
| 3 | GET /v1/parent/child/fees/pay-info | **Done** | qrCodeUrl, upiId, bankName, accountName, accountNumber, ifsc from config |
| 4 | No payment initiation | **Done** | Read-only |

---

## Config

FEES_TOTAL, FEES_PAID, PAY_INFO_UPI_ID, PAY_INFO_QR_URL, PAY_INFO_BANK_NAME, PAY_INFO_ACCOUNT_NAME, PAY_INFO_ACCOUNT_NUMBER, PAY_INFO_IFSC
