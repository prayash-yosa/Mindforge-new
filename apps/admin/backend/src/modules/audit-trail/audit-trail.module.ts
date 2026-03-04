import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuditLogEntity } from '../../database/entities';
import { AuditTrailController } from './audit-trail.controller';
import { AuditTrailService } from './audit-trail.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminAuditLogEntity])],
  controllers: [AuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}
