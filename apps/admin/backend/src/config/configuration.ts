/**
 * Mindforge Admin Backend — Configuration Factory
 */

export default () => ({
  port: parseInt(process.env.ADMIN_SERVICE_PORT ?? process.env.PORT ?? '3004', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',

  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5176', 'http://localhost:3000'],

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'mindforge',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'mindforge_admin',
    sqlitePath: process.env.SQLITE_PATH ?? './admin-dev.sqlite',
  },
});
