import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountEntity, PaymentInfoConfigEntity, StudentFeeSummaryEntity } from '../../database/entities';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAccountEntity, PaymentInfoConfigEntity, StudentFeeSummaryEntity]),
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
