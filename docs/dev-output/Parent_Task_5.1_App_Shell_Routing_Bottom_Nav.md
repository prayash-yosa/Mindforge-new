# Task 5.1 — App Shell, Routing, Bottom Nav

**Sprint**: 5 — Parent Frontend: Shell, Login & Home  
**Labels**: Type: Feature | AI: Non-AI | Risk: Low | Area: Parent Frontend  
**App**: Parent  
**Status**: Done  
**Estimate**: 2 SP

---

## Summary

React + Vite. Routes: /login, /home, /progress, /attendance, /fees, /profile. Bottom nav: Home | Progress | Attendance | Fees | Profile. Auth guard: redirect to /login if no token. Proxy: /v1 to Parent backend (localhost:3002).

---

## Acceptance Criteria — Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | Routes | **Done** | React Router, ProtectedRoute |
| 2 | Bottom nav | **Done** | BottomNav component |
| 3 | Auth guard | **Done** | useAuth, Navigate to /login |
| 4 | Proxy | **Done** | vite.config.ts /v1 → 3002 |
