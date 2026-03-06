import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UserAccountEntity,
  GradeFeeConfigEntity,
  ExtraSubjectFeeConfigEntity,
  FeePaymentEntity,
  StudentFeeSummaryEntity,
  PaymentInfoConfigEntity,
  AdminAuditLogEntity,
} from './entities';

const ALL_ENTITIES = [
  UserAccountEntity,
  GradeFeeConfigEntity,
  ExtraSubjectFeeConfigEntity,
  FeePaymentEntity,
  StudentFeeSummaryEntity,
  PaymentInfoConfigEntity,
  AdminAuditLogEntity,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<boolean>('isProduction');
        const dbUrl = config.get<string>('database.url');

        return {
          type: 'postgres',
          ...(dbUrl
            ? { url: dbUrl }
            : {
                host: config.get<string>('database.host') ?? 'localhost',
                port: config.get<number>('database.port') ?? 5432,
                username: config.get<string>('database.username') ?? 'mindforge',
                password: config.get<string>('database.password') ?? '',
                database: config.get<string>('database.name') ?? 'mindforge_admin',
              }),
          entities: ALL_ENTITIES,
          synchronize: false,
          migrations: ['dist/database/migrations/*.js'],
          migrationsRun: true,
          logging: isProduction ? ['error'] : ['error', 'warn'],
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
