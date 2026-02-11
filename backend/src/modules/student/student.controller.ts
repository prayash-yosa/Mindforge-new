/**
 * Mindforge Backend — Student Controller (Stub)
 *
 * Protected endpoints requiring Bearer token.
 * Used in Task 1.4 to verify AuthGuard works on protected routes.
 *
 * Full implementation in Sprint 3 (Task 3.1).
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Student } from '../../common/decorators/student.decorator';
import { AuthenticatedStudent } from '../../common/guards/auth.guard';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

@ApiTags('Student')
@ApiBearerAuth()
@Controller('v1/student')
export class StudentController {
  /**
   * GET /v1/student/me — Returns the authenticated student context.
   * Demonstrates that AuthGuard extracts student_id from JWT and attaches to request.
   *
   * Checklist 1.4: "Authenticated student_id available to business layer for scope"
   */
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated student context (from JWT)' })
  @ApiResponse({ status: 200, description: 'Authenticated student info' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token', type: ErrorResponseDto })
  getMe(@Student() student: AuthenticatedStudent) {
    return {
      studentId: student.id,
      class: student.class,
      board: student.board,
      message: 'Authenticated via JWT (AuthGuard Task 1.4)',
    };
  }
}
