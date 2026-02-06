# Mindforge Student Experience — Technical Architecture (Final)

**Artifact name**: Mindforge_Student_Experience_Technical_Architecture_Final  
**Suggested file path**: docs/architecture/final/Mindforge_Student_Experience_Technical_Architecture_Final.md  
**Project**: Mindforge Student Experience  
**Date**: February 6, 2026  
**Mode**: Architect AI Agent (Final Mode)

**Constraints locked**:
- Light Architecture: `docs/Mindforge_Student_Experience_Light_Architecture_v2.md`
- UX Specification (Approved): `docs/Mindforge_Student_Experience_UX_Design_Specification.md` — **no UX or feature changes**.

---

## 1. Activated Modes Summary

| Mode | Trigger | Application |
|------|---------|-------------|
| **Strategy & Discovery** | Multi-platform (Android, iOS, desktop), single backend, sync requirements | Architecture boundaries and component ownership defined; no scope creep. |
| **Governance & Architecture Lock** | UX approved; downstream planning/development depends on this artifact | This document is the technical contract; no feature additions. |
| **AI-First / Cloud-Native** | AI roles (Homework Generator, Quiz Engine, Doubt Solver, Gap-Bridge), India single-region deployment | AI components, cost tiers, and cloud deployment assumptions documented. |
| **Security-by-Design** | PII (students, minors), 6-digit MPIN, educational records, attendance data | AuthN/AuthZ, data protection, and threat mitigations defined. |

---

## 2. Assumptions & Constraints

### Assumptions
- **Identity provisioning**: Account creation (e.g. phone/identifier binding) is done by a separate provisioning flow; this architecture consumes “student identity” and **MPIN verification** only.
- **NotebookLM**: Daily teaching feeds (per-class summaries) are available via a read-only integration; exact API/schema deferred to integration phase; fallback to syllabus-level content when feed is missing.
- **Attendance source**: Attendance records (present/absent per day) are available to the backend (source TBD); student-facing UX is read-only; no self-correction of attendance in scope.
- **Single region**: Initial deployment is India-focused; multi-region not required in this phase.
- **No full offline**: Partial caching and queued actions; no full offline app experience in v1.
- **Scale (light)**: Single-region, moderate user growth; no global multi-region consistency design.

### Constraints (from Light Architecture + UX)
- **UX locked**: Screens, navigation (Home, Attendance, Doubts, Profile), flows, and states are as per UX spec — no changes.
- **6-digit MPIN only** for student login; rate limiting and lockout mandatory.
- **AI behavior**: Progressive guidance (Hints → Approach → Concept → Solution); no direct answers by default; syllabus-aligned content only.
- **Platforms**: Android app, iOS app, desktop browser; shared backend and data model; sync across devices.
- **Low bandwidth**: Small payloads, lazy-load AI/rich media, usable on unstable 3G.
- **Data sensitivity**: PII and educational/attendance data; encryption in transit (HTTPS); encryption at rest recommended; minimal PII to AI providers (pseudonymous IDs).

---

## 3. High-Level Architecture

### 3.1 Components

| Layer | Component | Description |
|-------|-----------|-------------|
| **Client** | **UI / Navigational layer** | Android app, iOS app, Web app. Handles routes/screens (Login, Home, Activity, Results, Attendance, Doubts, Profile), bottom nav/sidebar, and all UX states per spec. |
| **Client** | **API client / sync** | Calls backend APIs; handles auth (MPIN-derived token); optional local queue for offline actions and sync state. |
| **Backend** | **API / Gateway layer** | REST API; request validation; auth (token/session); rate limiting; routing to business layer. |
| **Backend** | **Business logic layer (middle layer)** | Application services: auth (MPIN verify, lockout), today’s plan, activity lifecycle, grading rules, AI orchestration, attendance aggregation, doubt context. No direct DB access. |
| **Backend** | **Data access layer (database interaction layer)** | Repositories/DAOs: CRUD and queries for students, activities, questions, responses, attendance, syllabus, AI logs. Abstracts DB. |
| **Backend** | **Database** | Persistent store for users, syllabus, content, attempts, attendance, sessions. |
| **External** | **NotebookLM integration** | Read-only teaching feed (daily summaries). |
| **External** | **AI provider(s)** | Stateless generation/evaluation; no persistent student data on provider side. |

### 3.2 Responsibilities

- **UI / Navigational layer**: Render screens per UX spec; manage navigation (e.g. `/login`, `/home`, `/activity/:type/:id`, `/results/:type/:id`, `/attendance`, `/doubts`, `/profile`); handle loading/error/empty/offline states; collect user input and call API client.
- **API layer**: Validate input; authenticate requests; enforce rate limits; delegate to business layer; return consistent JSON and HTTP status codes.
- **Business logic layer**: Implement use cases (login, today’s plan, start/submit activity, evaluate answer, fetch AI guidance, attendance summary, doubt with syllabus context); enforce pedagogical and business rules; call data access layer and external services (AI, NotebookLM).
- **Data access layer**: Execute all DB reads/writes; map domain objects to/from DB schema; ensure queries are efficient and scoped by student/tenant where applicable.
- **Database**: Persist students, syllabus (class/subject/chapter/topic), activities (homework/quiz/test), questions, responses, grades, attendance, doubt threads, sessions, and audit data.

### 3.3 Communication Patterns

- **Client ↔ Backend**: REST over HTTPS; JSON request/response; Bearer token (or session cookie) after MPIN login.
- **API layer → Business layer**: In-process calls (e.g. service interfaces); DTOs or domain objects.
- **Business layer → Data access layer**: In-process calls (repositories); domain or DTOs.
- **Business layer → AI**: Outbound HTTP to AI provider(s); prompts include only minimal context (e.g. pseudonymous IDs, syllabus scope); responses validated and then persisted via data access layer.
- **Business layer → NotebookLM**: Read-only HTTP; daily feed consumed by homework/quiz generation.
- **Sync**: Client polls or uses short-polling/SSE for “today’s plan” and activity state; conflict resolution (e.g. “newer progress on another device”) handled in business layer and exposed via API.

---

## 4. Technology Stack

| Area | Choices | Rationale |
|------|---------|-----------|
| **Frontend** | Cross-platform: React Native (or Flutter) for Android/iOS; React (or Next.js) for web. Shared UX spec and API contract. | Single team can maintain one UX spec across three surfaces; reuse of logic and API client. |
| **Backend** | Stateless API service (e.g. Node.js/Express, or Java/Spring Boot, or Go). | Fits single-region, horizontal scaling; clear separation of API, business, and data layers. |
| **Data** | Primary DB: PostgreSQL (or MySQL). Optional cache: Redis (sessions, rate limits, optional response cache). | Relational model fits students, syllabus, activities, attendance; Redis for rate limiting and session. |
| **Cloud & DevOps** | Single region (e.g. AWS/GCP in India). API behind load balancer; containers (e.g. Docker/Kubernetes or managed app runtime). DB managed (RDS/Cloud SQL). Secrets in vault. | Aligns with India-focused, single-region assumption. |
| **AI** | LLM/GenAI via provider API (e.g. OpenAI-compatible or Google). Structured evaluation for MCQs where possible. | Stateless AI; cost control via tiering (cheap for grading, higher for doubt/concept). |

---

## 5. API & Data Model Overview

### 5.1 Database (High-Level)

- **students**: identity (id, external_id for provisioning), class, board, school, display_name; no password; MPIN hash (or equivalent) for verification; consent flags.
- **syllabus_metadata**: class, board, subject, chapter, topic (normalized hierarchy).
- **teaching_feed**: ingested NotebookLM daily summaries (class, date, summary, key points); read by business layer for homework/quiz generation.
- **activities**: homework/quiz/test instances (student_id, type, syllabus ref, status, created_at, due_at).
- **questions**: question bank (syllabus ref, type, content, correct answer / rubric); linked to activities.
- **responses**: student_id, question_id, activity_id, attempt payload, score, feedback_level, ai_conversation_ref.
- **attendance**: student_id, date, status (present/absent), source_label; optionally period/term.
- **doubt_threads**: student_id, syllabus context (class, subject, chapter, topic), messages (role, content), created_at.
- **sessions**: student_id, token_or_session_id, device_info, created_at, expires_at; used for auth and optional lockout.
- **audit_log**: sensitive operations (login attempts, lockouts, data access) for security and compliance.

Indexes and constraints: by student_id, activity_id, date (attendance), and syllabus keys for fast lookups.

### 5.2 API Endpoints (to interact with database via business + data layers)

All below are **logical**; actual paths and HTTP verbs follow REST conventions. Auth required except where noted.

| Domain | Method | Path (logical) | Purpose | Layer flow |
|--------|--------|----------------|---------|-------------|
| **Auth** | POST | `/auth/mpin/verify` | Verify MPIN; return token/session; apply rate limit and lockout | API → Business (auth service) → Data (sessions, students) |
| **Auth** | POST | `/auth/lockout/status` | Check lockout state (e.g. after failed attempts) | API → Business → Data |
| **Auth** | POST | `/auth/forgot-mpin` | Initiate MPIN recovery (e.g. send OTP to registered contact) | API → Business → Data / external |
| **Today’s plan** | GET | `/student/today` | Today’s tasks (homework, quiz, gaps), progress summary | API → Business → Data (activities, responses, attendance) |
| **Activities** | GET | `/student/activities/:type/:id` | Get activity + questions (e.g. for Activity screen) | API → Business → Data |
| **Activities** | POST | `/student/activities/:type/:id/respond` | Submit answer; evaluate; optionally request AI feedback | API → Business → Data + AI → Data |
| **Activities** | GET | `/student/activities/:type/:id/feedback` | Get AI feedback (next level) for current question | API → Business → AI + Data |
| **Activities** | POST | `/student/activities/:type/:id/pause` | Save progress and pause (e.g. exit mid-activity) | API → Business → Data |
| **Results** | GET | `/student/results/:type/:id` | Get activity result (score, breakdown, next suggestions) | API → Business → Data |
| **Attendance** | GET | `/student/attendance` | Summary + calendar (present/absent by day); query params: period | API → Business → Data (attendance) |
| **Doubts** | GET | `/student/doubts` | List threads or current thread | API → Business → Data |
| **Doubts** | POST | `/student/doubts` | Create message with syllabus context (class, subject, chapter, topic) | API → Business → AI + Data |
| **Doubts** | GET | `/student/doubts/:threadId` | Get thread messages | API → Business → Data |
| **Syllabus** | GET | `/student/syllabus/tree` | Class → Subject → Chapter → Topic (for Doubts context selector) | API → Business → Data |
| **Profile** | GET | `/student/profile` | Display name, class, board, progress overview | API → Business → Data |
| **Sync** | GET | `/student/sync/status` | Last sync timestamp; conflict hint if any | API → Business → Data |

Implementations **must** use the **middle layer** for all business rules (e.g. grading, lockout, AI level); the **data access layer** is the only layer that talks to the database.

### 5.3 Data Flow (example: submit answer)

1. Client: `POST /student/activities/homework/:id/respond` with `{ questionId, answer, requestFeedbackLevel? }`.
2. API layer: Validate body, check auth, rate limit → call business layer.
3. Business layer: Load activity and question (via data access); evaluate (deterministic or AI); if AI feedback requested, call AI then persist (via data access); update progress; return result DTO.
4. Data access layer: Run DB reads/writes (responses, activities, audit).
5. API layer: Return 200 + result (e.g. correct/incorrect, feedback text, next question or completion).

---

## 6. Error Handling Strategy

- **API layer**: Consistent error response shape: `{ code, message, details? }`; HTTP status (4xx/5xx) per case; validation errors 400; auth 401; forbidden 403; not found 404; rate limit 429; server errors 500.
- **Business layer**: Domain exceptions (e.g. InvalidMPIN, LockedOut, ActivityNotFound); map to API codes and messages; never expose internal stack to client.
- **Data layer**: Transient DB errors → retry with backoff; duplicate/key errors → mapped to 409 or domain message; connection failures → 503 or retry.
- **AI**: Timeout (e.g. 10s) → return fallback (e.g. standard hint from syllabus); provider error → “Couldn’t get feedback. Try again?” and optional cached hint; no raw AI errors to client.
- **Client (per UX)**: Inline validation; network errors with retry and “Save offline” where specified; AI failure with “View Standard Hint” / “Try Again”; session timeout modal; sync conflict modal (“Use latest?” / “Keep current”).
- **Logging**: Log errors with request id and no PII; audit security events (failed logins, lockouts).

---

## 7. Deployment Assumptions

- **Single region**: India (e.g. ap-south-1 or equivalent); no multi-region DB or active-active in this phase.
- **API**: Deployed behind HTTPS load balancer; horizontal scaling of stateless API instances.
- **Database**: Managed RDBMS (e.g. RDS/Cloud SQL); automated backups; encryption at rest; access only from API/backend network.
- **Secrets**: API keys, DB credentials, AI keys in vault (e.g. AWS Secrets Manager / GCP Secret Manager); no secrets in code or client.
- **CI/CD**: Build and test on commit; deploy to staging then production via pipeline; DB migrations versioned and applied in deploy.
- **Monitoring**: Health checks, latency and error metrics, alerting on 5xx and auth failures.
- **Clients**: Android/iOS via app stores; Web via CDN or same origin as API (CORS configured).

---

## 8. Security Architecture

- **AuthN**: 6-digit MPIN verified by backend; on success issue short-lived token (or session); token sent as Bearer (or cookie). No MPIN in logs or client storage beyond secure entry.
- **AuthZ**: All student endpoints scoped by authenticated student_id; no cross-student access; role `student` only in this scope.
- **Data protection**: HTTPS only; PII and educational data encrypted at rest; DB access only from data access layer with least privilege; minimal PII in AI prompts (pseudonymous IDs).
- **Threat mitigations**: Rate limiting and lockout on MPIN (per Light Architecture R7); input validation and parameterized queries to prevent injection; audit log for sensitive actions; dependency scanning in CI.

---

## 9. AI Architecture & Governance

- **Model strategy**: Use LLM for doubt solving, conceptual explanations, and adaptive feedback; prefer deterministic or cheaper structured evaluation for MCQs and simple grading.
- **Data flow**: Prompts include syllabus context (class, subject, chapter, topic) and question/attempt; no raw PII; responses validated (e.g. syllabus alignment check) before storage and display.
- **Cost & drift**: High-frequency simple checks use cheaper/smaller models or rules; expensive calls for doubt/concept; monitor token usage and set caps; periodic review of AI outputs for syllabus drift and over-helping (Light Architecture R1, R2).

---

## 10. Key Technical Decisions & Trade-offs

| Decision | Trade-off |
|----------|-----------|
| **Three-tier backend (API → Business → Data)** | Clear separation and testability vs. extra hops; chosen for maintainability and safe evolution. |
| **Single DB (PostgreSQL)** | Simplicity and ACID for activities/attendance vs. eventual need for read replicas if scale grows. |
| **REST over HTTPS** | Wide client support and simplicity vs. no built-in real-time; acceptable for poll/SSE-based sync. |
| **MPIN-only auth** | UX simplicity for students vs. weaker security; mitigated by rate limit, lockout, and optional biometric layer. |
| **AI stateless** | No student data at provider vs. latency and dependency on provider; fallbacks and caching reduce impact. |
| **Attendance read-only for student** | Trust and consistency vs. no self-service correction; aligns with Light Architecture. |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **R1: AI hallucination / off-syllabus** | Ground prompts in syllabus + NotebookLM; validation layer; flag uncertainty in UI. |
| **R2: Over-helping** | Enforce guidance levels in business layer; “full solution” gated; UX reflects help level. |
| **R3: Grading fairness** | Deterministic scoring for objective items; clear explanations and rubric storage. |
| **R4: Data privacy (minors)** | Minimize PII to AI; consent flows; encryption; deletion/anonymization path. |
| **R5: NotebookLM feed quality** | Fallback to syllabus-level content; label “today’s class” vs “standard syllabus”. |
| **R6: Connectivity / latency** | Pre-generate/cache where possible; retry and clear offline/sync states in UI. |
| **R7: MPIN brute-force** | Rate limiting, lockout, optional device/biometric layer; audit failed attempts. |
| **R8: Attendance accuracy** | Read-only for student; label period/source; conflict handling in final integration. |

---

## 12. System Architecture Diagram (PDF-Ready)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MINDFORGE STUDENT EXPERIENCE                              │
│                     EXECUTION TECHNICAL ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │   ANDROID APP    │  │    iOS APP       │  │   DESKTOP WEB    │
  │  (UI + Nav +     │  │  (UI + Nav +     │  │  (UI + Nav +     │
  │   API Client)    │  │   API Client)    │  │   API Client)    │
  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
           │                     │                     │
           │    HTTPS / REST     │                     │
           └─────────────────────┼─────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │                           API LAYER (Gateway)                                 │
  │  Auth · Rate limit · Validation · Route to Business Layer                     │
  └──────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │                    BUSINESS LOGIC LAYER (Middle Layer)                        │
  │  Auth · Today's plan · Activities · Grading · AI orchestration · Attendance  │
  │  Doubts · Syllabus context · Sync/conflict · No direct DB access             │
  └──────────────┬───────────────────────────────────────┬───────────────────────┘
                 │                                       │
                 │                                       │ HTTP
                 ▼                                       ▼
  ┌──────────────────────────────┐    ┌─────────────────────────────────────────┐
  │  DATA ACCESS LAYER           │    │  EXTERNAL                                │
  │  (DB interaction only)       │    │  · AI provider (stateless)              │
  │  Repositories / DAOs         │    │  · NotebookLM (read-only feed)          │
  └──────────────┬───────────────┘    └─────────────────────────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────┐    ┌─────────────────────────────────────────┐
  │  DATABASE                    │    │  REDIS (optional)                       │
  │  PostgreSQL (or MySQL)       │    │  Sessions · Rate limits · Cache          │
  │  students · syllabus ·       │    └─────────────────────────────────────────┘
  │  activities · responses ·    │
  │  attendance · doubts ·       │
  │  sessions · audit            │
  └──────────────────────────────┘

  NAVIGATION (UI LAYER):  Login → Home → Activity | Attendance | Doubts | Profile
                          Activity → Results → Home
  UX LOCKED: No change to screens, flows, or features per approved UX spec.
```

---

## 13. Approval Decision

**Architecture Approved — downstream work may proceed.**

This technical architecture is execution-ready and respects the Light Architecture v2 and the approved UX Specification. Frontend (UI/navigational layer), backend (API, business logic, data access), database, API endpoints, error handling, deployment assumptions, and risks are defined. No UX or feature additions are introduced.

---

## 14. Artifacts to Save

- **Primary**: `docs/architecture/final/Mindforge_Student_Experience_Technical_Architecture_Final.md`
- **Export**: `docs/architecture/final/Mindforge_Student_Experience_Technical_Architecture_Final.html`

---

## STANDARD HANDOFF – To Planner Agent

```
============================================
HANDOFF: Architect AI Agent (Final Mode) → Planner Agent
============================================

PROJECT: Mindforge Student Experience

ARTIFACT SOURCE: docs/architecture/final/Mindforge_Student_Experience_Technical_Architecture_Final.md

ARCHITECTURE STATUS: Approved — downstream work may proceed.

WHAT THE PLANNER RECEIVES:
- Frontend: UI / Navigational layer (Android, iOS, Web) with routes/screens per UX spec; API client and sync handling.
- Backend: Three-tier — API layer, Business logic layer (middle layer), Data access layer (database interaction layer). No direct DB access from business layer.
- Database: Relational (PostgreSQL or equivalent); tables for students, syllabus, activities, questions, responses, attendance, doubts, sessions, audit.
- API endpoints: Auth (MPIN verify, lockout, forgot-mpin); student today, activities (get, respond, feedback, pause), results, attendance, doubts, syllabus tree, profile, sync status. All go through API → Business → Data.
- Error handling: Consistent API error shape; domain exceptions in business layer; client-side patterns per UX (retry, offline, AI fallback, conflict modal).
- Deployment: Single region (India), HTTPS, managed DB, secrets in vault, CI/CD, monitoring.
- Risks and trade-offs: Documented with mitigations (AI, auth, privacy, connectivity, attendance).

CONSTRAINTS (DO NOT BREAK):
- UX is locked (docs/Mindforge_Student_Experience_UX_Design_Specification.md). No screen, flow, or feature changes.
- Light Architecture v2 is the product/constraint source (6-digit MPIN, multi-platform sync, attendance + calendar, AI behavior, data sensitivity).

PLANNER NEXT STEPS:
1. Consume this technical architecture and the UX spec to produce execution plan (phases, sprints, or work streams).
2. Allocate work to: Frontend (UI/nav + API client), Backend (API + Business + Data layers), Database (schema + migrations), Integration (NotebookLM, AI provider), DevOps (deploy, secrets, monitoring).
3. Do not add features or change UX; only plan implementation of the approved design.

BLOCKERS: None.

DEPENDENCIES:
- Reads: docs/Mindforge_Student_Experience_Light_Architecture_v2.md
- Reads: docs/Mindforge_Student_Experience_UX_Design_Specification.md

============================================
Signature: Architect AI Agent (Final Mode) – Mindforge Student Experience
============================================
```
