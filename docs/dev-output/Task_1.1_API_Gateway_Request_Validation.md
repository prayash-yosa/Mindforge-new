# Task 1.1 — API Gateway and Request Validation

**Sprint**: 1 — Foundation & Auth  
**Labels**: Type: Hardening | AI: Non-AI | Risk: Low | Area: Backend — API  
**Mode**: V2 (Enterprise Delivery)  
**Status**: Done  
**Start Date**: 2026-02-10  
**Completed Date**: 2026-02-10  
**Estimate**: 2 SP

---

## Summary

Implemented the REST API gateway layer for the Mindforge Student Experience backend using Node.js / Express. This is the first backend task — establishing the foundational API layer that all subsequent tasks build upon.

The API layer is strictly a routing and validation layer: it validates incoming requests and delegates to the business layer. There is no database or business logic in the API layer per the architecture specification.

---

## Acceptance Criteria — Checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | REST API layer accepts HTTPS only; JSON request/response | **Done** — HTTPS enforcement middleware (checks `x-forwarded-proto` behind LB); JSON-only body parsing; 415 for non-JSON content types |
| 2 | Request body and query validation in place; invalid input returns 400 and consistent error shape | **Done** — Joi-based `validateRequest` middleware; validates body, query, params; returns 400 with `{ code: "VALIDATION_ERROR", message, details: [{field, message, type}] }` |
| 3 | Error response shape `{ code, message, details? }` for 400, 401, 403, 404, 429, 500 | **Done** — Central `errorHandler` middleware; `AppError` class with factory methods for all HTTP codes; consistent shape on all error responses |
| 4 | Health check endpoint for load balancer | **Done** — `GET /health` returns `{ status: "ok", service, timestamp, uptime }` |
| 5 | No business or DB logic in API layer; delegates to business layer | **Done** — Auth routes delegate to `authService` stubs in business layer; no DB imports anywhere in API layer |

---

## Files Created

```
backend/
├── package.json                           # Dependencies and scripts
├── .env.example                           # Environment template
├── .gitignore                             # Node.js gitignore
├── README.md                              # Project documentation
└── src/
    ├── server.js                          # Entry point with graceful shutdown
    ├── app.js                             # Express app factory
    ├── config/
    │   └── index.js                       # Environment-driven config
    ├── errors/
    │   └── AppError.js                    # Custom error class { code, message, details? }
    ├── api/
    │   ├── routes/
    │   │   ├── index.js                   # Route aggregator
    │   │   ├── health.js                  # GET /health
    │   │   └── auth.js                    # POST /auth/mpin/verify, lockout/status, forgot-mpin
    │   ├── middleware/
    │   │   ├── requestId.js               # Unique X-Request-Id per request
    │   │   ├── httpsEnforce.js            # HTTPS enforcement (behind LB)
    │   │   ├── validateRequest.js         # Joi validation middleware factory
    │   │   ├── notFound.js                # 404 handler
    │   │   └── errorHandler.js            # Central error handler
    │   └── validators/
    │       ├── auth.js                    # Joi schemas for auth endpoints
    │       └── common.js                  # Reusable schemas (pagination, UUID)
    └── business/
        └── index.js                       # Business layer stubs (Task 1.2+)
```

---

## Technology Choices (per Architecture §4)

| Area | Choice | Rationale |
|------|--------|-----------|
| Runtime | Node.js ≥18 | Architecture lists Node.js/Express as primary option |
| Framework | Express 4.x | Stateless API service; clear middleware pipeline |
| Validation | Joi 17 | Robust schema validation with detailed error messages |
| Security | Helmet 8 | Security headers (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | cors 2.x | Configurable cross-origin support |
| Logging | Morgan | HTTP request logging with request ID; no PII |
| Request ID | uuid v4 | Unique `X-Request-Id` for log correlation and audit |

---

## Error Response Shape

All errors follow the architecture-specified shape:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [
    {
      "field": "mpin",
      "message": "MPIN must be exactly 6 digits",
      "type": "string.length"
    }
  ]
}
```

Supported HTTP status codes:

| Code | Error Code | When |
|------|-----------|------|
| 400 | `VALIDATION_ERROR` / `BAD_REQUEST` / `INVALID_JSON` | Invalid input, malformed JSON |
| 401 | `UNAUTHORIZED` | Missing or invalid auth (Task 1.4) |
| 403 | `FORBIDDEN` | Access denied |
| 404 | `NOT_FOUND` | Unknown route or resource |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Non-JSON content type on POST/PUT/PATCH |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded (Task 8.3) |
| 500 | `INTERNAL_ERROR` | Unhandled server errors |

---

## Verification Results

All tests performed via `curl` against running server:

| Test | Expected | Result |
|------|----------|--------|
| `GET /health` | 200 + JSON status | **Pass** — `{ status: "ok", service: "mindforge-backend", timestamp, uptime }` |
| `GET /nonexistent` | 404 + error shape | **Pass** — `{ code: "NOT_FOUND", message: "Route not found: GET /nonexistent" }` |
| `POST /auth/mpin/verify` with `{"mpin":"123"}` | 400 + validation details | **Pass** — MPIN length + pattern errors in details array |
| `POST /auth/mpin/verify` with `{}` | 400 + required field error | **Pass** — `"MPIN is required"` |
| `POST /auth/mpin/verify` with invalid JSON | 400 + JSON parse error | **Pass** — `{ code: "INVALID_JSON" }` |
| `POST /auth/mpin/verify` with `text/plain` | 415 | **Pass** — `{ code: "UNSUPPORTED_MEDIA_TYPE" }` |
| `POST /auth/mpin/verify` with `{"mpin":"123456"}` | Delegates to business layer | **Pass** — Business stub returns 500 (not yet implemented) |
| Response headers | Security headers + X-Request-Id | **Pass** — Helmet headers, HSTS, X-Request-Id UUID |

---

## Dependencies on This Task

The following tasks depend on Task 1.1 being complete:

- **Task 1.2** — MPIN verify and token/session issuance (depends on 1.1)
- **Task 1.3** — Lockout status and Forgot MPIN (depends on 1.2 → 1.1)
- **Task 1.4** — Auth middleware and Bearer token validation (depends on 1.2 → 1.1)

---

## Notes for Next Tasks

1. **Task 1.2**: Implement `authService.verifyMpin()` in `business/index.js`; wire to data access layer; issue JWT/session token.
2. **Task 1.4**: Add auth middleware in `api/middleware/`; apply to protected routes in `routes/index.js`.
3. **Task 8.3**: Rate limiting middleware (`express-rate-limit` or custom with Redis) to be added on `/auth/mpin/verify`.
4. The `_stack` field in 500 error responses is only present in development mode and is stripped in production.
