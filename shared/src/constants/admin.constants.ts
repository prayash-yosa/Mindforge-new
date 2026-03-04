/**
 * Admin-related constants: subject codes, fee codes, etc.
 */

export const ADMIN_SUBJECT_CODES = ['COMPUTER', 'AI', 'ECONOMICS', 'OTHER'] as const;
export type AdminSubjectCode = (typeof ADMIN_SUBJECT_CODES)[number];

export const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER'] as const;
export type PaymentModeConstant = (typeof PAYMENT_MODES)[number];

export const USER_STATUSES = ['PENDING_APPROVAL', 'ACTIVE', 'DISABLED', 'DELETED', 'REJECTED'] as const;
export type UserStatusConstant = (typeof USER_STATUSES)[number];

export const AUDIT_ENTITY_TYPES = ['USER', 'GRADE_FEE', 'EXTRA_FEE', 'PAYMENT', 'PAYMENT_INFO'] as const;
export const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'DISABLE', 'REJECT', 'ACTIVATE', 'DEACTIVATE'] as const;
