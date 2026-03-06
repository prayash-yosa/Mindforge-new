/**
 * PM2 Ecosystem Config — Mindforge Local Server
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 status
 *   pm2 logs
 *   pm2 stop all
 *   pm2 restart all
 */
module.exports = {
  apps: [
    {
      name: 'mindforge-student',
      cwd: './apps/student/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
    },
    {
      name: 'mindforge-parent',
      cwd: './apps/parent/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
    },
    {
      name: 'mindforge-teacher',
      cwd: './apps/teacher/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        TEACHER_SERVICE_PORT: 3003,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
    },
    {
      name: 'mindforge-admin',
      cwd: './apps/admin/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        ADMIN_SERVICE_PORT: 3004,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
    },
  ],
};
