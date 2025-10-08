import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '../../../lib/database/connection';
import User from '../../../lib/database/models/User';

export async function POST() {
  try {
    console.log('User sync API: Starting...');
    await connectToDatabase();
    
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();
    
    if (!clerkId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in database
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Create new user record
      console.log('User sync API: Creating new user record for:', clerkId);
      user = new User({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await user.save();
      console.log('User sync API: User created successfully');
    } else {
      console.log('User sync API: User already exists');
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('User sync API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}