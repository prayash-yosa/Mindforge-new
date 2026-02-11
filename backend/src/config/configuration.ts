/**
 * Mindforge Backend — Configuration Factory
 *
 * Typed configuration read from environment variables.
 * Used by NestJS ConfigModule.forRoot().
 */

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',

  /** HTTPS enforcement — enable behind load balancer in production */
  enforceHttps: process.env.ENFORCE_HTTPS === 'true',

  /** Trust proxy — enable when behind LB / reverse proxy */
  trustProxy: process.env.TRUST_PROXY === 'true',

  /** CORS origins (comma-separated) */
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3001'],

  /** Global rate limiting */
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },

  /** JWT configuration (Task 1.2) */
  jwt: {
    secret: process.env.JWT_SECRET ?? 'CHANGE_ME_IN_PRODUCTION_use_vault',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
});
