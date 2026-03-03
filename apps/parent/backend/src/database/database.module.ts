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

        if (dbUrl || isProduction) {
          return {
            type: 'postgres' as const,
            url: dbUrl,
            host: config.get<string>('database.host') ?? 'localhost',
            port: config.get<number>('database.port') ?? 5432,
            username: config.get<string>('database.username') ?? 'mindforge',
            password: config.get<string>('database.password') ?? '',
            database: config.get<string>('database.name') ?? 'mindforge_parent',
            entities: ALL_ENTITIES,
            synchronize: false,
            logging: isProduction ? ['error'] : ['error', 'warn'],
          };
        }

        return {
          type: 'better-sqlite3' as const,
          database: config.get<string>('database.sqlitePath') ?? ':memory:',
          entities: ALL_ENTITIES,
          synchronize: true,
          logging: ['error', 'warn'],
        };
      },
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  providers: [...ALL_REPOSITORIES],
  exports: [TypeOrmModule.forFeature(ALL_ENTITIES), ...ALL_REPOSITORIES],
})
export class DatabaseModule {}
