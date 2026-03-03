import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Parent } from '../../common/decorators/parent.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('parent')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  async getDashboard(@Parent('parentId') parentId: string) {
    const data = await this.dashboardService.getDashboard(parentId);
    return { success: true, data };
  }
}
