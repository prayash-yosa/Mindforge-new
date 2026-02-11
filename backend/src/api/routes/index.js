/**
 * Mindforge Backend — Route Aggregator
 *
 * Mounts all API route modules under their path prefixes.
 * New route files for subsequent tasks are added here.
 *
 * Architecture ref: §5.2 API Endpoints
 */

'use strict';

const { Router } = require('express');
const healthRoutes = require('./health');
const authRoutes = require('./auth');

const router = Router();

// ── Public routes (no auth required) ────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// ── Protected routes (auth middleware added in Task 1.4) ────────
// router.use('/student', authMiddleware, studentRoutes);  // Task 1.4+

module.exports = router;
