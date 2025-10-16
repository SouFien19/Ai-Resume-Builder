/**
 * AI Service Health Check Endpoint
 * Used by idle task scheduler to verify AI services are available
 */

import { NextResponse } from 'next/server';

export async function HEAD() {
  try {
    // Check if Gemini API key is configured
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    
    if (!hasApiKey) {
      return new NextResponse(null, { 
        status: 503,
        statusText: 'Service Unavailable - API Key Not Configured'
      });
    }

    // Return success
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}

export async function GET() {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    
    return NextResponse.json({
      status: hasApiKey ? 'healthy' : 'unavailable',
      service: 'ai-content-generation',
      timestamp: new Date().toISOString(),
      configured: hasApiKey,
    }, {
      status: hasApiKey ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      service: 'ai-content-generation',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}
