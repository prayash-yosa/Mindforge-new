import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { IntegrationHealthController } from './integration-health.controller';

@Module({
  controllers: [HealthController, IntegrationHealthController],
})
export class HealthModule {}
