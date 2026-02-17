# Task 4.1 — AI Provider Integration and Timeout/Fallback

**Sprint**: 4 — AI Integration & Grading
**Status**: Done
**Date**: 2026-02-16
**Estimate**: 3 SP

---

## Checklist

- [x] Outbound HTTP to AI provider (OpenAI-compatible); prompts use minimal context (pseudonymous ID, syllabus scope); no raw PII.
- [x] Timeout (10s); on timeout return fallback; on provider error return user-friendly message and optional cached hint.
- [x] Responses validated before storage/display; no raw AI errors to client.
- [x] Token usage and caps considered; cost tiering (cheap for grading, higher for doubt/concept).

---

## Implementation

### AiProviderService (`src/modules/ai/ai-provider.service.ts`)

- **HTTP client**: Native `fetch` + `AbortController` for timeout (platform-native, no external deps)
- **Timeout**: Configurable (default 10s); `AbortError` caught → fallback
- **Fallback**: Every call site provides a `FallbackConfig { content, reason }`; on failure the fallback content is returned with `fromFallback: true`
- **Response validation**: `sanitizeContent()` removes excessive whitespace, rejects raw error objects
- **Token logging**: Logs `model`, `tier`, `tokensUsed.total`, `latencyMs` per call
- **Cost tiering**: `grading` tier → cheap model (gpt-4o-mini); `feedback` tier → higher model

### PromptBuilderService (`src/modules/ai/prompt-builder.service.ts`)

- **Grading prompts**: Syllabus context + rubric + question + answer → JSON response
- **Feedback prompts**: Level-specific instructions (Hint/Approach/Concept/Solution)
- **Doubt prompts**: Conversation history (last 10 messages) + syllabus context
- **No PII**: All prompts use subject/chapter/topic only; no student names, emails, or personal data
- **Static fallbacks**: Syllabus-aware fallback text per feedback level

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible endpoint |
| `AI_API_KEY` | (empty) | API key; no key → fallback mode |
| `AI_GRADING_MODEL` | `gpt-4o-mini` | Cheap model for grading |
| `AI_FEEDBACK_MODEL` | `gpt-4o-mini` | Higher model for feedback/doubt |
| `AI_TIMEOUT_MS` | `10000` | Request timeout |
| `AI_MAX_TOKENS` | `512` | Max tokens per response |
| `AI_TEMPERATURE` | `0.3` | Low temperature for deterministic outputs |

---

## Files Created

| File | Description |
|------|-------------|
| `src/modules/ai/ai-provider.service.ts` | AI HTTP client with timeout/fallback |
| `src/modules/ai/prompt-builder.service.ts` | Structured prompt builders |
| `src/modules/ai/ai.module.ts` | Global AI module |
| `src/config/configuration.ts` | Added `ai` config section |
| `backend/.env.example` | Added AI config variables |
| `src/app.module.ts` | Imported AiModule |

---

## Verification

```
AI with no API key → AiProviderService logs "no_api_key" fallback
All endpoints return user-friendly fallback content
No raw AI errors exposed in any response
Token usage logging format: "AI call: model=... tier=... tokens=... latency=..."
```
