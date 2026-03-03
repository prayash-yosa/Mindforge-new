import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Parent } from '../../common/decorators/parent.decorator';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('parent/child/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('tests')
  async getTests(
    @Parent('parentId') parentId: string,
    @Parent('linkedStudentId') linkedStudentId: string,
    @Query('subject') subject?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const { tests, total } = await this.progressService.getTests(parentId, linkedStudentId, {
      subject,
      from,
      to,
      page,
      limit,
    });
    return { success: true, data: { tests, total } };
  }

  @Get('summary')
  async getSummary(
    @Parent('parentId') parentId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const { series } = await this.progressService.getSummary(parentId, from, to);
    return { success: true, data: { series } };
  }
}
