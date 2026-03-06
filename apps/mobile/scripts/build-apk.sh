#!/bin/bash
# Build APK. Run from apps/mobile.
set -e

cd "$(dirname "$0")/.."

# Use Android Studio's embedded JDK (Java 21) - required for React Native
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
if [ ! -f "$JAVA_HOME/bin/java" ]; then
  # Fallback: Homebrew OpenJDK 17
  if [ -f "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home/bin/java" ]; then
    JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
  elif [ -f "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home/bin/java" ]; then
    JAVA_HOME="/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
  else
    echo "Java 17+ not found. Install Android Studio or: brew install openjdk@17"
    exit 1
  fi
fi
export JAVA_HOME

# Stop Gradle daemon (may be cached with Java 8)
cd android && ./gradlew --stop 2>/dev/null || true && cd ..

# Build
npx expo run:android --variant release
