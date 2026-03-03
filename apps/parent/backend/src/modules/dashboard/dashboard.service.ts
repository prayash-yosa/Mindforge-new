import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../../database/repositories/parent.repository';
import { TeacherSyncService } from '../integration/teacher-sync.service';
import { FeesService } from '../fees/fees.service';
import type { ParentDashboardDto } from '@mindforge/shared';

@Injectable()
export class DashboardService {
  constructor(
    private readonly parentRepo: ParentRepository,
    private readonly teacherSync: TeacherSyncService,
    private readonly feesService: FeesService,
  ) {}

  private async resolveExternalId(parentId: string): Promise<string | null> {
    const parent = await this.parentRepo.findById(parentId);
    if (!parent) return null;
    return parent.studentExternalId ?? null;
  }

  async getDashboard(parentId: string): Promise<ParentDashboardDto> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const from = monthStart.toISOString().split('T')[0];
    const to = monthEnd.toISOString().split('T')[0];

    const feesSummary = this.feesService.getSummary();

    const externalId = await this.resolveExternalId(parentId);
    let latestTest: ParentDashboardDto['latestTest'] = null;
    let attendanceThisMonth = { percent: 0, present: 0, total: 0 };

    if (externalId && this.teacherSync.isEnabled()) {
      const classes = await this.teacherSync.getClasses();
      let latestTestDate = '';
      let latestTestData: ParentDashboardDto['latestTest'] = null;

      for (const cls of classes) {
        const perf = await this.teacherSync.getClassPerformance(cls.id);
        if (!perf?.scoreTrends?.length) continue;

        for (const trend of perf.scoreTrends) {
          if (trend.date > latestTestDate) {
            const result = await this.teacherSync.getStudentTestResult(externalId, trend.testId);
            const childMarks = result?.online
              ? Math.round((result.online.scoredMarks / result.online.totalMarks) * 100)
              : result?.offline
                ? (result.offline.totalMax > 0
                  ? Math.round((result.offline.totalObtained / result.offline.totalMax) * 100)
                  : 0)
                : 0;

            latestTestDate = trend.date;
            latestTestData = {
              subject: cls.subject ?? cls.grade ?? 'General',
              testName: trend.testTitle,
              childMarks,
              highestMarks: trend.highestScore,
            };
          }
        }
      }
      latestTest = latestTestData;

      const attResp = await this.teacherSync.fetchAttendance(externalId, from, to);
      if (attResp) {
        attendanceThisMonth = {
          percent: attResp.summary.attendancePercent,
          present: attResp.summary.present,
          total: attResp.summary.totalDays,
        };
      }
    }

    return {
      latestTest,
      attendanceThisMonth,
      feesSummary,
    };
  }
}
