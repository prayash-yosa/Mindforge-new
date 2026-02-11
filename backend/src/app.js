/**
 * Mindforge Backend — Express Application
 *
 * Configures the Express app with all middleware and routes.
 * This file is the app factory — it does NOT start the server.
 * Server startup is in server.js (separation for testability).
 *
 * Architecture ref: §3.1 Components — "API / Gateway layer"
 * Checklist 1.1:
 *   [x] REST API layer accepts HTTPS only; JSON request/response.
 *   [x] Request body and query validation in place.
 *   [x] Error response shape { code, message, details? } for 400–500.
 *   [x] Health check endpoint for load balancer.
 *   [x] No business or DB logic in API layer; delegates to business layer.
 */

'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config');
const requestId = require('./api/middleware/requestId');
const httpsEnforce = require('./api/middleware/httpsEnforce');
const notFound = require('./api/middleware/notFound');
const errorHandler = require('./api/middleware/errorHandler');
const routes = require('./api/routes');

/**
 * Creates and configures the Express application.
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // ── Trust proxy (required when behind LB for correct proto/ip) ──
  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  // ── Security headers ────────────────────────────────────────────
  app.use(helmet());

  // ── HTTPS enforcement ───────────────────────────────────────────
  app.use(httpsEnforce);

  // ── CORS ────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      credentials: true,
      maxAge: 86400, // 24 hours preflight cache
    })
  );

  // ── Request ID ──────────────────────────────────────────────────
  app.use(requestId);

  // ── HTTP request logging (no PII) ──────────────────────────────
  // Custom format includes request ID; skips health checks in production
  morgan.token('request-id', (req) => req.id);
  const logFormat = ':request-id :method :url :status :response-time ms';
  app.use(
    morgan(logFormat, {
      skip: (req) => config.isProduction && req.originalUrl === '/health',
    })
  );

  // ── Body parsing — JSON only (Architecture: JSON request/response) ─
  app.use(express.json({ limit: '1mb' }));

  // Reject non-JSON content types on POST/PUT/PATCH
  app.use((req, res, next) => {
    if (
      ['POST', 'PUT', 'PATCH'].includes(req.method) &&
      req.headers['content-length'] &&
      req.headers['content-length'] !== '0' &&
      !req.is('json')
    ) {
      return res.status(415).json({
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Content-Type must be application/json',
      });
    }
    next();
  });

  // ── API Routes ──────────────────────────────────────────────────
  app.use('/', routes);

  // ── 404 handler (after all routes) ──────────────────────────────
  app.use(notFound);

  // ── Central error handler (must be last) ────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
