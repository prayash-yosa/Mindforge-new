# Mindforge Student Experience — UX Design Specification

**Artifact name**: Mindforge_Student_Experience_UX_Design_Specification  
**Artifact produced by**: UX/UI Designer AI Agent  
**Date**: February 4, 2026  
**Constraints Reference**: `docs/Mindforge_Student_Experience_Light_Architecture_v2.md`

**Color scheme**: Use `docs/images/color-palate.png`: primary **#748b75** (sage green), text/emphasis **#503d42** (deep brown), background **#f5fbef** (cream).  
**Logo**: Use `docs/images/logo.png` (transparent background) for branding on Login and headers.

Attendance with calendar integration is in scope: students see how many days they are present and absent via an integrated calendar view (see Screen 5 and Attendance & Calendar navigation below).

---

## 1. UX System Overview

### UX Principles
- **Learning-first, not answer-first**: Every AI interaction visually reinforces stepwise guidance
- **Mobile-first, cross-platform parity**: Primary design for low-end Android, adapted for iOS and desktop
- **Progressive disclosure**: Show only what's needed at each step; reduce cognitive load
- **Confidence through clarity**: Students always know where they are and what to do next
- **Accessibility as default**: Touch targets, contrast, and screen reader support built-in

### Global Navigation Rules
- Bottom navigation bar on mobile (Android/iOS)
- Sidebar navigation on desktop
- **Maximum 4 primary destinations: Home, Attendance, Doubts, Profile** (Syllabus is not a separate tab; see below)
- **Attendance**: Dedicated bottom-nav item; shows calendar and present/absent summary (Screen 5)
- **Syllabus integration**: **Class → Subject → Chapter → Topic** is integrated **inside the Doubts (AI) interface**. When the student opens Doubts, they can set or change context (Class, Subject, Chapter, Topic) so the AI is syllabus-scoped and conversations stay aligned to curriculum
- Consistent back navigation; no dead ends

### Error Handling Pattern
- Inline validation with clear, actionable messages
- Network errors show retry option with offline indicator
- AI failures gracefully degrade to "Try again" with fallback content

### Loading / Empty Patterns
- Skeleton loaders for content areas (not spinners)
- Empty states include illustration + helpful action
- AI "thinking" state clearly visible with progress indicator

### Accessibility Defaults
- Minimum touch targets: 48×48px (mobile), 44×44px (desktop)
- Color contrast: WCAG 2.1 AA minimum (4.5:1 for text)
- All interactive elements keyboard accessible
- Screen reader labels on all controls

---

## 2. User Flows

### 2.1 Happy Path: Daily Learning Session

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HAPPY PATH                                  │
│                  Daily Learning Session                             │
└─────────────────────────────────────────────────────────────────────┘

[START: Student opens app]
        │
        ▼
┌───────────────────┐
│   LOGIN SCREEN    │  ← 6-digit MPIN entry
│   Enter MPIN      │
└───────────────────┘
        │ enter valid MPIN
        ▼
┌───────────────────┐
│   HOME SCREEN     │  ← Today's Plan overview
│   "Today's Plan"  │     • Pending homework
│   • Homework (3)  │     • Daily quiz ready
│   • Quiz Ready    │     • My Attendance card
└───────────────────┘
        │ tap "Start Homework" (or "My Attendance" → Screen 5)
        ▼
┌───────────────────┐
│  ACTIVITY SCREEN  │  ← Question displayed
│  Question 1 of 5  │     Student attempts answer
│  [Answer Input]   │
└───────────────────┘
        │ submit answer
        ▼
┌───────────────────┐
│  AI FEEDBACK      │  ← Progressive guidance
│  "Almost! Here's  │     Hints → Concepts → Solution
│   a hint..."      │
└───────────────────┘
        │ continue / next question
        ▼
┌───────────────────┐
│  RESULTS SCREEN   │  ← Summary + next steps
│  "4/5 Correct"    │
│  [Review] [Home]  │
└───────────────────┘
        │ tap "Home"
        ▼
[END: Return to Home Screen with updated progress]
```

### 2.2 Happy Path: View Attendance

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HAPPY PATH                                  │
│                    View Attendance                                  │
└─────────────────────────────────────────────────────────────────────┘

[START: Student on Home Screen]
        │
        ▼
┌───────────────────┐
│   HOME SCREEN     │  ← "My Attendance" card visible
└───────────────────┘
        │ tap "My Attendance" (or Profile → Attendance)
        ▼
┌───────────────────┐
│  ATTENDANCE       │  ← Summary: Present / Absent days
│  SCREEN           │     Calendar view (P / A / –)
│  (Screen 5)       │     Period selector (This month / Term)
└───────────────────┘
        │ tap back or change period
        ▼
[END: Return to Home or Profile]
```

### 2.3 Failure Paths

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FAILURE PATHS                                 │
└─────────────────────────────────────────────────────────────────────┘

FAILURE PATH A: Invalid MPIN
─────────────────────────────
[Login Screen] → enter incorrect MPIN
        │
        ▼
[Login Screen] ← Error displayed
        │         "Incorrect MPIN. Please try again."
        │         Attempts remaining: 4
        ▼
[User re-enters] → Continue to Home (if correct)
        │
        └─ After 5 failed attempts:
           [Lockout Screen] ← "Too many attempts"
           │                   "Try again in 15 minutes"
           │                   [Contact Support] [Forgot MPIN?]
           ▼
           [User waits / recovers]


FAILURE PATH B: Network Error During Activity
─────────────────────────────────────────────
[Activity Screen] → submit answer
        │
        ▼
[Loading State] → Network request fails
        │
        ▼
[Activity Screen] ← Error banner displayed
        │           "Unable to save. Check your connection."
        │           [Retry] [Save Offline]
        ▼
[User taps Retry] → Resubmit
        │
        └─ If offline mode:
           [Offline Badge] ← "Answer saved locally"
           │                  "Will sync when online"
           ▼
           [Continue to next question]


FAILURE PATH C: AI Response Failure
─────────────────────────────────────
[Activity Screen] → request AI feedback
        │
        ▼
[AI Thinking State] → AI service timeout/error
        │
        ▼
[Activity Screen] ← Fallback displayed
        │           "We couldn't generate feedback right now."
        │           [View Standard Hint] [Try Again]
        ▼
[Fallback content] ← Pre-cached syllabus-based hint shown


FAILURE PATH D: Session Timeout
─────────────────────────────────
[Activity Screen] → User inactive for 5 minutes
        │
        ▼
[Timeout Modal] ← "Still working?"
        │         "Your progress is saved."
        │         [Continue] [Save & Exit]
        │
        ├─ tap "Continue" → Return to activity
        │
        └─ tap "Save & Exit" → Home Screen (progress saved)


FAILURE PATH E: Sync Conflict (Multi-Device)
────────────────────────────────────────────
[Home Screen] → User switches device mid-activity
        │
        ▼
[Sync Banner] ← "Syncing your progress..."
        │
        ├─ Sync successful → "All caught up!"
        │
        └─ Conflict detected:
           [Conflict Modal] ← "Found newer progress on another device"
                             "Use latest?" [Yes] [Keep Current]


FAILURE PATH F: Attendance Data Unavailable
────────────────────────────────────────────
[Attendance Screen] → Load attendance
        │
        ▼
[Loading State] → Network fails or no data for period
        │
        ▼
[Attendance Screen] ← Empty state or error
        │           "No attendance data for this period."
        │           OR "Couldn't load attendance. Pull to refresh."
        │           [Retry] [Change period]
        ▼
[User taps Retry or changes period] → Reload
```

---

## 3. Navigation Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NAVIGATION MAP                                 │
│                    (5 Core Screens)                                 │
└─────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │                 │
           ┌────────│    1. LOGIN     │
           │        │                 │
           │        └─────────────────┘
           │                │
           │         valid MPIN
           │                │
           │                ▼
           │        ┌─────────────────┐
           │        │                 │◄───────────────────────┐
  logout   │        │    2. HOME      │                        │
           │        │  (Today's Plan) │                        │
           │        │                 │                        │
           │        └─────────────────┘                        │
           │                │                                  │
           │    ┌───────────┼───────────┬──────────────┐       │
           │    │           │           │              │       │
           │    ▼           ▼           ▼              ▼       │
           │  Homework    Quiz      Doubts       Attendance    │
           │    │           │    (AI+Syllabus)      │       │
           │    └─────┬─────┘           │              │       │
           │          │                 │              │       │
           │          ▼                 │              ▼       │
           │  ┌─────────────────┐       │     ┌─────────────┐  │
           │  │                 │       │     │  5. ATTEND  │  │
           │  │  3. ACTIVITY    │◄──────┘     │   (Calendar) │  │
           │  │   (Learning)    │            └─────────────┘  │
           │  │                 │              ▲              │
           │  └─────────────────┘              │ from Profile│
           │          │                        └─────────────┘
           │    complete / exit
           │          │
           │          ▼
           │  ┌─────────────────┐
           │  │                 │
           └──│   4. RESULTS    │──────────────────────────────┘
              │                 │
              └─────────────────┘


BOTTOM NAVIGATION (Mobile)
────────────────────────────
┌──────────┬──────────────┬──────────┬──────────┐
│   🏠     │   📅         │   💬     │   👤     │
│  Home    │ Attendance   │  Doubts  │ Profile  │
└──────────┴──────────────┴──────────┴──────────┘

NAVIGATION RULES:
─────────────────
• Bottom nav persistent on all screens except Login and Activity
• Activity screens use focused mode (hide bottom nav, show back arrow)
• **Attendance**: Dedicated tab; opens Screen 5 (calendar + present/absent)
• **Doubts**: Opens AI chat interface **with Syllabus context** (Class → Subject → Chapter → Topic selector inside the screen; AI responses are syllabus-scoped)
• Syllabus is not a separate tab; it is integrated inside Doubts (see 4.x Doubts / AI interface)
• Profile: Settings, progress overview, logout
• All platforms sync to same navigation state where applicable
• Desktop: Left sidebar replaces bottom nav
```

---

## 4. Screen Specifications

### Screen 1: Login Screen

**Purpose**: Authenticate student with 6-digit MPIN  
**URL Path**: `/login`  
**Primary Action**: "Enter" button (submit MPIN)  
**Secondary Action**: "Forgot MPIN?" link

**Content Hierarchy (Wireframe):**

```
┌────────────────────────────────────────────┐
│                                            │
│           [Mindforge Logo]                 │
│                                            │
│         Welcome Back, Student!             │
│                                            │
│         Enter your 6-digit MPIN            │
│                                            │
│    ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐     │
│    │  │  │  │  │  │  │  │  │  │  │  │     │  ← MPIN input boxes
│    └──┘  └──┘  └──┘  └──┘  └──┘  └──┘     │
│                                            │
│    ┌──────────────────────────────────┐    │
│    │           ENTER                  │    │  ← Primary button
│    └──────────────────────────────────┘    │
│                                            │
│            Forgot MPIN?                    │  ← Link
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  1  │  2  │  3  │                    │  │
│  ├─────┼─────┼─────┤                    │  │
│  │  4  │  5  │  6  │    Numeric Keypad  │  │  ← On-screen keypad
│  ├─────┼─────┼─────┤                    │  │
│  │  7  │  8  │  9  │                    │  │
│  ├─────┼─────┼─────┤                    │  │
│  │  ⌫  │  0  │  ✓  │                    │  │
│  └─────┴─────┴─────┘                    │  │
│                                            │
└────────────────────────────────────────────┘
```

**Screen States:**

| State | Behavior |
|-------|----------|
| **Default** | Empty MPIN fields, keypad enabled, "Enter" disabled |
| **Entering** | Digits appear as filled dots (•), "Enter" enabled when 6 digits |
| **Loading** | "Enter" shows spinner, keypad disabled |
| **Error** | Red border on MPIN fields, error message below, shake animation |
| **Locked** | Keypad disabled, lockout message with countdown timer |

**Interaction Notes:**
- Auto-focus on MPIN input on screen load
- Each digit entry advances to next box
- Backspace clears last digit
- Submit on 6th digit or "Enter" tap
- Support device biometrics as optional shortcut (if previously enrolled)

---

### Screen 2: Home Screen (Today's Plan)

**Purpose**: Central dashboard showing today's learning tasks and progress  
**URL Path**: `/home`  
**Primary Action**: Start any pending learning activity  
**Secondary Actions**: Navigate to **Attendance**, **Doubts**, **Profile** via bottom nav. (Attendance is also reachable via "My Attendance" card on Home; Syllabus is inside Doubts — see Screen 6.)

**Content Hierarchy (Wireframe):**

```
┌────────────────────────────────────────────┐
│  ☰  Today's Plan              [👤 Profile] │  ← Header
├────────────────────────────────────────────┤
│                                            │
│  Good Morning, Aarav! 👋                   │
│  Class 8 • CBSE                            │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│  📊 Your Progress Today                    │
│  ┌────────────────────────────────────┐    │
│  │  ████████░░░░░░░░  3/8 tasks done  │    │  ← Progress bar
│  └────────────────────────────────────┘    │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│  📝 Pending Tasks                          │
│  ┌────────────────────────────────────┐    │
│  │  📐 Math Homework                  │    │
│  │  Chapter 4: Quadrilaterals         │    │
│  │  5 questions • ~15 mins            │    │
│  │                      [Start →]     │    │  ← Task card
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  🧪 Science Daily Quiz             │    │
│  │  Today's class: Chemical Reactions │    │
│  │  10 questions • ~10 mins           │    │
│  │                      [Start →]     │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  ⚠️ Gap Alert: English Grammar     │    │
│  │  Missed: Tenses (2 days ago)       │    │
│  │                    [Bridge Gap →]  │    │  ← Gap-bridge card
│  └────────────────────────────────────┘    │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│  ✅ Completed Today                        │
│  • Hindi Reading (100%)                    │
│  • Math Quiz (8/10)                        │
│                                            │
├────────────────────────────────────────────┤
│   🏠      │    📅     │    💬    │   👤    │  ← Bottom nav
│  Home     │ Attendance│  Doubts  │ Profile │
└────────────────────────────────────────────┘
```

**Screen States:**

| State | Behavior |
|-------|----------|
| **Default** | Task cards displayed, progress bar reflects current status |
| **Loading** | Skeleton loaders for task cards |
| **Empty** | "All caught up!" illustration with optional practice suggestions |
| **Syncing** | Top banner: "Syncing..." with subtle animation |
| **Offline** | Offline badge in header, cached tasks available |
| **Error** | "Couldn't load tasks. Pull to refresh." |

---

### Screen 3: Activity Screen (Learning)

**Purpose**: Unified screen for Homework, Quiz, and Test questions with AI guidance  
**URL Path**: `/activity/:type/:id`  
**Primary Action**: Submit answer / Request hint  
**Secondary Actions**: Skip, Exit (with save)

**Content Hierarchy (Wireframe):**

```
┌────────────────────────────────────────────┐
│  ←  Math Homework          Question 2/5    │  ← Header with progress
│      ████████████░░░░░░░░░░░░░░░░░░░░░░   │  ← Progress bar
├────────────────────────────────────────────┤
│                                            │
│  Chapter 4: Quadrilaterals                 │
│  Topic: Properties of Parallelograms       │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│  Question:                                 │
│  ┌────────────────────────────────────┐    │
│  │  In a parallelogram ABCD, if       │    │
│  │  ∠A = 70°, find ∠B, ∠C, and ∠D.   │    │
│  │                                    │    │
│  │  [Diagram of parallelogram]        │    │  ← Question card
│  └────────────────────────────────────┘    │
│                                            │
│  Your Answer:                              │
│  ┌────────────────────────────────────┐    │
│  │                                    │    │
│  │  ∠B = ___°                         │    │
│  │  ∠C = ___°                         │    │  ← Input area
│  │  ∠D = ___°                         │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                            │
│    ┌──────────────────────────────────┐    │
│    │         CHECK ANSWER             │    │  ← Primary action
│    └──────────────────────────────────┘    │
│                                            │
│         💡 Need a hint?                    │  ← AI help trigger
│                                            │
└────────────────────────────────────────────┘
```

**After Answer Submission (AI Feedback Panel):**

```
┌────────────────────────────────────────────┐
│  ←  Math Homework          Question 2/5    │
│      ████████████████░░░░░░░░░░░░░░░░░░   │
├────────────────────────────────────────────┤
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  🤖 AI Tutor                       │    │
│  │  ───────────────────────────────── │    │
│  │                                    │    │
│  │  Almost there! Let me help you     │    │
│  │  think this through...             │    │
│  │                                    │    │
│  │  💡 HINT:                          │    │
│  │  In a parallelogram, opposite      │    │  ← Progressive AI guidance
│  │  angles are equal. Also, adjacent  │    │
│  │  angles are supplementary          │    │
│  │  (add up to 180°).                 │    │
│  │                                    │    │
│  │  Can you use these properties to   │    │
│  │  find the other angles?            │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌─────────────────┐ ┌─────────────────┐   │
│  │   TRY AGAIN     │ │  MORE HELP  →   │   │  ← Action buttons
│  └─────────────────┘ └─────────────────┘   │
│                                            │
│  Help level: 1/4  ░░░░                     │  ← Guidance progress
│  (Hint → Approach → Concept → Solution)   │
│                                            │
└────────────────────────────────────────────┘
```

**Screen States:**

| State | Behavior |
|-------|----------|
| **Default** | Question displayed, answer input empty, "Check" disabled |
| **Answering** | Input active, "Check" enabled when answer provided |
| **Checking** | "Check" shows spinner, input locked |
| **Correct** | Green success state, celebration animation, "Next" button |
| **Incorrect** | AI feedback panel slides up, "Try Again" + "More Help" options |
| **AI Thinking** | "AI Tutor is thinking..." with animated dots |
| **AI Error** | "Couldn't get feedback. [View Standard Hint] [Try Again]" |
| **Offline** | Answer saved locally, feedback deferred |

**AI Behavior:**
- **Role**: Progressive guidance, never direct answers
- **User control**: Student chooses when to request more help
- **Guidance levels**: Hint (1) → Approach (2) → Concept (3) → Worked Solution (4)
- **Confidence indicator**: "Help level: X/4" shows guidance depth

---

### Screen 4: Results Screen

**Purpose**: Show activity completion summary and next steps  
**URL Path**: `/results/:type/:id`  
**Primary Action**: "Continue" to next activity / "Home"  
**Secondary Actions**: "Review Mistakes", "Share Progress"

**Content Hierarchy (Wireframe):**

```
┌────────────────────────────────────────────┐
│  ←  Results                                │
├────────────────────────────────────────────┤
│                                            │
│              ✓                             │
│                                            │
│         Math Homework Complete!            │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│         ┌───────────────────┐              │
│         │                   │              │
│         │      4 / 5        │              │  ← Score display
│         │     Correct       │              │
│         │                   │              │
│         │   ⭐⭐⭐⭐☆         │              │  ← Star rating
│         │                   │              │
│         └───────────────────┘              │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│  📊 Performance Breakdown                  │
│  ┌────────────────────────────────────┐    │
│  │  ✓ Q1: Parallelogram angles        │    │
│  │  ✓ Q2: Diagonal properties         │    │
│  │  ✗ Q3: Rhombus vs Rectangle        │    │  ← Question breakdown
│  │  ✓ Q4: Area calculation            │    │
│  │  ✓ Q5: Perimeter problem           │    │
│  └────────────────────────────────────┘    │
│                                            │
│    ┌──────────────────────────────────┐    │
│    │       REVIEW MISTAKES            │    │  ← Secondary action
│    └──────────────────────────────────┘    │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│  🎯 Suggested Next                         │
│  ┌────────────────────────────────────┐    │
│  │  🧪 Science Daily Quiz             │    │
│  │  10 questions ready                │    │
│  │                      [Start →]     │    │
│  └────────────────────────────────────┘    │
│                                            │
│    ┌──────────────────────────────────┐    │
│    │         BACK TO HOME             │    │  ← Primary action
│    └──────────────────────────────────┘    │
│                                            │
└────────────────────────────────────────────┘
```

**Screen States:**

| State | Behavior |
|-------|----------|
| **Default/Success** | Score displayed, breakdown visible, next suggestions shown |
| **Loading** | Skeleton loader while computing results |
| **Perfect Score** | Celebration animation, "Perfect!" badge |
| **Needs Improvement** | Gap identified, remedial suggestion prioritized |
| **Offline** | "Results saved. Full details when online." |

---

### Screen 5: Attendance & Calendar

**Purpose**: Show how many days the student is **present** and **absent**, integrated with a calendar view.  
**URL Path**: `/attendance` or `/profile/attendance`  
**Primary Action**: View attendance summary and calendar (read-only).  
**Secondary Actions**: Change period (e.g. This month / This term), navigate back to Home or Profile.

**Content Hierarchy (Wireframe):**

```
┌────────────────────────────────────────────┐
│  ←  My Attendance              [Period ▼]   │  ← Header + period selector
├────────────────────────────────────────────┤
│                                            │
│  📅 Attendance Summary                     │
│  ┌────────────────────────────────────┐    │
│  │  This month                         │    │
│  │  Present: 18 days                   │    │  ← Summary metrics
│  │  Absent:  2 days                    │    │
│  │  ─────────────────────────────     │    │
│  │  [===== present =====][= absent =]  │    │  ← Optional bar
│  └────────────────────────────────────┘    │
│                                            │
│  ─────────────────────────────────────     │
│                                            │
│  Calendar (October 2026)                    │
│  ┌────────────────────────────────────┐    │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun  │    │
│  │   1    2    3    4    5    6    7   │    │
│  │  [P]  [P]  [P]  [P]  [P]  [–]  [–]  │    │  ← P = Present, A = Absent
│  │   8    9   10   11   12   13   14   │    │     – = No data / weekend
│  │  [P]  [A]  [P]  [P]  [P]  [–]  [–]  │    │
│  │  ...                                │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Legend: ● Present   ○ Absent   – No data   │
│                                            │
│  ─────────────────────────────────────     │
│  "Based on class attendance"                │  ← Source / period label
│                                            │
└────────────────────────────────────────────┘
```

**Screen States:**

| State | Behavior |
|-------|----------|
| **Default** | Summary and calendar displayed with present/absent markers. |
| **Loading** | Skeleton for summary and calendar grid. |
| **Empty** | "No attendance data for this period." with period selector. |
| **Error** | "Couldn't load attendance. Pull to refresh." with Retry. |
| **Offline** | Cached attendance if available; otherwise "Attendance will load when you're back online." |

**Interaction Notes:**
- Attendance is **read-only**; student cannot edit present/absent.
- Period selector: e.g. This month / Last month / This term (implementation follows backend).
- Calendar cells are not required to be tap targets; primary use is visual scan. If tap is supported, show tooltip or small overlay (e.g. "Oct 9 – Absent").

**Accessibility:**
- Summary (present/absent counts) must be announced clearly to screen readers.
- Calendar: ensure table/grid has headers and each cell has an accessible label (e.g. "9 October, Absent").
- Legend and source label readable by screen readers.

---

### Screen 6: Doubts (AI interface) with Syllabus integration

**Purpose**: AI-powered doubt-solving and concept help, with **syllabus context** (Class → Subject → Chapter → Topic) so the AI stays curriculum-aligned.  
**URL Path**: `/doubts`  
**Primary Action**: Send message / ask doubt  
**Secondary Actions**: Change syllabus context (Class, Subject, Chapter, Topic); view past threads

**Syllabus integration (inside this screen):**
- At the top of the Doubts screen (or as a collapsible/tappable bar), the student can **set or change context**:
  - **Class** (e.g. Class 8)
  - **Subject** (e.g. Mathematics)
  - **Chapter** (e.g. Quadrilaterals)
  - **Topic** (e.g. Properties of Parallelograms)
- This context is passed to the AI so that:
  - Responses are **syllabus-aligned** (no open-internet drift)
  - Hints and explanations follow the same **progressive guidance** (Hints → Approach → Concept → Solution)
- The syllabus selector can be a single line like:  
  **Class 8 · Math · Quadrilaterals · Properties of Parallelograms** [Change]  
  or a drill-down: tap [Change] → Class → Subject → Chapter → Topic.

**Content Hierarchy (Wireframe):**

```
┌────────────────────────────────────────────┐
│  ←  Doubts                      [👤]       │
├────────────────────────────────────────────┤
│  📚 Context (syllabus)                     │
│  ┌────────────────────────────────────┐    │
│  │ Class 8 · Math · Quadrilaterals ·   │    │  ← Syllabus scope
│  │ Properties of Parallelograms  [▾]  │    │     tap to change
│  └────────────────────────────────────┘    │
│  ─────────────────────────────────────     │
│  💬 Chat with AI Tutor                     │
│  ┌────────────────────────────────────┐    │
│  │ You: How do I find angle B if      │    │
│  │      angle A is 70°?                │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │ AI:  Good question! In a           │    │
│  │      parallelogram, opposite       │    │
│  │      angles are equal...           │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │ Type your doubt...                 │    │  ← Input
│  └────────────────────────────────────┘    │
│  [Send]                                     │
├────────────────────────────────────────────┤
│   🏠      │    📅     │    💬    │   👤    │  ← Bottom nav
│  Home     │ Attendance│  Doubts  │ Profile │
└────────────────────────────────────────────┘
```

**Screen States:**

| State | Behavior |
|-------|----------|
| **Default** | Chat thread visible; syllabus context shown at top |
| **Loading** | AI "thinking" indicator; input disabled |
| **Empty** | "Ask a doubt. Set your topic above so I can help in context." |
| **Error** | "Couldn't send. [Retry]." or "AI is busy. Try in a moment." |
| **Context selector open** | Modal or inline drill-down: Class → Subject → Chapter → Topic |

**Interaction Notes:**
- Syllabus (Class → Subject → Chapter → Topic) is **only** in this screen (and in any activity that needs topic context); there is no separate "Syllabus" tab in bottom nav.
- AI behavior: same progressive guidance as in Activity screen; no direct answers by default.
- Changing context does not clear the thread; optionally show a short message: "Context changed to [Topic]. Next answers will follow this topic."

---

## 5. Accessibility Notes

### 5.1 WCAG 2.1 AA Compliance Target

| Category | Requirement | Implementation |
|----------|-------------|----------------|
| **Color Contrast** | Min 4.5:1 for normal text, 3:1 for large text | Test all text/background combinations |
| **Touch Targets** | Min 48×48px (mobile), 44×44px (desktop) | All buttons, inputs, nav items |
| **Focus Indicators** | Visible focus ring on all interactive elements | 2px solid outline, high contrast |
| **Screen Reader** | Full ARIA labels on all controls | `aria-label`, `aria-describedby`, `role` |
| **Keyboard Navigation** | Full keyboard operability | Tab order logical; Enter submits |
| **Error Identification** | Errors by more than color alone | Icon + text + border |
| **Timing** | Users can extend/disable timeouts | Timeout modal with continue option |
| **Text Resize** | Readable at 200% zoom | Responsive layout; no horizontal scroll |

### 5.2 Screen-Specific Accessibility

**Login Screen:**
```html
<!-- MPIN Input -->
<input 
  type="tel"
  inputmode="numeric"
  aria-label="MPIN digit 1 of 6"
  aria-required="true"
  aria-invalid="false"
  autocomplete="one-time-code"
/>

<!-- Error State -->
<div role="alert" aria-live="assertive">
  Incorrect MPIN. 4 attempts remaining.
</div>

<!-- Lockout State -->
<div role="alert" aria-live="assertive">
  Account locked. Try again in 15 minutes.
</div>
```

**Activity Screen:**
```html
<!-- Question -->
<article aria-labelledby="question-title">
  <h2 id="question-title">Question 2 of 5</h2>
  <p>In a parallelogram ABCD, if ∠A = 70°...</p>
</article>

<!-- AI Feedback -->
<section aria-live="polite" aria-label="AI Tutor feedback">
  <p>Almost there! Here's a hint...</p>
</section>

<!-- Progress Indicator -->
<progress 
  aria-label="Help level"
  value="1" 
  max="4"
></progress>
```

**Results Screen:**
```html
<!-- Score Announcement -->
<div role="status" aria-live="polite">
  You scored 4 out of 5 correct.
</div>

<!-- Question Breakdown -->
<ul aria-label="Question results">
  <li>Question 1: Correct</li>
  <li>Question 3: Incorrect</li>
</ul>
```

### 5.3 Mobile-Specific Accessibility

| Consideration | Implementation |
|---------------|----------------|
| **Large Touch Targets** | All interactive elements min 48×48px |
| **Swipe Gestures** | Optional; always have tap alternative |
| **Haptic Feedback** | Vibration on correct/incorrect (if enabled) |
| **Screen Orientation** | Support both portrait and landscape |
| **Reduced Motion** | Respect system preference; disable animations |
| **Voice Control** | All elements have accessible names |

### 5.4 AI Interaction Accessibility

| Consideration | Implementation |
|---------------|----------------|
| **AI Thinking State** | Announce "AI is thinking" to screen readers |
| **Confidence Signals** | Text-based, not just visual indicators |
| **Progressive Guidance** | Clear labeling: "Hint", "Approach", "Concept" |
| **Plain Language** | AI explanations use grade-appropriate vocabulary |
| **Override Options** | Clear buttons to skip AI help or try again |

---

## 6. Interaction Contract (For Dev Agent)

### User Actions → System Behavior

| User Action | System Response | Feedback |
|-------------|-----------------|----------|
| Enter MPIN digit | Advance to next input, show dot | Visual: dot appears |
| Submit MPIN | Validate with backend | Loading → Success/Error |
| Tap task card | Navigate to Activity screen | Screen transition |
| Submit answer | Send to backend for evaluation | Loading → AI Feedback |
| Request hint | Fetch AI guidance (level 1) | AI Thinking → Hint |
| Request more help | Fetch next guidance level | AI Thinking → Next level |
| Tap "Try Again" | Clear input, stay on question | Input cleared |
| Complete activity | Calculate and save results | Navigate to Results |
| Pull to refresh | Re-fetch latest data | Refresh animation |
| Open Attendance | Load attendance summary and calendar | Show present/absent counts and calendar |
| Change period (Attendance) | Re-fetch attendance for selected period | Update summary and calendar |

### Progression Rules

| Condition | Behavior |
|-----------|----------|
| Correct answer (first try) | Green state, advance immediately |
| Correct answer (after hints) | Green state, note hint usage |
| Incorrect answer | Show AI feedback, allow retry |
| Skip question | Mark as skipped, move to next |
| Exit mid-activity | Save progress, return to Home |
| Offline submission | Queue locally, sync when online |

### AI Failure Handling

| Failure Type | Fallback |
|--------------|----------|
| AI timeout (>10s) | Show standard hint from syllabus bank |
| AI error response | "Couldn't get feedback. Try again?" |
| AI returns off-topic | Filter response, show generic hint |
| Network unavailable | Use cached hints if available |

---

## STANDARD HANDOFF

```
============================================
HANDOFF: UX/UI Designer Agent → Customer Approval → Architect Final
============================================

PROJECT: Mindforge Student Experience

COMPLETED:
- [x] UX System Overview (principles, patterns, accessibility defaults)
- [x] User flows defined (1 happy path, 5 failure paths)
- [x] Navigation map created (5 screens + Doubts with Syllabus; bottom nav: Home, Attendance, Doubts, Profile)
- [x] Screen specifications documented (Login, Home, Activity, Results)
- [x] **Attendance & Calendar** (Screen 5): calendar-integrated attendance view showing how many days present/absent; entry from Home or Profile
- [x] Screen states defined (default, loading, error, success, offline, AI states)
- [x] Accessibility notes (WCAG 2.1 AA compliance target)
- [x] Interaction contract for Dev Agent

KEY UX DECISIONS:
1. Mobile-first with bottom nav: Home, Attendance, Doubts, Profile (Syllabus inside Doubts)
2. 6-digit MPIN with on-screen numeric keypad
3. Progressive AI guidance with visible "help level" indicator
4. Unified Activity screen for homework/quiz/test
5. Task-card based Home screen with clear priorities
6. Offline-first approach with sync indicators
7. **Attendance with calendar integration**: read-only view of days present/absent, entry from Home or Profile; calendar shows per-day present/absent; summary (e.g. X days present, Y days absent) for selected period

CONSTRAINTS HONORED:
- Learning-first AI (Hints → Approaches → Concepts → Solutions)
- Multi-platform parity (Android, iOS, Desktop)
- Low-bandwidth optimization (skeleton loaders, minimal assets)
- Privacy-conscious (MPIN-only, no unnecessary PII in prompts)
- Accessibility as mandatory baseline
- **Attendance & calendar**: present/absent days surfaced via calendar integration per Light Architecture v2

PENDING CUSTOMER DECISIONS:
1. Branding: Logo, color palette, typography
2. Lockout duration preferences (15 min proposed)
3. Session timeout duration (5 min proposed)
4. AI guidance level labels (current: Hint/Approach/Concept/Solution)
5. Gamification elements: stars, streaks, badges?
6. Sound effects / haptic feedback preferences

BLOCKERS: None

NEXT STEPS:
1. → CUSTOMER: Review and approve UX specification
2. → Architect Agent (Full Mode): Define data models, API contracts
3. → Developer Agent: Implement approved designs

ARTIFACTS PRODUCED:
- docs/Mindforge_Student_Experience_UX_Design_Specification.md
- docs/Mindforge_Student_Experience_UX_Design_Specification.html

DEPENDENCIES:
- Reads: docs/Mindforge_Student_Experience_Light_Architecture_v2.md

============================================
```
