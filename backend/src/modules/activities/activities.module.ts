/**
 * Mindforge Backend — Activities Module (Sprint 3–5)
 *
 * Wires activities + doubts controllers, services, and feedback/grading/doubt services.
 * Repositories come from the global DatabaseModule.
 * AI services come from the global AiModule.
 */

import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { DoubtsController } from './doubts.controller';
import { ActivitiesService } from './activities.service';
import { FeedbackService } from './feedback.service';
import { GradingService } from './grading.service';
import { DoubtService } from './doubt.service';

@Module({
  controllers: [ActivitiesController, DoubtsController],
  providers: [ActivitiesService, FeedbackService, GradingService, DoubtService],
  exports: [ActivitiesService, FeedbackService, GradingService, DoubtService],
})
export class ActivitiesModule {}
