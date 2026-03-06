# Mindforge Admin Backend

PostgreSQL backend for the Admin app.

## Quick Start (Docker)

```bash
# From project root: start PostgreSQL
docker compose up -d

# Configure and run migrations
cd apps/admin/backend
cp .env.example .env
npm run build
npm run migration:run
npm run start:dev
```

## Manual PostgreSQL Setup

### 1. Install PostgreSQL

- **macOS**: `brew install postgresql@16` then `brew services start postgresql@16`
- **Ubuntu**: `sudo apt install postgresql postgresql-contrib`
- **Docker**: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mindforge_admin postgres:16`

### 2. Create database

```bash
createdb mindforge_admin
# Or: psql -c "CREATE DATABASE mindforge_admin;"
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your DB_USERNAME, DB_PASSWORD
```

### 4. Run migrations & start

```bash
npm run build
npm run migration:run
npm run start:dev
```
