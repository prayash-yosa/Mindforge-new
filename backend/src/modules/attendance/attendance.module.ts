/**
 * Mindforge Backend — Attendance Module (Task 2.3)
 *
 * Wires attendance service.
 * Repositories come from the global DatabaseModule.
 *
 * Full controller added in Sprint 5 (Task 5.1).
 */

import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Module({
  controllers: [],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
