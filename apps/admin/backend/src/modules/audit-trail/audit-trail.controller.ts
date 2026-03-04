import { Controller, Get, Query } from '@nestjs/common';
import { AuditTrailService } from './audit-trail.service';

@Controller('admin/audit-logs')
export class AuditTrailController {
  constructor(private readonly auditService: AuditTrailService) {}

  @Get()
  async listAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.auditService.listAuditLogs(entityType, limit ? parseInt(limit, 10) : 100);
    return { data };
  }
}
