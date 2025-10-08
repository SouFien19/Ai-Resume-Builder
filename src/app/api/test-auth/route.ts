import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    console.log('Auth test API: Starting...');
    
    // Check if Clerk env vars are available
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    
    console.log('Auth test API: Environment check', {
      publishableKey: publishableKey ? 'present' : 'missing',
      secretKey: secretKey ? 'present' : 'missing'
    });
    
    const { userId: clerkId } = await auth();
    console.log('Auth test API: Auth result:', { clerkId: clerkId ? 'present' : 'missing' });

    return NextResponse.json({
      success: true,
      authenticated: !!clerkId,
      clerkId: clerkId || null,
      environment: {
        publishableKey: !!publishableKey,
        secretKey: !!secretKey
      }
    });
    
  } catch (error) {
    console.error('Auth test API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      authenticated: false 
    }, { status: 500 });
  }
}