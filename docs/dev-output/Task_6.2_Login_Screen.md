# Task 6.2 — Login Screen

**Sprint**: 6 — Client: Login, Home, Activity, Results  
**Status**: Done  
**Completed**: 2026-02-18  
**Estimate**: 2 SP

---

## Checklist

- [x] Route `/login`
- [x] 6-digit MPIN input (dots), on-screen keypad
- [x] Enter and Forgot MPIN
- [x] States: default, entering, loading, error, locked
- [x] Accessibility

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `client/src/screens/LoginScreen.tsx` | Main login screen component |

### Features

- **6-dot indicator**: Visual feedback for each digit entered
- **3x4 keypad grid**: On-screen numeric keypad
- **Auto-submit on 6th digit**: UX flow optimization
- **Error state**: Red borders, message, attempts remaining
- **Locked state**: Countdown timer (derived from `lockedUntil` from API)
- **Forgot MPIN link**: Stub for future implementation
- **Loading state**: Spinner during submission

### Key Decisions

- **Auto-submit on 6 digits**: For UX flow; no need to tap Enter
- **Generic error messages**: No identity leak in error text
- **Countdown derived from server**: `lockedUntil` from API drives UI countdown

---

## Verification

- Manual login flow with valid/invalid MPIN
- Locked state display after max attempts
- Accessibility: keyboard navigation, screen reader labels
