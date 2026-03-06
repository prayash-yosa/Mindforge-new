/**
 * Mindforge Parent Backend — Configuration Factory
 *
 * Typed configuration from environment variables.
 */

export default () => ({
  port: parseInt(process.env.PORT ?? '3002', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',

  enforceHttps: process.env.ENFORCE_HTTPS === 'true',
  trustProxy: process.env.TRUST_PROXY === 'true',

  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5174', 'http://localhost:3001'],

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'CHANGE_ME_IN_PRODUCTION_use_vault',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },

  /** Teacher service for progress & attendance sync */
  teacher: {
    serviceUrl: (process.env.TEACHER_SERVICE_URL ?? '').replace(/\/$/, ''),
    timeoutMs: parseInt(process.env.TEACHER_SYNC_TIMEOUT_MS ?? '5000', 10),
    retryCount: parseInt(process.env.TEACHER_SYNC_RETRY_COUNT ?? '1', 10),
  },

  /** Student service for profile/linkage */
  student: {
    serviceUrl: (process.env.STUDENT_SERVICE_URL ?? '').replace(/\/$/, ''),
    timeoutMs: parseInt(process.env.STUDENT_SYNC_TIMEOUT_MS ?? '5000', 10),
  },

  /** Dev seed: linked student UUID (get from Student DB after seeding) */
  parentDevLinkedStudentId: process.env.PARENT_DEV_LINKED_STUDENT_ID ?? '',

  /** Dev seed: Teacher API studentId / externalId (e.g. 12131) */
  parentDevExternalId: process.env.PARENT_DEV_EXTERNAL_ID ?? '12131',

  /** Fees stub (when Admin unavailable) */
  fees: {
    total: parseInt(process.env.FEES_TOTAL ?? '50000', 10),
    paid: parseInt(process.env.FEES_PAID ?? '25000', 10),
  },

  /** Pay info stub */
  payInfo: {
    qrCodeUrl: process.env.PAY_INFO_QR_URL ?? '',
    upiId: process.env.PAY_INFO_UPI_ID ?? 'school@upi',
    bankName: process.env.PAY_INFO_BANK_NAME ?? 'Example Bank',
    accountName: process.env.PAY_INFO_ACCOUNT_NAME ?? 'School Account',
    accountNumber: process.env.PAY_INFO_ACCOUNT_NUMBER ?? '1234567890',
    ifsc: process.env.PAY_INFO_IFSC ?? 'EXMP0001234',
  },

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'mindforge_parent',
  },
});
