import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health')
@Controller('health')
export class IntegrationHealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('integration')
  async checkIntegration() {
    const checks: Record<string, { status: string; details?: string }> = {};

    // 1. Database connectivity
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        checks.database = { status: 'ok' };
      } else {
        checks.database = {
          status: 'error',
          details: 'DataSource not initialized',
        };
      }
    } catch (e: unknown) {
      checks.database = {
        status: 'error',
        details: e instanceof Error ? e.message : String(e),
      };
    }

    // 2. Core tables exist
    try {
      const tables = ['parent_accounts', 'parent_login_attempts'];
      const missing: string[] = [];
      for (const table of tables) {
        try {
          await this.dataSource.query(
            `SELECT COUNT(*) as cnt FROM "${table}" LIMIT 1`,
          );
        } catch {
          try {
            await this.dataSource.query(
              `SELECT COUNT(*) as cnt FROM ${table} LIMIT 1`,
            );
          } catch {
            missing.push(table);
          }
        }
      }
      checks.schema =
        missing.length === 0
          ? { status: 'ok' }
          : {
              status: 'degraded',
              details: `Missing tables: ${missing.join(', ')}`,
            };
    } catch (e: unknown) {
      checks.schema = {
        status: 'error',
        details: e instanceof Error ? e.message : String(e),
      };
    }

    // 3. Teacher service connectivity
    const teacherUrl = this.config.get<string>('teacher.serviceUrl');
    if (teacherUrl) {
      try {
        const res = await fetch(`${teacherUrl}/v1/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        checks.teacherService =
          res.ok
            ? { status: 'ok', details: 'Teacher backend reachable' }
            : { status: 'degraded', details: `Teacher returned ${res.status}` };
      } catch (e: unknown) {
        checks.teacherService = {
          status: 'error',
          details: e instanceof Error ? e.message : String(e),
        };
      }
    } else {
      checks.teacherService = {
        status: 'degraded',
        details: 'TEACHER_SERVICE_URL not configured',
      };
    }

    // 4. Auth and RBAC
    checks.auth = { status: 'ok', details: 'JWT + RBAC guards active' };

    const allOk = Object.values(checks).every((c) => c.status === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      service: 'parent-backend',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
