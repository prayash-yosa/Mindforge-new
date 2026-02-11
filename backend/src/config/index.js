/**
 * Mindforge Backend — Configuration
 *
 * Reads environment variables and exports a frozen config object.
 * No business logic here — config only.
 */

'use strict';

const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend root (one level up from src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = Object.freeze({
  /** Server */
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  /** HTTPS enforcement — enable in production behind load balancer */
  enforceHttps: process.env.ENFORCE_HTTPS === 'true',

  /** Trust proxy — enable when behind LB / reverse proxy */
  trustProxy: process.env.TRUST_PROXY === 'true',

  /** CORS origins (comma-separated in env) */
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3001'],

  /** Rate limiting defaults (can be overridden per-route later) */
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  /** Helpers */
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
});

module.exports = config;
