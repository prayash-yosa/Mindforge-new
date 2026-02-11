/**
 * Mindforge Backend — Request Validation Middleware
 *
 * Generic middleware factory that validates req.body, req.query, or req.params
 * against a Joi schema. Returns 400 with consistent error shape on failure.
 *
 * Checklist 1.1:
 *  - "Request body and query validation in place"
 *  - "Invalid input returns 400 and consistent error shape"
 */

'use strict';

const AppError = require('../../errors/AppError');

/**
 * Creates an Express middleware that validates a specific request property.
 *
 * @param {import('joi').Schema} schema  Joi schema to validate against
 * @param {'body'|'query'|'params'} property  Which part of the request to validate
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   const Joi = require('joi');
 *   const schema = Joi.object({ mpin: Joi.string().length(6).pattern(/^\d+$/).required() });
 *   router.post('/auth/mpin/verify', validateRequest(schema, 'body'), controller);
 */
function validateRequest(schema, property = 'body') {
  return (req, _res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req[property], {
      abortEarly: false,     // Return all errors, not just the first
      stripUnknown: true,    // Remove unknown fields for safety
      convert: true,         // Allow type coercion (e.g. string → number for query params)
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
        type: d.type,
      }));

      return next(
        AppError.validationError('Request validation failed', details)
      );
    }

    // Replace raw input with validated + sanitised value
    req[property] = value;
    next();
  };
}

module.exports = validateRequest;
