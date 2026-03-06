# Mindforge — Setup & Run Guide

Complete guide to set up and run the Mindforge mobile app and all backend services.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 18.x | `node -v` |
| npm | >= 9.x | `npm -v` |
| PostgreSQL | 14+ | `psql --version` |
| Android Studio | Latest | Required for emulator / device builds |
| Expo CLI | Bundled with npx | `npx expo --version` |
| EAS CLI (optional) | Latest | `npm i -g eas-cli` |

> **Homebrew PostgreSQL users:** If `psql` isn't in your PATH, add it:
> ```bash
> export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
> ```

---

## 1. Database Setup (PostgreSQL)

### Start PostgreSQL

```bash
# macOS (Homebrew)
brew services start postgresql@16

# Verify it's running
pg_isready
```

### Create Databases

```bash
createdb mindforge
createdb mindforge_admin
createdb mindforge_teacher
createdb mindforge_parent
```

### Enable UUID Extension

```bash
psql -d mindforge       -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
psql -d mindforge_admin -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
psql -d mindforge_teacher -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
psql -d mindforge_parent  -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```

### Verify Databases

```bash
psql -d postgres -c "\l"
```

You should see: `mindforge`, `mindforge_admin`, `mindforge_teacher`, `mindforge_parent`.

---

## 2. Backend Setup

### Configure Environment Variables

Each backend needs a `.env` file. Copy from `.env.example`:

```bash
cd apps/student/backend && cp .env.example .env
cd apps/teacher/backend && cp .env.example .env
cd apps/parent/backend  && cp .env.example .env
cd apps/admin/backend   && cp .env.example .env
```

> **Important:** Update `DB_USERNAME` and `DB_PASSWORD` in each `.env` to match your PostgreSQL credentials. On Homebrew installs, the default user is your macOS username with no password.

### Build & Run Migrations

```bash
# Student backend (port 3000)
cd apps/student/backend
npm install && npm run build
npm run migration:run

# Teacher backend (port 3003)
cd apps/teacher/backend
npm install && npm run build
npm run migration:run

# Parent backend (port 3002)
cd apps/parent/backend
npm install && npm run build
npm run migration:run

# Admin backend (port 3004)
cd apps/admin/backend
npm install && npm run build
npm run migration:run
```

### Start All Backends

Open **4 separate terminals** (one for each backend):

```bash
# Terminal 1 — Student backend (port 3000)
cd apps/student/backend && npm run start:dev

# Terminal 2 — Parent backend (port 3002)
cd apps/parent/backend && npm run start:dev

# Terminal 3 — Teacher backend (port 3003)
cd apps/teacher/backend && npm run start:dev

# Terminal 4 — Admin backend (port 3004)
cd apps/admin/backend && npm run start:dev
```

### Verify Backends

```bash
curl http://localhost:3000/health    # Student
curl http://localhost:3002/v1/health # Parent
curl http://localhost:3003/v1/health # Teacher
curl http://localhost:3004/health    # Admin
```

All should return JSON `{ "status": "ok" }` or similar.

---

## 3. Mobile App Setup

### Install Dependencies

```bash
cd apps/mobile
npm install
```

### Run on Android Emulator

```bash
cd apps/mobile
npx expo start
```

Then press **`a`** to open on Android emulator.

> **Requires:** Android Studio with an AVD (Android Virtual Device) configured and running.

### Run on Physical Android Device

1. Enable **USB Debugging** on your phone (Settings → Developer Options)
2. Connect via USB
3. Run:

```bash
cd apps/mobile
npx expo run:android
```

Or use **Expo Go** on your phone:

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with the Expo Go app. Set your machine's IP first:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_IP npx expo start
```

### Build a Standalone APK

#### Option A: Local build (requires Android SDK)

```bash
cd apps/mobile
npx expo run:android --variant release
```

The APK will be at `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`.

#### Option B: EAS Build (cloud, no Android SDK needed)

```bash
cd apps/mobile
npx eas build --platform android --profile preview
```

The APK download link will be provided after the build completes.

---

## 4. App Architecture

### Role Selection

The app opens with a **role selector screen** where the user picks:

| Role | What It Opens |
|------|---------------|
| **Student** | Student dashboard (API health check, activities, results) |
| **Teacher** | Teacher dashboard (classes, syllabus, tests) |
| **Parent** | Parent dashboard (child progress, attendance, fees) |
| **Admin** | Admin login → tabbed portal (Dashboard, Users, Fees, Payments, More) |

Each role is a **native screen** — no WebViews. All navigation uses Expo Router with native stack and tab animations.

### API Configuration

The mobile app connects to backends at:

| Role | Backend URL |
|------|-------------|
| Student | `http://localhost:3000` (or `10.0.2.2:3000` on Android emulator) |
| Parent | `http://localhost:3002` (or `10.0.2.2:3002`) |
| Teacher | `http://localhost:3003` (or `10.0.2.2:3003`) |
| Admin | `http://localhost:3004` (or `10.0.2.2:3004`) |

The `10.0.2.2` address is auto-detected for Android emulators. For physical devices, set `EXPO_PUBLIC_API_URL`.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo (SDK 52) |
| Navigation | Expo Router (file-based) |
| Backend | NestJS (TypeScript) |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Icons | @expo/vector-icons (Ionicons) |

---

## 5. Backend Ports & Databases

| Service | Port | Database | Health Check |
|---------|------|----------|-------------|
| Student | 3000 | `mindforge` | `/health` |
| Parent | 3002 | `mindforge_parent` | `/v1/health` |
| Teacher | 3003 | `mindforge_teacher` | `/v1/health` |
| Admin | 3004 | `mindforge_admin` | `/health` |

---

## 6. Troubleshooting

### "ECONNREFUSED" when starting backend
PostgreSQL is not running. Start it:
```bash
brew services start postgresql@16
```

### "Unable to connect to the database"
Check your `.env` file — ensure `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME` are correct.

### Android emulator can't reach backend
The Android emulator uses `10.0.2.2` to reach the host machine's `localhost`. This is auto-configured. Make sure your backends are running on the correct ports.

### Metro bundler errors
Clear the cache and restart:
```bash
cd apps/mobile
npx expo start -c
```

### "Module not found" errors
Reinstall dependencies:
```bash
cd apps/mobile
rm -rf node_modules
npm install
```

### APK build fails
Ensure you have Android SDK build tools installed:
```bash
# Check Android SDK location
echo $ANDROID_HOME
# Or set it (macOS default)
export ANDROID_HOME=~/Library/Android/sdk
```

---

## 7. Quick Start (TL;DR)

```bash
# 1. Start PostgreSQL
brew services start postgresql@16

# 2. Start all backends (4 terminals)
cd apps/student/backend && npm run start:dev
cd apps/parent/backend  && npm run start:dev
cd apps/teacher/backend && npm run start:dev
cd apps/admin/backend   && npm run start:dev

# 3. Run mobile app
cd apps/mobile && npx expo start
# Press 'a' for Android emulator
```
