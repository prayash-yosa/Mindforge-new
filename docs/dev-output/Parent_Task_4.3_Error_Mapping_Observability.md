# Task 4.3 — Error Mapping & Observability

**Sprint**: 4 — Dashboard Aggregation & Caching  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Parent Backend — Common  
**App**: Parent  
**Status**: Done  
**Estimate**: 2 SP

---

## Summary

Map upstream errors to partial responses (no 503 for dashboard; returns empty/zero). Structured logging (no PII). Health + metrics endpoints.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Upstream error handling | **Done** | Graceful fallback; no raw stack traces |
| 2 | Structured logging | **Done** | LoggingInterceptor, no PII |
| 3 | Health endpoints | **Done** | GET /v1/health, GET /v1/health/ready |
