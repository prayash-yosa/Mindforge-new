/**
 * Mindforge Backend — Auth Repository
 *
 * Data access layer for authentication-related operations.
 * Repositories = DB only. No business logic.
 *
 * Currently uses in-memory store with a seeded test student.
 * Will be wired to PostgreSQL in Task 2.1/2.2.
 *
 * Architecture ref: §5.1 Database — students, sessions, audit_log
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

/** Student record shape (matches Architecture §5.1) */
export interface StudentAuthRecord {
  id: string;
  externalId: string;
  displayName: string;
  class: string;
  board: string;
  mpinHash: string;
}

/** Session record shape */
export interface SessionRecord {
  id: string;
  studentId: string;
  token: string;
  deviceInfo?: string;
  createdAt: Date;
  expiresAt: Date;
}

/** Lockout state */
export interface LockoutRecord {
  studentId: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  lastAttemptAt: Date | null;
}

@Injectable()
export class AuthRepository implements OnModuleInit {
  private readonly logger = new Logger(AuthRepository.name);

  // ── In-memory stores (replaced by PostgreSQL in Task 2.1) ─────
  private students: Map<string, StudentAuthRecord> = new Map();
  private sessions: Map<string, SessionRecord> = new Map();
  private lockouts: Map<string, LockoutRecord> = new Map();

  /**
   * Seed a test student on startup so the flow can be verified end-to-end
   * before the real DB is connected.
   */
  async onModuleInit(): Promise<void> {
    const testMpinHash = await bcrypt.hash('123456', 10);

    const testStudent: StudentAuthRecord = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      externalId: 'STU-001',
      displayName: 'Aarav',
      class: '8',
      board: 'CBSE',
      mpinHash: testMpinHash,
    };

    this.students.set(testStudent.id, testStudent);
    this.logger.log(`Seeded test student: ${testStudent.displayName} (ID: ${testStudent.id})`);
  }

  // ── Student queries ───────────────────────────────────────────

  /**
   * Find all students and return the first one whose MPIN matches the hash.
   * In production DB: SELECT * FROM students WHERE mpin_hash matches.
   * Since MPIN alone identifies the student (no username), we iterate.
   *
   * NOTE: In real DB, this would use a more efficient lookup strategy
   * (e.g., student identifier + MPIN, not MPIN-only).
   */
  async findStudentByMpinMatch(mpin: string): Promise<StudentAuthRecord | null> {
    for (const student of this.students.values()) {
      const matches = await bcrypt.compare(mpin, student.mpinHash);
      if (matches) {
        return student;
      }
    }
    return null;
  }

  /**
   * Find student by ID.
   */
  async findStudentById(studentId: string): Promise<StudentAuthRecord | null> {
    return this.students.get(studentId) ?? null;
  }

  // ── Session management ────────────────────────────────────────

  /**
   * Create or update a session record.
   */
  async upsertSession(session: SessionRecord): Promise<void> {
    this.sessions.set(session.id, session);
    this.logger.debug(`Session upserted for student ${session.studentId}`);
  }

  /**
   * Invalidate all sessions for a student (e.g., on lockout).
   */
  async invalidateStudentSessions(studentId: string): Promise<void> {
    for (const [id, session] of this.sessions.entries()) {
      if (session.studentId === studentId) {
        this.sessions.delete(id);
      }
    }
  }

  // ── Lockout state ─────────────────────────────────────────────

  /**
   * Get current lockout state for a student.
   * Returns null if no lockout record exists.
   */
  async getLockoutState(studentId: string): Promise<LockoutRecord | null> {
    return this.lockouts.get(studentId) ?? null;
  }

  /**
   * Record a failed login attempt. Increments counter.
   * Returns the updated lockout record.
   */
  async recordFailedAttempt(studentId: string): Promise<LockoutRecord> {
    const existing = this.lockouts.get(studentId);
    const record: LockoutRecord = {
      studentId,
      failedAttempts: (existing?.failedAttempts ?? 0) + 1,
      lockedUntil: existing?.lockedUntil ?? null,
      lastAttemptAt: new Date(),
    };
    this.lockouts.set(studentId, record);
    return record;
  }

  /**
   * Set lockout until a specific time.
   */
  async setLockout(studentId: string, lockedUntil: Date): Promise<void> {
    const existing = this.lockouts.get(studentId);
    const record: LockoutRecord = {
      studentId,
      failedAttempts: existing?.failedAttempts ?? 0,
      lockedUntil,
      lastAttemptAt: existing?.lastAttemptAt ?? new Date(),
    };
    this.lockouts.set(studentId, record);
  }

  /**
   * Reset failed attempts and lockout (e.g., on successful login).
   */
  async resetLockout(studentId: string): Promise<void> {
    this.lockouts.delete(studentId);
  }
}
