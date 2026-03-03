import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';

const STATUS_CODE_MAP: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown;
    let retryAfter: number | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const res = exResponse as Record<string, unknown>;
        if (Array.isArray(res.message)) {
          code = 'VALIDATION_ERROR';
          message = 'Request validation failed';
          details = (res.message as string[]).map((msg) => ({ message: msg }));
        } else {
          message = (res.message as string) ?? message;
          code = (res.code as string) ?? STATUS_CODE_MAP[statusCode] ?? code;
          details = res.details;
          retryAfter = res.retryAfter as number | undefined;
        }
      }
    }

    const requestId = (request as { id?: string }).id ?? request.headers['x-request-id'] ?? '-';
    this.logger[statusCode >= 500 ? 'error' : 'warn'](
      JSON.stringify({ requestId, statusCode, code, message, path: request.originalUrl }),
    );

    const body: ErrorResponseDto & { retryAfter?: number } = { code, message };
    if (details !== undefined) body.details = details;
    if (retryAfter !== undefined) body.retryAfter = retryAfter;

    response.status(statusCode).json(body);
  }
}
