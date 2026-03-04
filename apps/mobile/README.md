# Mindforge — Standalone Android App

Native Android app (React Native + Expo) combining Student, Teacher, Parent, and Admin flows.

## Features

- **Role selector** — Choose Student, Teacher, Parent, or Admin on launch
- **Admin flow** — Login, Dashboard, Users, Fees, Payments, More (full Admin portal)
- **Student / Teacher / Parent** — Placeholder screens (expand in future)

## Setup

```bash
cd apps/mobile
npm install
```

## Run on device / emulator

```bash
npm start
# Then press 'a' for Android, or scan QR with Expo Go
```

## Build APK for testing

### Option 1: EAS Build (cloud, recommended)

1. Install EAS CLI: `npm install -g eas-cli`
2. Sign in: `eas login`
3. Configure: `eas build:configure`
4. Build APK: `eas build --platform android --profile preview`

The APK will be available for download after the build completes.

### Option 2: Local build (requires Android Studio)

```bash
npx expo run:android --variant release
```

The APK will be at `android/app/build/outputs/apk/release/`.

## API URL

Set your server URL for production/testing:

- **Local dev (emulator)**: `http://10.0.2.2:3004` (Android emulator localhost)
- **Physical device (same network)**: `http://YOUR_IP:3004`
- **Production**: Set `EXPO_PUBLIC_API_URL` in `eas.json` or `.env`

Create `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=https://your-server.com
```

## Assets

Replace placeholder icons in `assets/` with your branding:

- `icon.png` — 1024×1024
- `splash.png` — 1284×2778
- `adaptive-icon.png` — 1024×1024
