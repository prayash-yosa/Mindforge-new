/**
 * Mindforge Backend — Common Validation Schemas
 *
 * Reusable Joi schemas for common request shapes across routes.
 */

'use strict';

const Joi = require('joi');

/**
 * Pagination query params (reusable across list endpoints)
 */
const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

/**
 * UUID param validation
 */
const uuidParam = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'ID must be a valid UUID',
    'any.required': 'ID is required',
  }),
});

module.exports = {
  paginationQuery,
  uuidParam,
};
