import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeePaymentEntity, StudentFeeSummaryEntity } from '../../database/entities';
import { PaymentEntryController } from './payment-entry.controller';
import { PaymentEntryService } from './payment-entry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeePaymentEntity, StudentFeeSummaryEntity]),
  ],
  controllers: [PaymentEntryController],
  providers: [PaymentEntryService],
  exports: [PaymentEntryService],
})
export class PaymentEntryModule {}
