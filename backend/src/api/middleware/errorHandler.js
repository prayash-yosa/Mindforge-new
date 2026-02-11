/**
 * Mindforge Backend — Central Error Handler
 *
 * Catches all errors thrown or passed via next(err) and returns
 * the consistent error response shape: { code, message, details? }
 *
 * Architecture ref: §6 Error Handling Strategy
 * Checklist 1.1: "Error response shape { code, message, details? } for 400, 401, 403, 404, 429, 500"
 */

'use strict';

const AppError = require('../../errors/AppError');
const config = require('../../config');

/**
 * Express error-handling middleware (4 args).
 * Must be registered LAST after all routes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // ── Determine status and shape ────────────────────────────────

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Handle Joi / validation errors that bypassed validateRequest (safety net)
  if (err.isJoi) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.details?.map((d) => ({
      field: d.path?.join('.'),
      message: d.message,
      type: d.type,
    }));
  }

  // Handle JSON parse errors from express.json()
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Request body contains invalid JSON';
    details = undefined;
  }

  // Handle payload too large
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body exceeds the allowed size';
    details = undefined;
  }

  // ── Log (no PII; include request ID) ──────────────────────────

  const logEntry = {
    requestId: req.id,
    statusCode,
    code,
    message,
    method: req.method,
    path: req.originalUrl,
  };

  if (statusCode >= 500) {
    // Server errors: log full stack (never to client)
    console.error('[ERROR]', JSON.stringify(logEntry), err.stack);
  } else {
    // Client errors: info-level
    console.warn('[WARN]', JSON.stringify(logEntry));
  }

  // ── Build response ────────────────────────────────────────────

  const body = { code, message };

  if (details !== undefined) {
    body.details = details;
  }

  // Never expose stack traces to client
  if (config.isDevelopment && statusCode >= 500) {
    body._stack = err.stack; // Dev-only convenience; stripped in production
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
