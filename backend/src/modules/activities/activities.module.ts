/**
 * Mindforge Backend — Activities Module (Sprint 3)
 *
 * Wires activities controller, services, and grading/doubt services.
 * Repositories come from the global DatabaseModule.
 */

import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { GradingService } from './grading.service';
import { DoubtService } from './doubt.service';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, GradingService, DoubtService],
  exports: [ActivitiesService, GradingService, DoubtService],
})
export class ActivitiesModule {}
