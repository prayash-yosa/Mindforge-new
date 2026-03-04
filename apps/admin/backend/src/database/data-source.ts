import { DataSource } from 'typeorm';
import * as path from 'path';
import {
  UserAccountEntity,
  GradeFeeConfigEntity,
  ExtraSubjectFeeConfigEntity,
  FeePaymentEntity,
  StudentFeeSummaryEntity,
  PaymentInfoConfigEntity,
  AdminAuditLogEntity,
} from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'mindforge',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'mindforge_admin',
      }),
  entities: [
    UserAccountEntity,
    GradeFeeConfigEntity,
    ExtraSubjectFeeConfigEntity,
    FeePaymentEntity,
    StudentFeeSummaryEntity,
    PaymentInfoConfigEntity,
    AdminAuditLogEntity,
  ],
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});

export default AppDataSource;
