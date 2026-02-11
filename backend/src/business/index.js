/**
 * Mindforge Backend — Business Layer (Stubs)
 *
 * This module exposes business-layer service stubs.
 * The API layer delegates ALL business logic here.
 * No DB access or external calls in the API layer.
 *
 * Architecture ref: §3.2 Responsibilities
 * Checklist 1.1: "No business or DB logic in API layer; delegates to business layer"
 *
 * Full implementations will be added in subsequent tasks:
 *   - Task 1.2: authService.verifyMpin, authService.issueSession
 *   - Task 1.3: authService.getLockoutStatus, authService.initForgotMpin
 *   - Task 2.3: Full business layer skeleton with DI
 */

'use strict';

const AppError = require('../errors/AppError');

/**
 * Auth service stub — will be fully implemented in Task 1.2.
 */
const authService = {
  /**
   * Verify student MPIN and issue session/token.
   * Stub: returns 501 Not Implemented.
   */
  async verifyMpin(/* mpin, deviceInfo */) {
    throw AppError.internal('Auth service not yet implemented (see Task 1.2)');
  },

  /**
   * Check lockout status for a student.
   * Stub: returns 501 Not Implemented.
   */
  async getLockoutStatus(/* studentId */) {
    throw AppError.internal('Lockout status not yet implemented (see Task 1.3)');
  },

  /**
   * Initiate forgot MPIN flow.
   * Stub: returns 501 Not Implemented.
   */
  async initForgotMpin(/* studentId, contact */) {
    throw AppError.internal('Forgot MPIN not yet implemented (see Task 1.3)');
  },
};

module.exports = {
  authService,
};
