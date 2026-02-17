# Task 5.2 — Doubts API + Syllabus Tree

**Sprint**: 5 — Attendance & Doubts API  
**Status**: Done  
**Completed**: 2026-02-17  
**Estimate**: 3 SP

---

## Checklist

- [x] `GET /v1/student/doubts` returns list of threads
- [x] `GET /v1/student/doubts/:threadId` returns thread with messages
- [x] `POST /v1/student/doubts` creates message with syllabus context; AI responds; stores messages
- [x] `GET /v1/student/syllabus/tree` returns Class → Subject → Chapter → Topic hierarchy
- [x] Replies inherit thread's existing syllabus context (no re-specification needed)
- [x] Minimal PII in AI prompts; fallback on AI failure

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/modules/activities/doubts.controller.ts` | HTTP layer for doubt endpoints |
| `backend/src/modules/activities/dto/doubt.dto.ts` | CreateDoubtDto with message, threadId, syllabus fields |
| `backend/src/modules/syllabus/syllabus.controller.ts` | HTTP layer for syllabus tree |
| `backend/src/modules/syllabus/syllabus.service.ts` | Builds hierarchical tree from flat records |
| `backend/src/modules/syllabus/syllabus.module.ts` | Wires SyllabusController + SyllabusService |

### Files Modified

| File | Change |
|------|--------|
| `backend/src/modules/activities/activities.module.ts` | Added DoubtsController |
| `backend/src/modules/activities/doubt.service.ts` | Replies now inherit thread's syllabus context |
| `backend/src/app.module.ts` | Added SyllabusModule import |

### Endpoints

```
GET  /v1/student/doubts              — List all threads (sorted by updatedAt DESC)
GET  /v1/student/doubts/:threadId    — Thread detail with messages
POST /v1/student/doubts              — Create new thread or reply
GET  /v1/student/syllabus/tree       — Class → Subject → Chapter → Topic hierarchy
```

### POST /v1/student/doubts — Request Body

```json
{
  "message": "Why does pressure increase with depth?",
  "threadId": "optional-uuid (reply to existing thread)",
  "syllabusClass": "8",
  "syllabusSubject": "Science",
  "syllabusChapter": "Force and Pressure",
  "syllabusTopic": "Pressure in Fluids"
}
```

### Syllabus Tree Response Shape

```json
{
  "class": "8",
  "board": "CBSE",
  "subjects": [
    {
      "subject": "Mathematics",
      "chapters": [
        {
          "chapter": "Linear Equations",
          "topics": [
            { "id": "uuid", "topic": "One Variable" },
            { "id": "uuid", "topic": "Two Variables" }
          ]
        }
      ]
    }
  ]
}
```

### Key Decisions

- **Syllabus context inheritance**: Replies to existing threads automatically use the thread's original syllabus context (class/subject/chapter/topic), so students don't need to re-specify context for follow-up questions
- **AI integration**: Uses AiProviderService with PromptBuilderService.buildDoubtPrompt — syllabus-aligned, PII-free
- **Separate module for Syllabus**: SyllabusModule keeps controller/service clean; repositories from global DatabaseModule

---

## Verification

```bash
# List threads (empty initially)
curl -s http://localhost:3000/v1/student/doubts -H "Authorization: Bearer $TOKEN"

# Create new thread with syllabus context
curl -s -X POST http://localhost:3000/v1/student/doubts \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"message":"Why does pressure increase with depth?","syllabusSubject":"Science","syllabusChapter":"Force and Pressure","syllabusTopic":"Pressure in Fluids"}'

# Reply to existing thread (inherits context)
curl -s -X POST http://localhost:3000/v1/student/doubts \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"message":"Can you explain Archimedes principle?","threadId":"THREAD_UUID"}'

# Syllabus tree
curl -s http://localhost:3000/v1/student/syllabus/tree -H "Authorization: Bearer $TOKEN"
```
