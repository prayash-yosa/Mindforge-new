# Mindforge Admin Backend

## PostgreSQL Setup

The admin backend uses **PostgreSQL** (no longer SQLite).

### 1. Install PostgreSQL

- **macOS**: `brew install postgresql@16` then `brew services start postgresql@16`
- **Ubuntu**: `sudo apt install postgresql postgresql-contrib`
- **Docker**: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mindforge_admin postgres:16`

### 2. Create database

```bash
createdb mindforge_admin
# Or with psql:
# psql -c "CREATE DATABASE mindforge_admin;"
```

### 3. Configure environment

Copy `.env.example` to `.env` and set:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=mindforge_admin
```

Or use a connection URL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mindforge_admin
```

### 4. Run migrations

```bash
npm run build
npm run migration:run
```

### 5. Start server

```bash
npm run start:dev
```
