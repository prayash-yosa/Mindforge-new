/**
 * Mindforge Backend — AppError
 *
 * Custom error class used throughout the API and business layers.
 * Maps to the consistent error response shape:
 *   { code: string, message: string, details?: any }
 *
 * Architecture ref: §6 Error Handling Strategy
 */

'use strict';

class AppError extends Error {
  /**
   * @param {number}  statusCode  HTTP status code (e.g. 400, 401, 404, 500)
   * @param {string}  code        Machine-readable error code (e.g. 'VALIDATION_ERROR')
   * @param {string}  message     Human-readable error message
   * @param {any}     [details]   Optional additional details (validation errors, etc.)
   */
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Distinguishes expected errors from programmer bugs

    // Capture stack trace (excludes constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialise to the standard error response shape.
   * @returns {{ code: string, message: string, details?: any }}
   */
  toJSON() {
    const obj = { code: this.code, message: this.message };
    if (this.details !== undefined) {
      obj.details = this.details;
    }
    return obj;
  }

  /* ── Factory helpers for common HTTP errors ─────────────────── */

  static badRequest(message = 'Bad request', details) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static validationError(message = 'Validation failed', details) {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new AppError(429, 'TOO_MANY_REQUESTS', message);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}

module.exports = AppError;
