import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../../database/repositories/parent.repository';
import { TeacherSyncService } from '../integration/teacher-sync.service';
import type { ChildProgressTestDto } from '@mindforge/shared';

export interface ProgressTestsQuery {
  subject?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ProgressSummarySeries {
  date: string;
  subject: string;
  childMarks: number;
  highestMarks: number;
  lowestMarks: number;
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly parentRepo: ParentRepository,
    private readonly teacherSync: TeacherSyncService,
  ) {}

  private async resolveExternalId(parentId: string): Promise<string | null> {
    const parent = await this.parentRepo.findById(parentId);
    if (!parent) return null;
    if (parent.studentExternalId) return parent.studentExternalId;
    return null;
  }

  async getTests(
    parentId: string,
    linkedStudentId: string,
    query: ProgressTestsQuery,
  ): Promise<{ tests: ChildProgressTestDto[]; total: number }> {
    const externalId = await this.resolveExternalId(parentId);
    if (!externalId || !this.teacherSync.isEnabled()) {
      return { tests: [], total: 0 };
    }

    const classes = await this.teacherSync.getClasses();
    const allTests: ChildProgressTestDto[] = [];

    for (const cls of classes) {
      const perf = await this.teacherSync.getClassPerformance(cls.id);
      if (!perf?.scoreTrends) continue;

      for (const trend of perf.scoreTrends) {
        const result = await this.teacherSync.getStudentTestResult(externalId, trend.testId);
        const childMarks = result?.online
          ? Math.round((result.online.scoredMarks / result.online.totalMarks) * 100)
          : result?.offline
            ? (result.offline.totalMax > 0
              ? Math.round((result.offline.totalObtained / result.offline.totalMax) * 100)
              : 0)
            : 0;

        allTests.push({
          testId: trend.testId,
          testName: trend.testTitle,
          subject: cls.subject ?? cls.grade ?? 'General',
          date: trend.date,
          childMarks,
          highestMarks: trend.highestScore,
          lowestMarks: trend.lowestScore,
        });
      }
    }

    let filtered = allTests;
    if (query.subject) {
      filtered = filtered.filter((t) => t.subject.toLowerCase().includes(query.subject!.toLowerCase()));
    }
    if (query.from) {
      filtered = filtered.filter((t) => t.date >= query.from!);
    }
    if (query.to) {
      filtered = filtered.filter((t) => t.date <= query.to!);
    }

    filtered.sort((a, b) => b.date.localeCompare(a.date));
    const total = filtered.length;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const start = (page - 1) * limit;
    const tests = filtered.slice(start, start + limit);

    return { tests, total };
  }

  async getSummary(
    parentId: string,
    from?: string,
    to?: string,
  ): Promise<{ series: ProgressSummarySeries[] }> {
    const externalId = await this.resolveExternalId(parentId);
    if (!externalId || !this.teacherSync.isEnabled()) {
      return { series: [] };
    }

    const classes = await this.teacherSync.getClasses();
    const series: ProgressSummarySeries[] = [];

    for (const cls of classes) {
      const perf = await this.teacherSync.getClassPerformance(cls.id);
      if (!perf?.scoreTrends) continue;

      for (const trend of perf.scoreTrends) {
        const result = await this.teacherSync.getStudentTestResult(externalId, trend.testId);
        const childMarks = result?.online
          ? Math.round((result.online.scoredMarks / result.online.totalMarks) * 100)
          : result?.offline
            ? (result.offline.totalMax > 0
              ? Math.round((result.offline.totalObtained / result.offline.totalMax) * 100)
              : 0)
            : 0;

        if (from && trend.date < from) continue;
        if (to && trend.date > to) continue;

        series.push({
          date: trend.date,
          subject: cls.subject ?? cls.grade ?? 'General',
          childMarks,
          highestMarks: trend.highestScore,
          lowestMarks: trend.lowestScore,
        });
      }
    }

    series.sort((a, b) => a.date.localeCompare(b.date));
    return { series };
  }
}
