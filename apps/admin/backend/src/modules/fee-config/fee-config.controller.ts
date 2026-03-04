import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FeeConfigService } from './fee-config.service';

@Controller('admin/fees')
export class FeeConfigController {
  constructor(private readonly feeConfigService: FeeConfigService) {}

  @Get('grade-configs')
  async listGradeConfigs(@Query('academicYear') academicYear?: string) {
    const data = await this.feeConfigService.listGradeConfigs(academicYear);
    return { data };
  }

  @Post('grade-configs')
  async createGradeConfig(@Body() body: { grade: number; academicYear: string; totalFeeAmount: number }) {
    const data = await this.feeConfigService.createGradeConfig(body);
    return { data };
  }

  @Get('extra-configs/:studentId')
  async listExtraConfigs(@Param('studentId') studentId: string) {
    const data = await this.feeConfigService.listExtraConfigs(studentId);
    return { data };
  }
}
