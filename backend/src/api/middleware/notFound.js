/**
 * Mindforge Backend — 404 Not Found Handler
 *
 * Catches requests to undefined routes and returns a consistent
 * 404 error response with the standard shape.
 *
 * Checklist 1.1: Error response shape for 404
 */

'use strict';

const AppError = require('../../errors/AppError');

/**
 * Register AFTER all route definitions and BEFORE errorHandler.
 */
function notFound(req, _res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
