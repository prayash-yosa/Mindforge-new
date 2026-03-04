import { Controller, Get, Param, Query } from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Controller('admin/internal')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('users/:id/status')
  async getUserStatus(@Param('id') id: string) {
    const data = await this.integrationService.getUserStatus(id);
    return { data };
  }

  @Get('payment-info')
  async getPaymentInfo() {
    const data = await this.integrationService.getPaymentInfo();
    return { data };
  }

  @Get('fees/summary/:studentId')
  async getFeeSummary(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
  ) {
    const data = await this.integrationService.getFeeSummary(studentId, academicYear ?? '2025-26');
    return { data };
  }
}
