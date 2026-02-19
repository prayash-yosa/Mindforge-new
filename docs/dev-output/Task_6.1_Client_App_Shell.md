# Task 6.1 — Client App Shell

**Sprint**: 6 — Client: Login, Home, Activity, Results  
**Status**: Done  
**Completed**: 2026-02-18  
**Estimate**: 2 SP

---

## Checklist

- [x] API client with base URL, Bearer auth, JSON, and error shape parsing
- [x] Retry and timeout configurable
- [x] Optional local queue stub

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `client/src/api/client.ts` | fetch + AbortController, 15s timeout, 2x retry, `{code,message,details?}` error parsing, `setToken`/`clearToken`/`hasToken` |
| `client/src/api/types.ts` | Typed interfaces for all backend responses |
| `client/src/auth/AuthContext.tsx` | Login/logout, sessionStorage persistence, ProtectedRoute |
| `client/src/styles/theme.css` | Design tokens: sage green #7C9A6E, deep brown #4A3728, cream #FDF6EC |
| `client/src/components/BottomNav.tsx` | Bottom navigation component |
| `client/src/components/Skeleton.tsx` | Skeleton loading component |
| `client/vite.config.ts` | Proxy /v1 → localhost:3000 |

### React + TS + Vite Scaffold

- Scaffolded in `/client` directory
- React 18 + TypeScript + Vite

### Key Decisions

- **sessionStorage for token**: Cleared on tab close for security
- **Vite proxy for dev**: `/v1` proxy to localhost:3000
- **No external HTTP library**: Native fetch only

---

## Verification

```bash
npx tsc --noEmit
# → 0 errors

npx vite build
# → 256KB JS / 80KB gzipped

# API proxy verified
```
