/**
 * Mindforge Backend — Auth Routes
 *
 * Defines authentication-related API endpoints.
 * Validates requests and delegates to business layer.
 *
 * Architecture ref: §5.2 API Endpoints — Auth domain
 * Checklist 1.1: API layer delegates to business layer; no DB logic here.
 *
 * Full logic in Tasks 1.2 and 1.3; this file wires routes to validation + stubs.
 */

'use strict';

const { Router } = require('express');
const validateRequest = require('../middleware/validateRequest');
const { mpinVerifyBody, lockoutStatusBody, forgotMpinBody } = require('../validators/auth');
const { authService } = require('../../business');

const router = Router();

/**
 * POST /auth/mpin/verify
 *
 * Verify 6-digit MPIN; return token/session on success.
 * Rate limiting and lockout will be added in Task 1.2 / 8.3.
 */
router.post(
  '/mpin/verify',
  validateRequest(mpinVerifyBody, 'body'),
  async (req, res, next) => {
    try {
      const { mpin, deviceInfo } = req.body;
      const result = await authService.verifyMpin(mpin, deviceInfo);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /auth/lockout/status
 *
 * Check lockout state (e.g. after failed attempts).
 */
router.post(
  '/lockout/status',
  validateRequest(lockoutStatusBody, 'body'),
  async (req, res, next) => {
    try {
      const result = await authService.getLockoutStatus(req.body.studentId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /auth/forgot-mpin
 *
 * Initiate MPIN recovery flow.
 */
router.post(
  '/forgot-mpin',
  validateRequest(forgotMpinBody, 'body'),
  async (req, res, next) => {
    try {
      const result = await authService.initForgotMpin(
        req.body.studentId,
        req.body.contact
      );
      res.status(202).json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
