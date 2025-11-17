import { ServiceResult } from '@/common/interfaces';
import { ErrorService } from '@/util/error.service';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Standard API Response Structure
 * Following NestJS best practices for consistent API responses
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
}

/**
 * Transform Interceptor
 *
 * ERROR HANDLING STRATEGY:
 *
 * 1. SERVICE LAYER:
 *    - Handle BUSINESS LOGIC ERRORS (validation, not found, unauthorized)
 *    - Return ServiceResult with success: false for expected errors
 *    - DO NOT catch unexpected errors (DB connection, system errors)
 *    - Let unexpected errors bubble up to Exception Filter
 *
 * 2. THIS INTERCEPTOR:
 *    - Convert ServiceResult to ApiResponse
 *    - Convert ServiceResult errors to HttpException
 *    - DO NOT catch exceptions - let them bubble to Exception Filter
 *    - Only handles ServiceResult conversion
 *
 * 3. EXCEPTION FILTER:
 *    - Handles ALL unhandled exceptions
 *    - Formats error responses consistently
 *    - Logs errors for monitoring
 *
 * ERROR TYPES:
 *
 * Business Logic Errors (handle in service, return ServiceResult):
 * - Validation errors → badRequest (400)
 * - Not found errors → badRequest (400)
 * - Unauthorized access → unauthorized (401)
 * - Forbidden access → forbidden (403)
 *
 * System Errors (let bubble up, handled by Exception Filter):
 * - Database connection errors → 500
 * - Network errors → 500
 * - Unexpected exceptions → 500
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(@Inject(ErrorService) private readonly errorService: ErrorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode || HttpStatus.OK;
    const path = request.url;

    return next.handle().pipe(
      map((data: any) => {
        // If data is a ServiceResult structure (from services)
        // Services should return ServiceResult<T> for BUSINESS LOGIC ERRORS only
        // System errors should bubble up and be handled by Exception Filter
        if (data && typeof data === 'object' && 'success' in data) {
          const result = data as ServiceResult;

          if (!result.success) {
            // Handle error - convert to HttpException
            const { name, message } =
              this.errorService.handleDbError(result.error, {
                unique: `Oops! Unique validation error occurred!`,
                foreignKeyConstraint: `Oops! You can't delete, update or create this record because it's linked to other data.`,
                recordNotFound: `We're sorry, but the requested record could not be found.`,
              }) ?? {};

            const error =
              !name || !message
                ? result.error
                : {
                    name,
                    message,
                  };

            // Throw appropriate HttpException based on error name
            if (error && typeof error === 'object' && 'name' in error) {
              if (error.name === 'badRequest') {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
              }
              if (error.name === 'unauthorized') {
                throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
              }
              if (error.name === 'forbidden') {
                throw new HttpException(error.message, HttpStatus.FORBIDDEN);
              }
              if (error.name === 'notImplemented') {
                throw new HttpException(error.message, HttpStatus.NOT_IMPLEMENTED);
              }
            }

            throw new HttpException(
              result.message || 'Something went wrong!',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          // Success case - format response following best practices
          return {
            statusCode,
            message: result.message || 'Request successful',
            data: result.data,
            timestamp: new Date().toISOString(),
            path,
          };
        }

        // If data is not a Result structure, wrap it normally
        return {
          statusCode,
          message: 'Request successful',
          data,
          timestamp: new Date().toISOString(),
          path,
        };
      }),
      catchError(error => {
        // Re-throw HttpException as-is (will be handled by HttpExceptionFilter)
        if (error instanceof HttpException) {
          return throwError(() => error);
        }
        // Wrap other errors
        return throwError(
          () =>
            new HttpException(
              error.message || 'Internal server error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
