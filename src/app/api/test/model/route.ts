import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/database/connection';
import AppliedJob from '../../../../lib/database/models/AppliedJob';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Test creating a job with "Saved" status
    const testJob = new AppliedJob({
      userId: '507f1f77bcf86cd799439011', // dummy ObjectId for test
      title: 'Test Job',
      company: 'Test Company', 
      status: 'Saved'
    });

    // Validate the model without saving
    const validationError = testJob.validateSync();
    
    if (validationError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationError.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Model accepts Saved status',
      allowedStatuses: (AppliedJob.schema.paths.status as any).enumValues
    });
  } catch (error) {
    console.error('[TEST_MODEL_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}