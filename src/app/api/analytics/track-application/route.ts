import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/database/connection';
import User from '../../../../lib/database/models/User';
import AppliedJob from '../../../../lib/database/models/AppliedJob';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jobData = await request.json();

    // Check if this job is already saved by this user
    const existingApplication = await AppliedJob.findOne({
      userId: user._id,
      title: jobData.title,
      company: jobData.company
    });

    if (existingApplication) {
      return NextResponse.json({ 
        success: false, 
        error: 'Job already saved',
        message: 'This job is already in your applications list.',
        application: existingApplication 
      }, { status: 409 });
    }

    const newApplication = new AppliedJob({
      userId: user._id,
      ...jobData,
    });

    await newApplication.save();

    return NextResponse.json({ success: true, application: newApplication }, { status: 201 });
  } catch (error) {
    console.error('[TRACK_APPLICATION_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
