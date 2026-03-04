# Mindforge Admin App

Admin control-plane for user approval, fees configuration, payment entry, and audit logs.

## Ports

| Service | Port |
|---------|------|
| Admin Frontend | 5176 |
| Admin Backend | 3004 |

## Local Development

### Prerequisites

- Node.js >= 18
- npm 10

### Run Admin Backend

```bash
# From monorepo root
cd apps/admin/backend
npm install
npm run start:dev
```

Backend runs at `http://localhost:3004` with global prefix `/v1`.

### Run Admin Frontend

```bash
# From monorepo root
cd apps/admin/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5176`. Vite proxies `/v1` and `/health` to `http://localhost:3004`.

### Run Both (from monorepo root)

```bash
npm run dev
# Runs all apps in parallel via Turborepo
```

Or run Admin only:

```bash
cd apps/admin/backend && npm run start:dev &
cd apps/admin/frontend && npm run dev
```

## API Endpoints

- `GET /health` — Health check (no auth)
- `GET /v1/version` — Service version
- `GET /v1/admin/*` — Admin APIs (JWT + role=admin required via gateway)

## Gateway Routing

Admin traffic flows via `services/gateway`:
- `/api/admin` → `http://localhost:3004`
- RBAC: `role = admin` required
