import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeFeeConfigEntity, ExtraSubjectFeeConfigEntity } from '../../database/entities';
import { FeeConfigController } from './fee-config.controller';
import { FeeConfigService } from './fee-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradeFeeConfigEntity, ExtraSubjectFeeConfigEntity]),
  ],
  controllers: [FeeConfigController],
  providers: [FeeConfigService],
  exports: [FeeConfigService],
})
export class FeeConfigModule {}
