/**
 * Mindforge Backend — Auth Validation Schemas
 *
 * Joi schemas for authentication-related request validation.
 * Used by validateRequest middleware in auth routes.
 *
 * These are stubs for Task 1.1; full implementation in Task 1.2.
 */

'use strict';

const Joi = require('joi');

/**
 * POST /auth/mpin/verify — body schema
 * 6-digit numeric MPIN (Architecture §8: "6-digit MPIN verified by backend")
 */
const mpinVerifyBody = Joi.object({
  mpin: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'MPIN must be exactly 6 digits',
      'string.pattern.base': 'MPIN must contain only digits',
      'any.required': 'MPIN is required',
    }),
  deviceInfo: Joi.string().max(256).optional(),
});

/**
 * POST /auth/lockout/status — body schema
 * Identifies the student for lockout check.
 */
const lockoutStatusBody = Joi.object({
  studentId: Joi.string().uuid().optional(),
});

/**
 * POST /auth/forgot-mpin — body schema
 */
const forgotMpinBody = Joi.object({
  studentId: Joi.string().uuid().optional(),
  contact: Joi.string().max(256).optional(),
});

module.exports = {
  mpinVerifyBody,
  lockoutStatusBody,
  forgotMpinBody,
};
