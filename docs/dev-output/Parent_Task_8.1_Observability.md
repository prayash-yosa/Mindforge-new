# Task 8.1 — Parent Service Observability

**Sprint**: 8 — Hardening & Validation  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: DevOps / Parent Backend  
**App**: Parent  
**Status**: Done  
**Estimate**: 2 SP

---

## Summary

Structured logs. Health and metrics endpoints. Startup diagnostics for DB and Teacher connectivity. GET /v1/health/integration.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Structured logs | **Done** | LoggingInterceptor, no PII |
| 2 | Health probes | **Done** | /v1/health, /v1/health/ready |
| 3 | Startup diagnostics | **Done** | /v1/health/integration: DB, Teacher |
