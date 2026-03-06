import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ParentAccountEntity, ParentLoginAttemptEntity } from './entities';
import { ParentRepository } from './repositories/parent.repository';
import { LoginAttemptRepository } from './repositories/login-attempt.repository';

const ALL_ENTITIES = [ParentAccountEntity, ParentLoginAttemptEntity];
const ALL_REPOSITORIES = [ParentRepository, LoginAttemptRepository];

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
          type: 'postgres' as const,
          ...(dbUrl
            ? { url: dbUrl }
            : {
                host: config.get<string>('database.host') ?? 'localhost',
                port: config.get<number>('database.port') ?? 5432,
                username: config.get<string>('database.username') ?? 'postgres',
                password: config.get<string>('database.password') ?? 'postgres',
                database: config.get<string>('database.name') ?? 'mindforge_parent',
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
  providers: [...ALL_REPOSITORIES],
  exports: [TypeOrmModule.forFeature(ALL_ENTITIES), ...ALL_REPOSITORIES],
})
export class DatabaseModule {}
