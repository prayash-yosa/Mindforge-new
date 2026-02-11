/**
 * Mindforge Backend — Request ID Middleware
 *
 * Assigns a unique request ID to every incoming request.
 * Used for logging, error correlation, and audit trail.
 *
 * Architecture ref: §6 Error Handling — "Log errors with request id"
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Attaches a unique `req.id` to every request.
 * Also sets the `X-Request-Id` response header for client-side correlation.
 */
function requestId(req, _res, next) {
  req.id = req.headers['x-request-id'] || uuidv4();
  _res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = requestId;
