#!/bin/bash
# Opens Android Studio with correct PATH so Gradle can find Node.
# Use this if you get "Cannot run program 'node'" when building in Android Studio.

# Load nvm if installed
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
elif [ -s "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc"
fi

# Open Android Studio with current directory (run from apps/mobile)
open -a "Android Studio" "$(dirname "$0")/.."
