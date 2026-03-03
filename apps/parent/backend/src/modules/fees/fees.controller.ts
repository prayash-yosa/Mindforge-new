import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FeesService } from './fees.service';

@ApiTags('Fees')
@ApiBearerAuth()
@Controller('parent/child/fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get('summary')
  async getSummary() {
    const data = this.feesService.getSummary();
    return { success: true, data };
  }

  @Get('history')
  async getHistory() {
    const data = this.feesService.getHistory();
    return { success: true, data };
  }

  @Get('pay-info')
  async getPayInfo() {
    const data = this.feesService.getPayInfo();
    return { success: true, data };
  }
}
