/**
 * Mindforge Backend — Audit Log Service
 *
 * Central audit logging for sensitive operations.
 * Logs to structured output; will be wired to DB in Task 2.1/8.3.
 *
 * Architecture ref: §6 "audit security events (failed logins, lockouts)"
 * Security baseline: "Audit log service" on Day 1
 */

import { Injectable, Logger } from '@nestjs/common';

export interface AuditEntry {
  /** Unique request/event ID */
  requestId: string;
  /** Action type (e.g. 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOCKOUT') */
  action: string;
  /** Pseudonymous student ID (no PII) */
  studentId?: string;
  /** IP address (for rate limiting context) */
  ip?: string;
  /** Additional metadata (no PII) */
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger('AuditLog');

  /**
   * Record an audit event.
   * Currently logs to console; will persist to audit_log table in Task 2.1.
   */
  async log(entry: AuditEntry): Promise<void> {
    const auditRecord = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Structured log — no PII, no MPIN, no stack traces
    this.logger.log(JSON.stringify(auditRecord));

    // TODO (Task 2.1): Persist to audit_log table via data access layer
  }
}
