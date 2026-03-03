import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../../database/repositories/parent.repository';
import { TeacherSyncService } from '../integration/teacher-sync.service';
import type { ChildAttendanceSummaryDto } from '@mindforge/shared';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly parentRepo: ParentRepository,
    private readonly teacherSync: TeacherSyncService,
  ) {}

  private async resolveExternalId(parentId: string): Promise<string | null> {
    const parent = await this.parentRepo.findById(parentId);
    if (!parent) return null;
    return parent.studentExternalId ?? null;
  }

  private getWeekBounds(weekStart?: string): { start: string; end: string } {
    const base = weekStart ? new Date(weekStart) : new Date();
    const day = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(base);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }

  private getMonthBounds(month: number, year: number): { start: string; end: string } {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }

  private getYearBounds(year: number): { start: string; end: string } {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }

  async getWeekly(parentId: string, weekStart?: string): Promise<ChildAttendanceSummaryDto> {
    const externalId = await this.resolveExternalId(parentId);
    const { start, end } = this.getWeekBounds(weekStart);

    if (!externalId || !this.teacherSync.isEnabled()) {
      return {
        period: { startDate: start, endDate: end },
        present: 0,
        absent: 0,
        total: 0,
        percent: 0,
        absentDates: [],
      };
    }

    const resp = await this.teacherSync.fetchAttendance(externalId, start, end);
    if (!resp) {
      return {
        period: { startDate: start, endDate: end },
        present: 0,
        absent: 0,
        total: 0,
        percent: 0,
        absentDates: [],
      };
    }

    const absentDates = (resp.calendar ?? [])
      .filter((e) => e.status === 'absent')
      .map((e) => e.date)
      .sort();

    return {
      period: { startDate: start, endDate: end },
      present: resp.summary.present,
      absent: resp.summary.absent,
      total: resp.summary.totalDays,
      percent: resp.summary.attendancePercent,
      absentDates,
    };
  }

  async getMonthly(parentId: string, month: number, year: number): Promise<ChildAttendanceSummaryDto> {
    const externalId = await this.resolveExternalId(parentId);
    const { start, end } = this.getMonthBounds(month, year);

    if (!externalId || !this.teacherSync.isEnabled()) {
      return {
        period: { startDate: start, endDate: end },
        present: 0,
        absent: 0,
        total: 0,
        percent: 0,
        absentDates: [],
      };
    }

    const resp = await this.teacherSync.fetchAttendance(externalId, start, end);
    if (!resp) {
      return {
        period: { startDate: start, endDate: end },
        present: 0,
        absent: 0,
        total: 0,
        percent: 0,
        absentDates: [],
      };
    }

    const absentDates = (resp.calendar ?? [])
      .filter((e) => e.status === 'absent')
      .map((e) => e.date)
      .sort();

    return {
      period: { startDate: start, endDate: end },
      present: resp.summary.present,
      absent: resp.summary.absent,
      total: resp.summary.totalDays,
      percent: resp.summary.attendancePercent,
      absentDates,
    };
  }

  async getYearly(parentId: string, year: number): Promise<ChildAttendanceSummaryDto> {
    const externalId = await this.resolveExternalId(parentId);
    const { start, end } = this.getYearBounds(year);

    if (!externalId || !this.teacherSync.isEnabled()) {
      return {
        period: { startDate: start, endDate: end },
        present: 0,
        absent: 0,
        total: 0,
        percent: 0,
        absentDates: [],
      };
    }

    const resp = await this.teacherSync.fetchAttendance(externalId, start, end);
    if (!resp) {
      return {
        period: { startDate: start, endDate: end },
        present: 0,
        absent: 0,
        total: 0,
        percent: 0,
        absentDates: [],
      };
    }

    const absentDates = (resp.calendar ?? [])
      .filter((e) => e.status === 'absent')
      .map((e) => e.date)
      .sort();

    return {
      period: { startDate: start, endDate: end },
      present: resp.summary.present,
      absent: resp.summary.absent,
      total: resp.summary.totalDays,
      percent: resp.summary.attendancePercent,
      absentDates,
    };
  }
}
