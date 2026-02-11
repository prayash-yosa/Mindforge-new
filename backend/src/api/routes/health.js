/**
 * Mindforge Backend — Health Check Route
 *
 * Provides a health check endpoint for the load balancer.
 * Returns 200 with basic service status.
 *
 * Checklist 1.1: "Health check endpoint for load balancer"
 */

'use strict';

const { Router } = require('express');

const router = Router();

/**
 * GET /health
 *
 * Returns service health status. Used by the load balancer for
 * readiness/liveness probes. No auth required.
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mindforge-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
