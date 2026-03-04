import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentInfoConfigEntity } from '../../database/entities';
import { PaymentInfoController } from './payment-info.controller';
import { PaymentInfoService } from './payment-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentInfoConfigEntity])],
  controllers: [PaymentInfoController],
  providers: [PaymentInfoService],
  exports: [PaymentInfoService],
})
export class PaymentInfoModule {}
