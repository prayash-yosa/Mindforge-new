/**
 * Mindforge Parent Backend — Standard Error Response DTO
 *
 * Consistent error shape: { code, message, details? }
 */

export class ErrorResponseDto {
  code: string;
  message: string;
  details?: unknown;
}
