import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '../../../lib/database/connection';
import User from '../../../lib/database/models/User';

export async function POST() {
  try {
    await connectToDatabase();
    
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();
    
    if (!clerkId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in database
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Create new user record with full admin fields
      user = new User({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        photo: clerkUser.imageUrl,
        plan: 'free',
        role: 'user',
        isActive: true,
        isSuspended: false,
        lastActive: new Date(),
        metadata: {
          lastLogin: new Date(),
          loginCount: 1,
          signupDate: new Date(),
          ipAddresses: [],
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        aiUsage: {
          totalRequests: 0,
          requestsThisMonth: 0,
          estimatedCost: 0,
        },
      });
      
      await user.save();
    } else {
      // Update existing user's last active, login count, and profile info
      user.lastActive = new Date();
      
      // Update profile info from Clerk (in case user updated their name/photo)
      user.firstName = clerkUser.firstName;
      user.lastName = clerkUser.lastName;
      user.name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || user.name || 'User';
      user.photo = clerkUser.imageUrl;
      
      if (user.metadata) {
        user.metadata.lastLogin = new Date();
        user.metadata.loginCount = (user.metadata.loginCount || 0) + 1;
      }
      await user.save();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      }
    });
    
  } catch (error) {
    console.error('[SYNC] ❌ Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    await connectToDatabase();
    
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ synced: false, error: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findOne({ clerkId });
    
    return NextResponse.json({
      synced: !!user,
      user: user ? {
        id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      } : null
    });
    
  } catch (error) {
    console.error('[SYNC] GET error:', error);
    return NextResponse.json({ 
      synced: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}