# Mindforge — Standalone Android App

Native Android app (React Native + Expo) combining Student, Teacher, Parent, and Admin flows.

## Features

- **Role selector** — Choose Admin, Student, Teacher, or Parent on launch
- **Student** — Dashboard connected to Student backend
- **Teacher** — Dashboard connected to Teacher backend
- **Parent** — Dashboard connected to Parent backend
- **Admin** — Login, Dashboard, Users, Fees, Payments, More (full Admin portal)

## Setup

The mobile app is **standalone** (not in the monorepo workspace) to avoid Expo Router path issues.

```bash
cd apps/mobile
npm install
```

### Start backends (for Admin, Student, Teacher, Parent to work)

**All backends use PostgreSQL.** From project root:

```bash
# Option A: Setup all backends at once
./scripts/setup-all-backends.sh

# Option B: Setup Admin only
./scripts/setup-admin.sh

# Option C: Manual setup
docker compose up -d   # Creates: mindforge_admin, mindforge, mindforge_teacher, mindforge_parent
cd apps/admin/backend && cp .env.example .env && npm run build && npm run migration:run
cd apps/student/backend && cp .env.example .env && npm run build && npm run migration:run
cd apps/teacher/backend && cp .env.example .env && npm run build && npm run migration:run
cd apps/parent/backend && cp .env.example .env && npm run build && npm run migration:run
```

**If you see "ECONNREFUSED" or "Unable to connect to database":** PostgreSQL is not running. Run `docker compose up -d` first, then retry.

Start each backend (in separate terminals):

```bash
cd apps/admin/backend   && npm run start:dev  # port 3004
cd apps/student/backend && npm run start:dev  # port 3000
cd apps/teacher/backend && npm run start:dev  # port 3003
cd apps/parent/backend  && npm run start:dev  # port 3002
```

**API URLs:** The app uses `10.0.2.2` (Android emulator) or `localhost` (iOS). For a **physical device** or **Expo Go**, set your machine's IP:
```bash
export EXPO_PUBLIC_API_URL=http://192.168.1.100  # Your machine's IP
```

If you get `EXPO_ROUTER_APP_ROOT` / `require.context` errors, clear the cache:

```bash
npx expo start --clear
# Then run the build again
```

## Run on device / emulator

**Important:** Always run from `apps/mobile`:

```bash
cd apps/mobile
npm start
```

Then:
- **Android emulator:** Press `a` in the terminal
- **Expo Go (physical device):** Scan the QR code with Expo Go app
- **Android device (USB):** Ensure USB debugging is on, then press `a`

If the app doesn't open or shows a blank screen:
1. Stop the server (Ctrl+C), clear cache, and restart: `npx expo start --clear`
2. Ensure your Expo Go app is updated to the latest version (SDK 52)

## Debugging app crashes

If the app crashes on launch:

1. **Get crash logs** — Connect the device via USB and run:
   ```bash
   adb logcat AndroidRuntime:E *:S
   ```
   Then launch the app; the crash stack trace will appear in the terminal.

2. **Rebuild** — After changes, rebuild:
   ```bash
   cd android && ./gradlew clean && cd ..
   ./scripts/build-apk.sh
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

#### Android Studio: "Cannot run program 'node'" error

If Android Studio can't find `node` (common when using nvm/fnm), use one of these:

**A) Launch Android Studio from Terminal** (recommended)

So it inherits your shell's PATH:

```bash
cd apps/mobile

# If using nvm, load it first:
source ~/.nvm/nvm.sh   # or: source ~/.zshrc

# Open Android Studio with this project
open -a "Android Studio" .
```

Or use the helper script:

```bash
cd apps/mobile && ./scripts/open-android-studio.sh
```

**B) Create symlinks so Node is in a standard path**

```bash
# Find where node is (run in terminal):
which node
# Example: /Users/you/.nvm/versions/node/v20.x.x/bin/node

# Create symlinks (run once):
sudo ln -sf $(which node) /usr/local/bin/node
sudo ln -sf $(which npm) /usr/local/bin/npm
```

**C) Build from terminal instead of Android Studio**

```bash
cd apps/mobile
npx expo run:android --variant release
```

This uses your terminal's PATH and produces the APK without opening Android Studio.

#### "Dependency requires at least JVM runtime version 11" / Java 8 error

The build needs **Java 11+**. Use the build script (it uses Android Studio's JDK):

```bash
cd apps/mobile
./scripts/build-apk.sh
```

Or manually set JAVA_HOME and build:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/mobile
./android/gradlew --stop
npx expo run:android --variant release
```

If you don't have Android Studio: `brew install openjdk@17` then use `/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home` as JAVA_HOME.

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
