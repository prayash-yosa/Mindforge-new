#!/bin/bash
# Setup all Mindforge backends with PostgreSQL
# Run from project root: ./scripts/setup-all-backends.sh
# Requires: docker compose up -d (PostgreSQL with all databases)

set -e
cd "$(dirname "$0")/.."

echo "=== Mindforge — PostgreSQL Setup ==="
echo "Starting PostgreSQL (creates mindforge_admin, mindforge, mindforge_teacher, mindforge_parent)..."
docker compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 6

setup_backend() {
  local dir=$1
  local name=$2
  echo ""
  echo "--- Setting up $name ---"
  (cd "$dir" && {
    [ -f .env ] || { cp .env.example .env && echo "Created .env"; }
    npm run build
    npm run migration:run
  })
}

# Admin
setup_backend "apps/admin/backend" "Admin"

# Student
setup_backend "apps/student/backend" "Student"

# Teacher
setup_backend "apps/teacher/backend" "Teacher"

# Parent
setup_backend "apps/parent/backend" "Parent"

echo ""
echo "=== Done ==="
echo "Start backends:"
echo "  cd apps/admin/backend   && npm run start:dev  # port 3004"
echo "  cd apps/student/backend && npm run start:dev  # port 3000"
echo "  cd apps/teacher/backend && npm run start:dev   # port 3003"
echo "  cd apps/parent/backend  && npm run start:dev  # port 3002"
