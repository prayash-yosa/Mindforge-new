# Mindforge Student Experience – Light Architecture (v2)

**Artifact name**: Mindforge_Student_Experience_Light_Architecture_v2  
**Suggested file path**: docs/architecture/light/Mindforge_Student_Experience_Light_Architecture_v2.md  

**Project Name**: Mindforge Student Experience  
**Idea Source**: docs/Mindforge_Student_Experience.pdf (Student experience definition for Class 6–12, ICSE/CBSE/State Board)

> This v2 artifact updates v1 with:
> - A **6-digit MPIN-only login** model.  
> - Explicit **multi-platform support**: Android app, iOS app, and desktop browser, all kept in sync.
> - **Attendance with calendar integration**: students see how many days they are present and absent, surfaced via an integrated calendar view.

---

## 1. Platform constraints

### Primary form factors

- **Android app**: First-class native or hybrid app experience for Android phones (low- to mid-range devices, intermittent connectivity).
- **iOS app**: Equivalent experience for iPhones, functionally on par with Android.
- **Desktop browser**: Modern desktop browsers (Chrome/Edge/Safari) with responsive layouts.

All three platforms **share a common backend and data model**, so:

- Homework, quizzes, tests, progress, gaps, and **attendance** **stay in sync** across Android, iOS, and desktop.
- A student can start on one device and continue on another with no manual migration.
- **Attendance** is visible per day (present/absent) and is integrated with a **calendar** view so students can see how many days they were present or absent over a period.

### Access pattern

- Individual student accounts with login using a **6-digit MPIN only** (see AI & security constraints below).
- Parent/guardian and teacher/institute views remain out-of-scope for this iteration unless explicitly added later.

### Performance & connectivity

- Optimize for **low bandwidth**, especially on mobile:
  - Keep app bundles and API responses small.
  - Lazy-load heavy AI interactions and rich media.
- Core navigation and progress views must remain **usable on unstable 3G**.
- AI calls can be deferred/queued with clear UI states and retry options.

### Time horizon / scale (light assumption)

- Start as a **single-region (India-focused)** deployment, with a path to multi-region later.
- No complex global multi-region consistency design in this phase.

### Environment

- **Mobile**: Android and iOS apps (native or cross-platform), respecting platform UI norms but sharing UX principles.
- **Web**: Responsive web app for desktop browsers.
- No assumptions yet about:
  - Deep OS integrations (push notifications, system share sheets) in v1.
  - Full offline mode; partial caching only.

---

## 2. AI constraints

### Pedagogical behavior (non-negotiable)

- AI must **not** give direct answers by default.
- Enforced interaction pattern:

  **Hints → Approaches → Conceptual Explanation → Counter-Questions → (Only if needed) Worked solution outline**

- This pattern applies to:
  - Homework help.
  - Quiz/test feedback.
  - Doubt solving.
  - Absentee/gap-bridge teaching.

### Source of truth for content

- Syllabus-aligned content and question banks are driven by:
  - **Class teaching data via Google NotebookLM** (daily summaries, key concepts, examples).
  - Structured syllabus metadata (Class → Subject → Chapter → Topic).
- AI must be **constrained to syllabus-aligned materials**; no open-internet knowledge for examinable content.

### Determinism & safety

- Model configuration (temperature, system prompts, tools) should prioritize:
  - **Accuracy and consistency** over creativity.
  - **Syllabus adherence** and exam compatibility.
- For factual uncertainty, AI must:
  - Explicitly signal uncertainty (e.g., “I’m not fully certain; here is my best attempt.”).
  - Where possible, flag items that need teacher or content-admin review.

### Experience threads (AI roles)

- **Homework Generator**
  - Builds daily homework tasks from NotebookLM-derived teaching summaries.
  - Emphasizes conceptual understanding and application, not rote repetition.

- **Quiz & Test Engine**
  - Generates:
    - Daily quizzes tied to recent teaching.
    - Chapter-level tests once a chapter is completed.
  - Evaluates responses and provides explanations for wrong answers.

- **Doubt Solver / Concept Coach**
  - Reactively answers student questions.
  - Enforces the progressive guidance model and avoids direct answers unless clearly pedagogically necessary.

- **Gap-Bridge Tutor**
  - Re-teaches missed topics (absenteeism).
  - Identifies weak areas from performance data and suggests remedial activities.

### Cost-awareness (light assumption)

- For high-frequency interactions (MCQ grading, simple feedback):
  - Prefer **structured, lower-cost** AI or deterministic evaluation where possible.
- Reserve more expensive reasoning calls for:
  - Doubt solving.
  - Conceptual explanations.
  - Custom exam generation with complex constraints.

---

## 3. Data sensitivity

### User profile data

- Student identity (name, class, board, school, contact details) is **personally identifiable information (PII)**.
- Must be:
  - Encrypted in transit (HTTPS).
  - Strongly recommended to be encrypted at rest.
- Parent/guardian information, if collected later, is also sensitive.

### Learning and performance data

- Homework completion, quiz/test scores, question-level attempts, and doubt logs are **educational performance records**.
- This data:
  - Powers personalization and progress tracking.
  - Must be protected from unauthorized access and misuse.
  - Should support deletion/anonymization upon request (subject to regulations and product policy).

### Attendance data

- **Attendance records** (days present, days absent, and associated dates) are **sensitive educational records**.
- This data:
  - Drives the **calendar-integrated attendance view** (how many days present/absent).
  - Feeds into absentee/gap-bridge flows (missed topics due to absence).
  - Must be protected from unauthorized access and misuse.
  - Should be treated with the same care as other learning/performance data (encryption, access control, consent where applicable).

### Content and teaching data

- Google NotebookLM–derived teaching data may contain:
  - Teacher intellectual property.
  - Potential student examples or context.
- Treat this as **internal educational content**; do not expose raw feeds directly without curation.

### Regulatory posture (light assumption)

- Initial deployment context: India, with **minors** as primary users.
- Direction:
  - Be conservative with cross-border data transfers to AI providers.
  - Make consent flows explicit for:
    - Account creation and login.
    - Use of student data for personalization.
    - Use of third-party AI services.
  - Avoid sending unnecessary PII in prompts to AI providers:
    - Prefer pseudonymous IDs.
    - Provide only the minimum context required to answer.

---

## 4. Integration assumptions

### NotebookLM integration (teaching data feed)

- The system receives **daily per-class feeds** derived from NotebookLM summarizing:
  - Topics covered.
  - Key points and explanations.
  - Example questions (where feasible).
- For this light architecture:
  - Treat this as a **read-only integration** used to:
    - Generate daily homework.
    - Generate daily quizzes.
    - Inform chapter-level assessments and gap-bridge flows.
- Exact API surface, schemas, and failure modes are deferred to final architecture.

### Authentication & identity (6-digit MPIN)

- Student login is performed using a **6-digit MPIN only**:
  - MPIN is numeric, fixed length (6 digits).
  - Same MPIN is used across Android, iOS, and desktop to access the same account.
- Account identity (e.g., phone number or other unique identifier):
  - Is assumed to be captured during account provisioning/registration flow.
  - Is not used as a daily login credential from a UX standpoint; **students remember only their MPIN**.
- Security and UX implications:
  - MPIN-only auth is a **weaker factor** than strong passwords or multi-factor auth.
  - Requires strong protections:
    - Online brute-force protection (rate limiting, lockouts, backoff).
    - Device-level protections where applicable (e.g., OS-level biometrics as an optional shortcut layered on top of MPIN in mobile apps).

### Roles

- Primary role:
  - `student` – full focus of this artifact.
- Future possible roles (not in current scope, but to keep in mind):
  - `parent` – monitor progress, limited actions.
  - `teacher` – content oversight, approvals, advanced analytics.

### Question bank & evaluation

- Mindforge backend remains the **system of record** for:
  - Questions (AI-generated or curated).
  - Student responses.
  - Grading outcomes and explanations.
- AI providers are **stateless generators/evaluators**:
  - No long-term storage of student data on their side is assumed.
  - Outputs are stored only after backend validation where necessary.

### Attendance & calendar integration

- **Attendance** is a first-class capability:
  - The system maintains a record of **days present** and **days absent** per student (per class/term or configurable period).
  - Attendance is surfaced to the student via a **calendar-integrated view**:
    - Calendar shows which days the student was **present** vs **absent**.
    - Summary metrics (e.g., “X days present, Y days absent this month”) are visible.
  - **Calendar** can be:
    - An in-app calendar view (primary): dates with present/absent markers and optional integration with device or school calendar (e.g., export or read-only sync) as a later enhancement.
  - Source of attendance data (e.g., teacher mark, school feed, or self-report) is **out of scope for this light architecture**; assume attendance data is available per day and stored in the backend. Exact APIs and sync with external calendars are deferred to final architecture.

### Other integrations

- No assumptions, in this phase, of:
  - School ERPs.
  - Payment gateways.
  - SMS/notification gateways.
- Such integrations, if required, will be treated as separate architectural concerns.

---

## 5. Risk flags

### R1: AI hallucination vs. syllabus accuracy

- **Risk**: AI may generate off-syllabus, incorrect, or misaligned content.
- **Impact**: Confused students; exam misalignment; trust erosion.
- **Direction**:
  - Strict grounding in NotebookLM and syllabus metadata.
  - Validation layers for syllabus alignment where feasible.

### R2: Over-helping and short-circuiting learning

- **Risk**: Students may quickly bypass effort and demand full solutions.
- **Impact**: Weak conceptual learning and dependency on AI.
- **Direction**:
  - UX must enforce the progressive guidance pattern.
  - “Full solution” views, where allowed, should be gated behind meaningful effort and reflection.

### R3: Evaluation fairness and trust

- **Risk**: Inconsistent or opaque AI-based grading decisions.
- **Impact**: Disputes over scores; loss of trust from students/parents.
- **Direction**:
  - Use deterministic scoring for objective questions (e.g., MCQs) where possible.
  - Provide clear explanations for wrong answers and scoring rules.

### R4: Data privacy and consent (minors)

- **Risk**: Mishandling minors’ data, missing consent, or unclear third-party data sharing.
- **Impact**: Legal, ethical, and reputational issues.
- **Direction**:
  - Minimize third-party data exposure.
  - Clear consent text and easily discoverable privacy policy.
  - Simple mechanisms to manage accounts and, where applicable, delete data.

### R5: Dependence on NotebookLM feed quality

- **Risk**: Noisy, incomplete, or delayed teaching summaries.
- **Impact**: Misaligned homework and assessments.
- **Direction**:
  - Fallback to standard syllabus-level question banks when daily feeds are weak or missing.
  - Clearly label when content is based on “standard syllabus” vs. “today’s class”.

### R6: Connectivity constraints and latency

- **Risk**: Relying heavily on live AI in low-connectivity contexts.
- **Impact**: Sluggish, unreliable experience; abandoned sessions.
- **Direction**:
  - Pre-generate or cache content (e.g., daily quizzes, some homework) where possible.
  - Use robust retry patterns and clear “in progress / offline” states across Android, iOS, and web.

### R7: MPIN-only authentication strength

- **Risk**: A 6-digit MPIN is susceptible to brute-force guessing.
- **Impact**: Potential account takeover if rate limiting and lockouts are weak.
- **Direction**:
  - Enforce strict online rate limiting and lockout policies.
  - Consider optional secondary factors (e.g., device binding, OS biometrics as a convenience layer).
  - UX should clearly communicate lockout and recovery flows (e.g., “forgot MPIN” tied to parent/phone verification).


### R8: Attendance data accuracy and source

- **Risk**: Attendance shown to the student may be incorrect or out of date if the source system is wrong or sync fails.
- **Impact**: Student/parent trust; incorrect gap-bridge or remedial suggestions.
- **Direction**:
  - Treat attendance as read-only from the student's perspective; no student self-correction of attendance in this scope.
  - Clearly label the period and source of attendance in the UX (e.g., "Based on class attendance" or "This month").
  - If calendar is synced with an external source, define failure and conflict handling in final architecture.
---

## STANDARD HANDOFF – To UX / UI Agent (v2)

**PROJECT**: Mindforge Student Experience  
**PHASE**: Light Architecture (v2) → UX / UI (navigation-first)  
**ARTIFACT SOURCE**: docs/architecture/light/Mindforge_Student_Experience_Light_Architecture_v2.md  

### 1. Context summary (for UX)

- Student learning app for Classes 6–12 (ICSE/CBSE/State), structured as:

  **Class → Subject → Chapter → Topic**

- Runs on **Android app, iOS app, and desktop browser**, all backed by the same account and data model:
  - A student can move between phone and desktop with all homework, quizzes, and progress **kept in sync**.
- AI behaves as a **teacher-like guide**, not an answer vending machine:
  - Interactions follow the pattern:

    **Hints → Approaches → Concepts → Counter-Questions → (Optional) Worked solution outline**.

- Daily flows:
  - Homework from class teaching (NotebookLM data).
  - Daily quizzes.
  - Chapter-level tests.
  - Student-generated exams.
  - Doubt-solving.
  - Absentee / gap-bridge for missed topics.
  - **Attendance with calendar integration**: students can see how many days they are present and absent, via a calendar view and summary (e.g., days present/absent this month).

### 2. Key UX constraints (delta vs v1)

- **Multi-platform parity and sync**
  - UX patterns should be consistent in intent across Android, iOS, and desktop, even if visual details follow platform conventions.
  - Critical flows (login, home, homework, quiz, doubt solving) must exist on all three platforms with **shared state**.

- **6-digit MPIN-only login**
  - Students log in using only a **6-digit numeric MPIN**.
  - UX must:
    - Make MPIN entry fast and familiar (e.g., PIN pad patterns).
    - Handle incorrect attempts gracefully, with clear error feedback.
    - Surface lockout states and recovery paths in a student-friendly way.

- **Low-bandwidth mobile-first design**
  - While desktop is supported, the **primary constraints still come from low-end Android**.
  - Design for quick load, minimal friction, and clear offline/poor-network handling across apps.

- **Learning-first guidance**
  - Every AI interaction should visually reflect the “stepwise guidance” model, not direct-answer defaults.

### 3. What UX SHOULD design now (with new constraints)

- **Cross-platform login and onboarding**
  - MPIN creation and confirmation flow (during registration).
  - MPIN-based login screens on Android, iOS, and web.
  - Error, lockout, and “forgot MPIN” entry points (even if backend details are TBD).

- **Navigation and information architecture**
  - Home / Today’s Plan across all three platforms.
  - Syllabus browser (Class → Subject → Chapter → Topic).
  - Consistent navigation schema so a student switching devices does not feel lost.

- **Core learning flows**
  - Homework, daily quiz, chapter tests, and student-generated exams (start, in-progress, results).
  - Doubt-solving and absentee gap-bridge flows.
  - Clear indicators of progress and gaps that are visible identically across devices.

- **Attendance & calendar**
  - An **attendance** view integrated with a **calendar**: students see which days they were present or absent and a summary (e.g., “X days present, Y days absent” for the selected period).
  - Calendar can be in-app only in v1; optional device/school calendar sync is a later enhancement. UX should design the in-app calendar and summary without changing existing flow diagrams.

- **Connectivity and sync states**
  - Visual patterns for:
    - Sync in progress (e.g., “Saving…” or “Syncing to cloud…”).
    - Conflicts or delays (e.g., when two devices are used quickly in sequence).
    - Offline usage with queued actions where applicable.

### 4. What UX MUST NOT design yet

- Detailed backend/API specifications or platform-specific implementation details (e.g., exact push notification mechanisms).
- Full teacher/admin dashboards or school/ERP integrations.
- Payment/subscription or parent analytics beyond minimal conceptual placeholders.

### 5. Open questions UX should flag back

- How best to:
  - Communicate MPIN lockouts and recovery flows to students and parents.
  - Balance **“remember me” / auto-login** behaviors across Android, iOS, and desktop with shared-account safety.
- What visual patterns can clearly show:
  - “This is synced” vs. “Waiting to sync” when students switch devices.

### 6. Handoff status

- **Architecture Status (Light v2)**:
  - Updated to reflect **6-digit MPIN-only login** and **multi-platform (Android, iOS, desktop) sync requirements**.
- **Approval for UX / UI exploration**:
  - **Yes – UX / UI may proceed under these updated constraints**, using this v2 artifact as the current source of truth.

**Signature**:  
Architect AI Agent (Light Mode, v2) – Mindforge Student Experience

