import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/database/connection';
import User from '../../../../lib/database/models/User';
import AtsScore from '../../../../lib/database/models/AtsScore';

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

    const { score, resumeId, resumeText, jobDescription, analysis } = await request.json();

    // Validate score
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json({ error: 'Invalid score. Must be a number between 0 and 100.' }, { status: 400 });
    }

    const newScore = new AtsScore({
      userId: user._id,
      score,
      resumeId, // Optional
      resumeText: resumeText ? resumeText.substring(0, 5000) : undefined, // Limit text size
      jobDescription: jobDescription ? jobDescription.substring(0, 5000) : undefined,
      analysis: analysis ? {
        missingKeywords: analysis.missingKeywords || [],
        recommendations: analysis.recommendations || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || []
      } : undefined,
      createdAt: new Date()
    });

    await newScore.save();

    return NextResponse.json({ 
      success: true, 
      atsScore: {
        id: newScore._id,
        score: newScore.score,
        createdAt: newScore.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[TRACK_SCORE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
