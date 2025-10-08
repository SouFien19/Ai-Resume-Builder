/**
 * Centralized API Error Handler
 * Provides consistent error handling across all API routes
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';
import type { MongooseError } from 'mongoose';

/**
 * Custom API Error class for throwing structured errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common API error types for easy throwing
 */
export const APIErrors = {
  Unauthorized: () => new APIError('Unauthorized', 401, 'UNAUTHORIZED'),
  Forbidden: () => new APIError('Forbidden', 403, 'FORBIDDEN'),
  NotFound: (resource = 'Resource') => new APIError(`${resource} not found`, 404, 'NOT_FOUND'),
  BadRequest: (message = 'Bad request') => new APIError(message, 400, 'BAD_REQUEST'),
  Conflict: (message = 'Resource already exists') => new APIError(message, 409, 'CONFLICT'),
  TooManyRequests: () => new APIError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'),
  InternalError: (message = 'Internal server error') => new APIError(message, 500, 'INTERNAL_ERROR'),
};

/**
 * Check if error is a Mongoose error
 */
function isMongooseError(error: unknown): error is MongooseError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    typeof (error as { name: unknown }).name === 'string' &&
    ((error as { name: string }).name.includes('Mongoose') ||
     (error as { name: string }).name === 'ValidationError' ||
     (error as { name: string }).name === 'CastError')
  );
}

/**
 * Main error handler function
 * Converts various error types to consistent API responses
 */
export function handleAPIError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('Validation error', { 
      errors: error.errors,
      issues: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
    });
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Mongoose/Database errors
  if (isMongooseError(error)) {
    const mongooseError = error as MongooseError & { code?: number };
    
    logger.error('Database error', { 
      name: mongooseError.name,
      message: mongooseError.message,
    });

    // Duplicate key error
    if (mongooseError.name === 'MongoServerError' && 'code' in mongooseError && mongooseError.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Resource already exists',
            code: 'DUPLICATE_ERROR',
          },
        },
        { status: 409 }
      );
    }

    // Validation error
    if (mongooseError.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Database validation failed',
            code: 'DATABASE_VALIDATION_ERROR',
            details: mongooseError.message,
          },
        },
        { status: 400 }
      );
    }

    // Cast error (invalid ObjectId, etc.)
    if (mongooseError.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid ID format',
            code: 'INVALID_ID',
          },
        },
        { status: 400 }
      );
    }

    // Generic database error
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Database operation failed',
          code: 'DATABASE_ERROR',
        },
      },
      { status: 500 }
    );
  }

  // Custom API errors
  if (error instanceof APIError) {
    logger.error('API error', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    const errorResponse: {
      success: false;
      error: {
        message: string;
        code: string;
        details?: unknown;
      };
    } = {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'API_ERROR',
      },
    };

    if (process.env.NODE_ENV !== 'production' && error.details) {
      errorResponse.error.details = error.details;
    }

    return NextResponse.json(errorResponse, { status: error.statusCode });
  }

  // Unknown/Unexpected errors
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error('Unexpected error', {
    message: errorMessage,
    stack: errorStack,
    error: error,
  });

  // Don't leak error details in production
  const responseMessage = 
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : errorMessage;

  return NextResponse.json(
    {
      success: false,
      error: {
        message: responseMessage,
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV !== 'production' && {
          stack: errorStack,
        }),
      },
    },
    { status: 500 }
  );
}

/**
 * Async error wrapper for API routes
 * Automatically catches and handles errors
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

/**
 * Validation helper - throws APIError if validation fails
 */
export function validateOrThrow<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new APIError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        error.errors
      );
    }
    throw error;
  }
}
