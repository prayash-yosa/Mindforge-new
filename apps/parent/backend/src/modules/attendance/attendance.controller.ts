import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Parent } from '../../common/decorators/parent.decorator';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('parent/child/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('weekly')
  async getWeekly(
    @Parent('parentId') parentId: string,
    @Query('weekStart') weekStart?: string,
  ) {
    const data = await this.attendanceService.getWeekly(parentId, weekStart);
    return { success: true, data };
  }

  @Get('monthly')
  async getMonthly(
    @Parent('parentId') parentId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    const m = Math.max(1, Math.min(12, month || new Date().getMonth() + 1));
    const y = year || new Date().getFullYear();
    const data = await this.attendanceService.getMonthly(parentId, m, y);
    return { success: true, data };
  }

  @Get('yearly')
  async getYearly(
    @Parent('parentId') parentId: string,
    @Query('year') year: number,
  ) {
    const y = year || new Date().getFullYear();
    const data = await this.attendanceService.getYearly(parentId, y);
    return { success: true, data };
  }
}
