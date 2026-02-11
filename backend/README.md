# Mindforge Backend

Backend API service for the Mindforge Student Experience platform.

## Architecture

Three-tier separation per [Technical Architecture](../docs/architecture/final/Mindforge_Student_Experience_Technical_Architecture_Final.md):

```
src/
├── server.js              # Entry point (starts server)
├── app.js                 # Express app factory
├── config/                # Environment-driven configuration
├── api/
│   ├── routes/            # Route definitions (API layer)
│   ├── middleware/         # Request ID, validation, error handling, HTTPS
│   └── validators/        # Joi request validation schemas
├── business/              # Business logic layer (stubs; expanded per sprint)
└── errors/                # AppError custom error class
```

**Key principle**: The API layer validates input and delegates to the business layer. No DB or business logic in the API layer.

## Quick Start

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start
```

## API

### Health Check

```
GET /health → 200 { status, service, timestamp, uptime }
```

### Error Response Shape

All errors follow the consistent shape:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [{ "field": "mpin", "message": "MPIN must be exactly 6 digits", "type": "string.length" }]
}
```

HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 415 (wrong content type), 429 (rate limited), 500 (server error).

### Auth Routes (stubs — Task 1.2/1.3)

```
POST /auth/mpin/verify      → Verify MPIN and issue session
POST /auth/lockout/status    → Check lockout state
POST /auth/forgot-mpin       → Initiate recovery
```

## Task Tracking

| Task | Status | Description |
|------|--------|-------------|
| 1.1  | Done   | API gateway and request validation |
| 1.2  | —      | MPIN verify and token/session issuance |
| 1.3  | —      | Lockout status and Forgot MPIN entry points |
| 1.4  | —      | Auth middleware and Bearer token validation |
