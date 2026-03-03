# Task 7.3 — Empty/Error/Offline States

**Sprint**: 7 — Frontend Fees & Profile  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Frontend — UX Polish  
**App**: Parent  
**Status**: Done  
**Estimate**: 3 SP

---

## Summary

Consistent loading, error, empty, offline across all screens. No partial or misleading data when upstreams fail. OfflineBanner when navigator.onLine is false.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Loading states | **Done** | Skeleton, Loading on all screens |
| 2 | Error states | **Done** | ErrorCard plus retry button |
| 3 | Empty states | **Done** | No data messages |
| 4 | Offline | **Done** | OfflineBanner, API client detects offline |
