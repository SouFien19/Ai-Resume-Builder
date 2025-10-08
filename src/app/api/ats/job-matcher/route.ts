import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
import dbConnect from "@/lib/database/connection";
import JobMatch from "@/lib/database/models/JobMatch";
import User from "@/lib/database/models/User";

interface FilterCriteria {
  company?: string;
  title?: string;
  location?: string;
  experience?: string;
  jobType?: string;
  remote?: string;
  datePosted?: string;
}

async function generateJobMatches(resumeText: string, filters?: FilterCriteria) {
  // Build filter requirements for the prompt
  let filterRequirements = '';
  
  if (filters) {
    const requirements: string[] = [];
    
    if (filters.company) {
      requirements.push(`- Company name must contain or be similar to: "${filters.company}"`);
    }
    if (filters.title) {
      requirements.push(`- Job title must contain or be related to: "${filters.title}"`);
    }
    if (filters.location) {
      requirements.push(`- Location must be in or near: "${filters.location}"`);
    }
    if (filters.experience) {
      requirements.push(`- Experience level must include: "${filters.experience}"`);
    }
    if (filters.jobType) {
      const typeMap: Record<string, string> = {
        'full-time': 'Full-time',
        'contract': 'Contract',
        'part-time': 'Part-time'
      };
      requirements.push(`- Job type must be: ${typeMap[filters.jobType] || filters.jobType}`);
    }
    if (filters.remote === 'remote') {
      requirements.push(`- Must be a remote position (remote: true)`);
    } else if (filters.remote === 'onsite') {
      requirements.push(`- Must be an on-site position (remote: false)`);
    }
    if (filters.datePosted) {
      const dateMap: Record<string, string> = {
        '24h': '1 day ago or less',
        '7days': 'within the last 7 days',
        '30days': 'within the last 30 days'
      };
      requirements.push(`- Posted: ${dateMap[filters.datePosted] || filters.datePosted}`);
    }
    
    if (requirements.length > 0) {
      filterRequirements = `\n\nIMPORTANT - User has specified these requirements. ALL generated jobs MUST match these criteria:\n${requirements.join('\n')}\n`;
    }
  }

// Update your API route to include proper links
const prompt = `
  Based on the following resume, generate a list of 4 diverse, realistic job listings that would be a strong match. Return the list as a valid JSON array of objects.${filterRequirements}

  Each job object in the array should have the following structure:
  {
    "id": <number>,
    "title": "<string>",
    "company": "<string>",
    "location": "<string>",
    "type": "<'Full-time' | 'Contract' | 'Part-time' | 'Internship'>",
    "salary": "<string> (e.g., '$120k - $160k')",
    "posted": "<string> (e.g., '2 days ago')",
    "matchScore": <number> (a score from 70-95 representing the match with the resume),
    "featured": <boolean> (make one of the jobs featured),
    "remote": <boolean>,
    "description": "<string> (a 1-2 sentence summary)",
    "skills": ["<string>", "<string>", ...],
    "matchedSkills": ["<string>", "<string>", ...],
    "missingSkills": ["<string>", "<string>", ...],
    "benefits": ["<string>", "<string>", ...],
    "applicants": <number> (a realistic number of applicants),
    "link": "<string>"  // ADD THIS - a realistic job application URL
  }

  For the "link" field, generate realistic job application URLs like:
  - "https://careers.company.com/jobs/12345"
  - "https://www.linkedin.com/jobs/view/123456789"
  - "https://indeed.com/q-software-engineer-l-san-francisco-jobs.html"
  - "https://company.recruitee.com/o/senior-developer"

  Resume:
  ---
  ${resumeText}
  ---

  Return only the JSON array.
`;

  try {
    const result = await generateText(prompt, {
      temperature: 0.25,
      maxTokens: 2000
    });

    if (!result) {
      console.error('Empty response from AI');
      return [];
    }
    
    const parsed = safeJson<any[]>(result);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      console.error('Invalid or empty AI response');
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Error generating or parsing job matches:', error);
    // Return empty array on any error
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeText, filters } = body;

    // Validate resume text
    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Resume is required. Please provide your resume text.",
        jobs: [],
      }, { status: 400 });
    }

    if (resumeText.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: "Resume is too short. Please provide at least 50 characters.",
        jobs: [],
      }, { status: 400 });
    }

    if (resumeText.length > 20000) {
      return NextResponse.json({
        success: false,
        error: "Resume is too long. Please keep it under 20,000 characters.",
        jobs: [],
      }, { status: 400 });
    }

    const effectiveResumeText = resumeText.trim();

    // Generate job matches with filter criteria
    const jobListings = await generateJobMatches(effectiveResumeText, filters);

    // Save to database (non-blocking - don't fail request if save fails)
    if (jobListings && Array.isArray(jobListings) && jobListings.length > 0) {
      try {
        await dbConnect();
        const user = await User.findOne({ clerkId: userId });
        if (user) {
          await JobMatch.create({
            userId: user._id,
            resumeText: effectiveResumeText.slice(0, 5000), // Store truncated version
            matches: jobListings.map((job: any) => ({
              title: job.title || '',
              company: job.company || '',
              location: job.location || '',
              description: job.description || '',
              requirements: job.skills || [],
              matchScore: job.matchScore || 0,
              matchReason: job.description || '',
              matchedSkills: job.matchedSkills || [],
              missingSkills: job.missingSkills || [],
              url: job.link || '',
            })),
            searchDate: new Date(),
          });
          console.log('[JOB_MATCHER] Saved to database');
        }
      } catch (dbError) {
        // Log but don't fail the request
        console.error('[JOB_MATCHER_DB_ERROR]', dbError instanceof Error ? dbError.message : 'Unknown error');
      }
    }

    return NextResponse.json({ jobs: jobListings });

  } catch (error) {
    console.error('[JOB_MATCHER_ERROR]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate job matches. Please try again.",
      jobs: [],
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error))
        : undefined,
    }, { status: 500 });
  }
}
