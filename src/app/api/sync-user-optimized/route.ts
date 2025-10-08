import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/connection';
import User from '@/lib/database/models/User';

// In-memory cache for user sync (valid for 10 minutes)
const userSyncCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function POST() {
  const startTime = Date.now();
  console.log('User sync API: Starting...');
  
  try {
    const { userId } = await auth();
    console.log('User sync API: Auth result:', { userId: userId ? 'present' : 'missing' });
    
    if (!userId) {
      console.log('User sync API: No user ID - returning 401');
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Check cache first
    const cached = userSyncCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`User sync API: Cache hit (${Date.now() - startTime}ms)`);
      return NextResponse.json(cached.data);
    }

    console.log('User sync API: Connecting to database...');
    await dbConnect();
    console.log('User sync API: Database connected successfully');
    
    // Use upsert to avoid unnecessary queries
    console.log('User sync API: Finding/creating user for clerkId:', userId);
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        clerkId: userId,
        lastActive: new Date(),
        $setOnInsert: { 
          createdAt: new Date(),
          email: '',
          name: '',
          plan: 'free'
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: false // Skip validation for performance
      }
    );

    console.log('User sync API: Database operation completed:', { 
      userId: user._id, 
      clerkId: user.clerkId, 
      plan: user.plan 
    });

    const result = { 
      success: true, 
      user: { 
        id: user._id, 
        clerkId: user.clerkId,
        plan: user.plan 
      } 
    };

    // Cache the result
    userSyncCache.set(userId, {
      data: result,
      timestamp: Date.now()
    });

    console.log(`User sync API: Completed in ${Date.now() - startTime}ms`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('User sync API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}