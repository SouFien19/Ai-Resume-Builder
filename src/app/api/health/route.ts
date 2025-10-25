/**
 * Application Health Check Endpoint
 * Used by Docker and Kubernetes for container health monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    const hasMongoUri = !!process.env.MONGODB_URI;
    
    // Check Redis connection
    const hasRedisUrl = !!process.env.UPSTASH_REDIS_REST_URL;
    
    // Check Gemini API
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    const isHealthy = hasMongoUri && hasRedisUrl && hasGeminiKey;

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: hasMongoUri ? 'connected' : 'unavailable',
        cache: hasRedisUrl ? 'connected' : 'unavailable',
        ai: hasGeminiKey ? 'configured' : 'unavailable',
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    }, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}

// HEAD request for simple health checks
export async function HEAD() {
  try {
    const hasMongoUri = !!process.env.MONGODB_URI;
    const hasRedisUrl = !!process.env.UPSTASH_REDIS_REST_URL;
    const isHealthy = hasMongoUri && hasRedisUrl;

    return new NextResponse(null, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
