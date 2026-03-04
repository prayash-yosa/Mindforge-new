import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { FeeConfigModule } from './modules/fee-config/fee-config.module';
import { PaymentEntryModule } from './modules/payment-entry/payment-entry.module';
import { PaymentInfoModule } from './modules/payment-info/payment-info.module';
import { AuditTrailModule } from './modules/audit-trail/audit-trail.module';
import { IntegrationModule } from './modules/integration/integration.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UserManagementModule,
    FeeConfigModule,
    PaymentEntryModule,
    PaymentInfoModule,
    AuditTrailModule,
    IntegrationModule,
  ],
})
export class AppModule {}
