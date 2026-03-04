import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuditLogEntity } from '../../database/entities';

@Injectable()
export class AuditTrailService {
  constructor(
    @InjectRepository(AdminAuditLogEntity)
    private readonly auditRepo: Repository<AdminAuditLogEntity>,
  ) {}

  async listAuditLogs(entityType?: string, limit = 100) {
    const qb = this.auditRepo
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC')
      .take(limit);
    if (entityType) qb.andWhere('a.entity_type = :type', { type: entityType });
    return qb.getMany();
  }
}
