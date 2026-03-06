#!/bin/bash
# Setup Admin backend with PostgreSQL
# Run from project root: ./scripts/setup-admin.sh

set -e
cd "$(dirname "$0")/.."

echo "Starting PostgreSQL..."
docker compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "Setting up Admin backend..."
cd apps/admin/backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "Building and running migrations..."
npm run build
npm run migration:run

echo "Done. Start the server with: cd apps/admin/backend && npm run start:dev"
