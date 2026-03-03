import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppConfigModule } from './config/config.module';

import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { HttpsEnforceMiddleware } from './common/middleware/https-enforce.middleware';
import { JsonOnlyMiddleware } from './common/middleware/json-only.middleware';

import { DatabaseModule } from './database/database.module';
import { SeederModule } from './database/seeders/seeder.module';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FeesModule } from './modules/fees/fees.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    AppConfigModule,

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: (config.get<number>('throttle.ttl') ?? 60) * 1000,
        limit: config.get<number>('throttle.limit') ?? 100,
      }]),
    }),

    DatabaseModule,
    SeederModule,

    HealthModule,
    AuthModule,
    ProfileModule,
    IntegrationModule,
    ProgressModule,
    AttendanceModule,
    FeesModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpsEnforceMiddleware, JsonOnlyMiddleware)
      .forRoutes('*');
  }
}
