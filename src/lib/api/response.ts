/**
 * API Response Standardization
 * Provides consistent response format across all API routes
 */

import { NextResponse } from 'next/server';

/**
 * Standard API Response structure
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  metaOrHeaders?: Partial<APIResponse['meta']> | Record<string, string>,
  headers?: Record<string, string>
): NextResponse<APIResponse<T>> {
  // If second param looks like headers (has X-Cache, X-Cache-Key, etc.)
  const isHeaders = metaOrHeaders && ('X-Cache' in metaOrHeaders || 'X-Cache-Key' in metaOrHeaders);
  
  const meta = isHeaders ? undefined : metaOrHeaders as Partial<APIResponse['meta']>;
  const finalHeaders = isHeaders ? metaOrHeaders as Record<string, string> : headers;
  
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }, finalHeaders ? { headers: finalHeaders } : undefined);
}

/**
 * Success response with pagination
 */
export function paginatedResponse<T>(
  data: T,
  pagination: PaginationMeta,
  meta?: Partial<APIResponse['meta']>
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination,
      ...meta,
    },
  });
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  code: string,
  statusCode: number = 400,
  details?: unknown
): NextResponse<APIResponse<never>> {
  const errorObj: { message: string; code: string; details?: unknown } = {
    message,
    code,
  };
  
  if (details !== undefined) {
    errorObj.details = details;
  }

  return NextResponse.json(
    {
      success: false,
      error: errorObj,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  meta?: Partial<APIResponse['meta']>
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status: 201 }
  );
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Common error responses
 */
export const CommonErrors = {
  unauthorized: () => errorResponse(
    'Authentication required',
    'UNAUTHORIZED',
    401
  ),
  
  forbidden: () => errorResponse(
    'You do not have permission to access this resource',
    'FORBIDDEN',
    403
  ),
  
  notFound: (resource = 'Resource') => errorResponse(
    `${resource} not found`,
    'NOT_FOUND',
    404
  ),
  
  badRequest: (message = 'Invalid request') => errorResponse(
    message,
    'BAD_REQUEST',
    400
  ),
  
  conflict: (message = 'Resource already exists') => errorResponse(
    message,
    'CONFLICT',
    409
  ),
  
  tooManyRequests: (resetTime?: number) => errorResponse(
    'Too many requests. Please try again later.',
    'RATE_LIMIT_EXCEEDED',
    429,
    resetTime ? { resetAt: resetTime } : undefined
  ),
  
  internalError: (message = 'An unexpected error occurred') => errorResponse(
    message,
    'INTERNAL_ERROR',
    500
  ),
  
  serviceUnavailable: () => errorResponse(
    'Service temporarily unavailable. Please try again later.',
    'SERVICE_UNAVAILABLE',
    503
  ),
};

/**
 * Helper to calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
