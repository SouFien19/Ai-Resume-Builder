import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ContentGeneration from '@/lib/database/models/ContentGeneration';
import connectToDatabase from '@/lib/database/connection';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import crypto from 'crypto';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { 
      prompt, 
      jobTitle,
      companyName,
      industry,
      experienceLevel = 'mid',
      workType = 'full-time',
      location = 'Remote',
      salaryRange,
      companySize,
      additionalContext = {}
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Create the AI prompt for job description generation
    const systemPrompt = `You are an experienced HR professional and talent acquisition specialist with expertise in creating compelling job descriptions that attract top talent.

Generate a comprehensive job description based on the following requirements:

**Job Title**: ${jobTitle || 'the position'}
**Company**: ${companyName || 'the company'}
**Industry**: ${industry || 'general'}
**Experience Level**: ${experienceLevel}
**Work Type**: ${workType}
**Location**: ${location}
**Salary Range**: ${salaryRange || 'Competitive'}
**Company Size**: ${companySize || 'Not specified'}

**Job Description Structure:**
1. **Company Overview** (2-3 sentences about the company and mission)
2. **Role Summary** (2-3 sentences describing the position's purpose and impact)
3. **Key Responsibilities** (5-8 bullet points with specific, actionable tasks)
4. **Required Qualifications** (4-6 must-have requirements)
5. **Preferred Qualifications** (3-5 nice-to-have skills or experiences)
6. **What We Offer** (Benefits, growth opportunities, company culture highlights)
7. **How to Apply** (Clear application instructions)

**Guidelines:**
- Use inclusive language and avoid bias
- Be specific about responsibilities and requirements
- Include both hard and soft skills
- Mention growth opportunities and career development
- Highlight unique company benefits or culture
- Use action-oriented language
- Keep it concise but comprehensive (500-800 words)
- Include relevant keywords for SEO and ATS systems
- Make it engaging and show the value proposition
- Avoid discriminatory language or requirements

**User Input:**
${prompt}

**Additional Context:**
${JSON.stringify(additionalContext, null, 2)}

Generate a professional job description that will attract qualified candidates and accurately represent the role and company.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Job Description] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Job Description] ⚠️ Cache MISS - Calling AI API');

    // Generate content using Gemini with retry logic
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    let result;
    let retries = 3;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(systemPrompt);
        break;
      } catch (error: unknown) {
        retries--;
        if (error instanceof Error && 'status' in error && (error as Record<string, unknown>).status === 503 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          continue;
        }
        throw error;
      }
    }
    
    if (!result) {
      throw new Error('Failed to generate content after retries');
    }
    
    const response = await result.response;
    const generatedContent = response.text();

    const processingTime = Date.now() - startTime;

    // Calculate quality score based on content analysis
    const qualityScore = calculateJobDescriptionQuality(generatedContent);

    // Connect to database and save the generated content
    await connectToDatabase();
    
    const contentRecord = new ContentGeneration({
      userId,
      contentType: 'job-description',
      prompt,
      generatedContent,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        processingTime,
        temperature: 0.6, // More structured content
        qualityScore,
        targetRole: jobTitle,
        targetCompany: companyName,
        industry,
        experienceLevel,
        additionalContext: {
          ...additionalContext,
          workType,
          location,
          salaryRange,
          companySize
        },
        tokens: {
          input: systemPrompt.length,
          output: generatedContent.length,
          total: systemPrompt.length + generatedContent.length
        }
      }
    });

    await contentRecord.save();

    const responseData = {
      success: true,
      data: {
        id: contentRecord._id,
        content: generatedContent,
        metadata: {
          processingTime,
          qualityScore,
          wordCount: generatedContent.split(/\s+/).length,
          characterCount: generatedContent.length,
          sections: analyzeJobDescriptionSections(generatedContent),
          readabilityScore: calculateReadabilityScore(generatedContent)
        }
      }
    };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Job Description] ✅ Cached response for 1 hour');

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error) {
    console.error('Job description generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate job description',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    await connectToDatabase();

    const jobDescriptions = await ContentGeneration.find({
      userId,
      contentType: 'job-description'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .select('generatedContent metadata createdAt userRating isBookmarked');

    const total = await ContentGeneration.countDocuments({
      userId,
      contentType: 'job-description'
    });

    return NextResponse.json({
      success: true,
      data: {
        jobDescriptions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Fetch job descriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job descriptions' },
      { status: 500 }
    );
  }
}

// Helper function to calculate job description quality score
function calculateJobDescriptionQuality(content: string): number {
  let score = 50; // Base score

  const wordCount = content.split(/\s+/).length;
  const sections = content.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  const bullets = (content.match(/[•\-\*]\s/g) || []).length;

  // Word count scoring (optimal 500-800 words)
  if (wordCount >= 500 && wordCount <= 800) score += 20;
  else if (wordCount >= 400 && wordCount <= 1000) score += 10;
  else if (wordCount < 300 || wordCount > 1200) score -= 15;

  // Structure scoring
  if (sections.length >= 5) score += 15; // Good section breakdown
  if (bullets >= 8) score += 10; // Adequate bullet points

  // Required elements
  const requiredElements = [
    'responsibilities', 'qualifications', 'requirements', 'benefits',
    'company', 'role', 'experience', 'skills'
  ];
  
  const elementScore = requiredElements.filter(element => 
    content.toLowerCase().includes(element)
  ).length;
  
  score += elementScore * 2;

  // Professional language and inclusivity
  const inclusiveWords = [
    'opportunity', 'growth', 'development', 'team', 'collaborative',
    'diverse', 'inclusive', 'flexible', 'support', 'learning'
  ];
  
  const inclusivityScore = inclusiveWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  
  score += Math.min(inclusivityScore * 2, 15);

  // Avoid problematic language
  const problematicTerms = [
    'rockstar', 'ninja', 'guru', 'hit the ground running',
    'drink the kool-aid', 'work hard play hard'
  ];
  
  const problemScore = problematicTerms.filter(term => 
    content.toLowerCase().includes(term.toLowerCase())
  ).length;
  
  score -= problemScore * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Helper function to analyze job description sections
function analyzeJobDescriptionSections(content: string): Record<string, boolean> {
  const sections = {
    hasCompanyOverview: /company|about us|organization/i.test(content),
    hasRoleSummary: /role|position|summary/i.test(content),
    hasResponsibilities: /responsibilities|duties|tasks/i.test(content),
    hasRequirements: /requirements|qualifications|must have/i.test(content),
    hasBenefits: /benefits|offer|perks|compensation/i.test(content),
    hasApplicationInstructions: /apply|application|contact|submit/i.test(content),
    hasBulletPoints: /[•\-\*]\s/.test(content),
    hasStructuredFormat: content.split(/\n\s*\n/).length >= 4
  };

  return sections;
}

// Helper function to calculate readability score (simplified)
function calculateReadabilityScore(content: string): number {
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = words / sentences;

  // Ideal is 15-20 words per sentence for professional content
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) return 90;
  else if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 25) return 75;
  else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 30) return 60;
  else return 45;
}