import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/database/connection';
import { logger } from '@/lib/logger';

/**
 * Health check endpoint for analytics system
 * Returns system status and connectivity information
 * Only accessible to authenticated users
 */
export async function GET() {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint not available in production' }, { status: 404 });
  }

  try {
    logger.info('Health check initiated');
    
    const startTime = Date.now();
    
    // Check authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { status: 'error', message: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Check database connectivity
    await connectToDatabase();
    const dbConnectTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbConnectTime}ms`
        },
        authentication: {
          status: 'active',
          userId: clerkId
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    logger.info('Health check completed successfully', { 
      responseTime: Date.now() - startTime,
      userId: clerkId 
    });

    return NextResponse.json(healthStatus);

  } catch (error) {
    logger.error('Health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'System check failed'
    }, { status: 500 });
  }
}