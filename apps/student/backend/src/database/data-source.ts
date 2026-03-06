/**
 * Mindforge Backend — TypeORM Data Source (PostgreSQL only)
 * Usage: npm run migration:run (after build)
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { ALL_ENTITIES } from './database.module';

const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'mindforge',
      }),
  entities: ALL_ENTITIES as never[],
  migrations: [path.join(__dirname, 'migrations', '*.js').replace(/\\/g, '/')],
  synchronize: false,
  logging: ['error', 'warn', 'schema', 'migration'],
});

export default AppDataSource;
