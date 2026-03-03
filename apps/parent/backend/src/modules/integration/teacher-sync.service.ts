/**
 * Mindforge Parent Backend — Teacher Sync Service
 *
 * Fetches attendance and performance from Teacher backend when TEACHER_SERVICE_URL is configured.
 * Uses studentExternalId (from parent_accounts or config) as studentId for Teacher API.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DATE_RANGE_DAYS = 365;

export interface TeacherClass {
  id: string;
  grade: string;
  section: string;
  subject?: string;
}

export interface TeacherAttendanceCalendar {
  date: string;
  status: string;
}

export interface TeacherAttendanceResponse {
  summary: {
    studentId: string;
    period: { startDate: string; endDate: string };
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    attendancePercent: number;
  };
  calendar: TeacherAttendanceCalendar[];
}

export interface TeacherClassPerformance {
  averageScore: number;
  attendancePercentage: number;
  totalStudents: number;
  totalTests: number;
  scoreTrends: TeacherScoreTrend[];
}

export interface TeacherScoreTrend {
  testId: string;
  testTitle: string;
  date: string;
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  totalStudents: number;
}

export interface TeacherStudentTestResult {
  online: { scoredMarks: number; totalMarks: number; percentage?: number } | null;
  offline: { totalObtained: number; totalMax: number; entries: unknown[] } | null;
}

@Injectable()
export class TeacherSyncService {
  private readonly logger = new Logger(TeacherSyncService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retryCount: number;
  private classIds: string[] = [];
  private classIdsResolved = false;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (this.config.get<string>('teacher.serviceUrl') ?? '').replace(/\/$/, '');
    this.timeoutMs = this.config.get<number>('teacher.timeoutMs') ?? 5000;
    this.retryCount = Math.max(0, this.config.get<number>('teacher.retryCount') ?? 1);
  }

  isEnabled(): boolean {
    return !!this.baseUrl;
  }

  private async resolveClassIds(): Promise<string[]> {
    if (this.classIdsResolved) return this.classIds;
    try {
      const url = `${this.baseUrl}/v1/cross-app/classes`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { success?: boolean; data?: { classes?: { id: string }[] } };
      const ids = (json?.data?.classes ?? []).map((c) => c.id).filter(Boolean);
      if (ids.length) {
        this.classIds = ids;
        this.logger.log(`Teacher sync: resolved ${ids.length} class(es)`);
      }
      this.classIdsResolved = true;
      return ids;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Teacher sync: could not resolve classes: ${msg}`);
      this.classIdsResolved = true;
      return [];
    }
  }

  private validateDateRange(startDate: string, endDate: string): boolean {
    if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return false;
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return days <= MAX_DATE_RANGE_DAYS;
  }

  private sanitizeUid(uid: string): string {
    return uid.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  async getClasses(): Promise<TeacherClass[]> {
    if (!this.baseUrl) return [];
    try {
      const url = `${this.baseUrl}/v1/cross-app/classes`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { success?: boolean; data?: { classes?: TeacherClass[] } };
      return json?.data?.classes ?? [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Teacher sync: getClasses failed: ${msg}`);
      return [];
    }
  }

  async fetchAttendance(
    studentExternalId: string,
    startDate: string,
    endDate: string,
  ): Promise<TeacherAttendanceResponse | null> {
    if (!this.baseUrl) return null;
    const classIds = await this.resolveClassIds();
    if (!classIds.length) return null;

    const uid = this.sanitizeUid(studentExternalId);
    if (!uid) return null;
    if (!this.validateDateRange(startDate, endDate)) return null;

    const merged: TeacherAttendanceCalendar[] = [];
    const byDate = new Map<string, string>();

    for (const cid of classIds) {
      const result = await this.fetchCalendarForClass(uid, cid, startDate, endDate);
      if (!result) continue;
      for (const entry of result) {
        const current = byDate.get(entry.date);
        if (!current || entry.status === 'absent') {
          byDate.set(entry.date, entry.status);
        }
      }
    }

    for (const [date, status] of byDate.entries()) {
      merged.push({ date, status });
    }
    merged.sort((a, b) => a.date.localeCompare(b.date));

    const present = merged.filter((e) => e.status === 'present').length;
    const absent = merged.filter((e) => e.status === 'absent').length;
    const total = merged.length;
    const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      summary: {
        studentId: uid,
        period: { startDate, endDate },
        totalDays: total,
        present,
        absent,
        late: 0,
        attendancePercent,
      },
      calendar: merged,
    };
  }

  private async fetchCalendarForClass(
    studentUid: string,
    classId: string,
    startDate: string,
    endDate: string,
  ): Promise<TeacherAttendanceCalendar[] | null> {
    const url = `${this.baseUrl}/v1/cross-app/attendance/student/${encodeURIComponent(studentUid)}/class/${encodeURIComponent(classId)}/calendar?from=${startDate}&to=${endDate}`;

    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
        if (!res.ok) {
          if (attempt < this.retryCount) await this.delay(500);
          continue;
        }
        const json = (await res.json()) as { success?: boolean; data?: { calendar?: TeacherAttendanceCalendar[] } };
        if (!json.success || !json.data) return null;
        return json.data.calendar ?? [];
      } catch {
        if (attempt < this.retryCount) await this.delay(500);
      }
    }
    return null;
  }

  async getClassPerformance(classId: string): Promise<TeacherClassPerformance | null> {
    if (!this.baseUrl) return null;
    const url = `${this.baseUrl}/v1/cross-app/performance/${encodeURIComponent(classId)}`;

    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
        if (!res.ok) {
          if (attempt < this.retryCount) await this.delay(500);
          continue;
        }
        const json = (await res.json()) as { success?: boolean; data?: TeacherClassPerformance };
        return json?.data ?? null;
      } catch {
        if (attempt < this.retryCount) await this.delay(500);
      }
    }
    return null;
  }

  async getStudentTestResult(
    studentExternalId: string,
    testId: string,
  ): Promise<TeacherStudentTestResult | null> {
    if (!this.baseUrl) return null;
    const uid = this.sanitizeUid(studentExternalId);
    if (!uid) return null;

    const url = `${this.baseUrl}/v1/cross-app/performance/student/${encodeURIComponent(uid)}/test/${encodeURIComponent(testId)}`;

    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
        if (!res.ok) {
          if (attempt < this.retryCount) await this.delay(500);
          continue;
        }
        const json = (await res.json()) as { success?: boolean; data?: TeacherStudentTestResult | null };
        if (json.data === null) return null;
        return json?.data ?? null;
      } catch {
        if (attempt < this.retryCount) await this.delay(500);
      }
    }
    return null;
  }
}
