/**
 * Mindforge Backend — HTTPS Enforcement Middleware
 *
 * When enabled (production behind LB), redirects HTTP requests to HTTPS.
 * The load balancer terminates TLS and sets `x-forwarded-proto`.
 *
 * Checklist 1.1: "REST API layer accepts HTTPS only"
 */

'use strict';

const config = require('../../config');

/**
 * Redirect HTTP to HTTPS in production (when ENFORCE_HTTPS=true).
 * In development, this middleware is a no-op.
 */
function httpsEnforce(req, res, next) {
  if (!config.enforceHttps) {
    return next();
  }

  // Behind a load balancer, check x-forwarded-proto
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  if (proto !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }

  next();
}

module.exports = httpsEnforce;
