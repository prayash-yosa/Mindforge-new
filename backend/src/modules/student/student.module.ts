/**
 * Mindforge Backend — Student Module (Stub)
 *
 * Placeholder for student-related endpoints:
 *   GET /v1/student/today, GET /v1/student/profile, GET /v1/student/sync/status
 *
 * Task 1.4: Added GET /v1/student/me for AuthGuard verification.
 * Will be implemented in Sprint 3 (Task 3.1) and Sprint 5 (Tasks 5.3).
 */

import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';

@Module({
  controllers: [StudentController],
  providers: [],
})
export class StudentModule {}
