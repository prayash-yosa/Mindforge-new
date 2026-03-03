# Task 7.1 — Fees & Pay Info Screen

**Sprint**: 7 — Frontend Fees & Profile  
**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend — Fees  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Fees summary card (total, paid, balance, lastPaymentDate). Optional payment history. Pay Info: QR code, UPI ID, bank details. Copy: "Use your banking app to pay. This app does not process payments."

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Fees summary card | **Done** | FeesScreen |
| 2 | Optional history | **Done** | GET /v1/parent/child/fees/history |
| 3 | Pay Info | **Done** | QR, UPI, bank, account, IFSC |
| 4 | Disclaimer | **Done** | "Use your banking app to pay..." |
