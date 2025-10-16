import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ContentGeneration from '@/lib/database/models/ContentGeneration';
import connectToDatabase from '@/lib/database/connection';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import { trackAIRequest } from '@/lib/ai/track-analytics';
import crypto from 'crypto';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Type for parsed skills content
interface SkillsContent {
  technicalSkills?: string[];
  softSkills?: string[];
  industrySkills?: string[];
  certifications?: string[];
  atsKeywords?: string[];
  actionVerbs?: string[];
  recommendations?: string[];
  summary?: string | { overallAssessment?: string };
  error?: string;
  [key: string]: unknown;
}

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
      analysisType = 'comprehensive',
      targetRole,
      industry,
      experienceLevel = 'mid',
      includeDescriptions = true,
      prioritizeATS = true,
      additionalContext = {}
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content to analyze is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Create the AI prompt for skills and keywords extraction
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) specialist and career strategist with deep knowledge of industry-specific skills and keyword optimization.

Analyze the following content and extract relevant skills and keywords:

**Analysis Type**: ${analysisType}
**Target Role**: ${targetRole || 'general professional'}
**Industry**: ${industry || 'general'}
**Experience Level**: ${experienceLevel}
**Prioritize ATS**: ${prioritizeATS ? 'Yes' : 'No'}
**Include Descriptions**: ${includeDescriptions ? 'Yes' : 'No'}

**Content to Analyze:**
${prompt}

**Analysis Guidelines:**
1. **Technical Skills**: Programming languages, software, tools, platforms, methodologies
2. **Soft Skills**: Leadership, communication, problem-solving, etc.
3. **Industry-Specific Skills**: Domain expertise and specialized knowledge
4. **Certifications & Qualifications**: Professional certifications, degrees, licenses
5. **Keywords**: ATS-friendly terms that match job descriptions
6. **Action Verbs**: Powerful verbs for resume and cover letter optimization

**Output Format** (JSON structure):
{
  "technicalSkills": [
    {
      "skill": "Skill name",
      "category": "Programming/Software/Tools/Platform",
      "proficiencyLevel": "Beginner/Intermediate/Advanced/Expert",
      "atsKeywords": ["keyword1", "keyword2"],
      "description": "Brief description of the skill and its relevance"
    }
  ],
  "softSkills": [
    {
      "skill": "Skill name",
      "importance": "High/Medium/Low",
      "atsKeywords": ["keyword1", "keyword2"],
      "description": "How this skill applies to the role"
    }
  ],
  "industrySkills": [
    {
      "skill": "Industry-specific skill",
      "relevance": "High/Medium/Low",
      "atsKeywords": ["keyword1", "keyword2"],
      "description": "Industry context and application"
    }
  ],
  "certifications": [
    {
      "certification": "Certification name",
      "priority": "High/Medium/Low",
      "atsKeywords": ["keyword1", "keyword2"],
      "description": "Value and recognition in the industry"
    }
  ],
  "atsKeywords": [
    {
      "keyword": "Keyword phrase",
      "frequency": "High/Medium/Low",
      "context": "Where to use this keyword",
      "variations": ["variation1", "variation2"]
    }
  ],
  "actionVerbs": [
    {
      "verb": "Action verb",
      "context": "Achievement/Responsibility/Project",
      "impact": "High/Medium/Low",
      "examples": ["Example usage in context"]
    }
  ],
  "recommendations": [
    {
      "type": "Missing Skills/Keyword Optimization/Industry Alignment",
      "suggestion": "Specific recommendation",
      "priority": "High/Medium/Low",
      "reasoning": "Why this is important"
    }
  ],
  "summary": {
    "totalSkillsFound": "Number",
    "strengthAreas": ["Area1", "Area2"],
    "improvementAreas": ["Area1", "Area2"],
    "atsCompatibility": "High/Medium/Low",
    "overallAssessment": "Brief overall assessment"
  }
}

**Additional Context:**
${JSON.stringify(additionalContext, null, 2)}

Provide a comprehensive analysis that will help optimize resumes, cover letters, and LinkedIn profiles for better ATS compatibility and job matching.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Skills & Keywords] ✅ Cache HIT - Saved API cost!');
      const requestDuration = Date.now() - startTime;
      await trackAIRequest({
        userId,
        contentType: 'skills-keywords',
        cached: true,
        success: true,
        requestDuration,
      });
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Skills & Keywords] ⚠️ Cache MISS - Calling AI API');

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
    let generatedContent = response.text();

    // Clean up the response to ensure it's valid JSON
    generatedContent = cleanJsonResponse(generatedContent);

    const processingTime = Date.now() - startTime;

    // Parse the JSON response for quality scoring
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch {
      // If JSON parsing fails, create a fallback structure
      parsedContent = {
        error: 'Failed to parse AI response',
        rawContent: generatedContent
      };
    }

    // Calculate quality score based on content analysis
    const qualityScore = calculateSkillsAnalysisQuality(parsedContent, prompt);

    // Connect to database and save the generated content
    await connectToDatabase();
    
    const contentRecord = new ContentGeneration({
      userId,
      contentType: 'skills-keywords',
      prompt,
      generatedContent,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        processingTime,
        temperature: 0.3, // Lower temperature for more structured output
        qualityScore,
        targetRole,
        industry,
        experienceLevel,
        additionalContext: {
          ...additionalContext,
          analysisType,
          includeDescriptions,
          prioritizeATS
        },
        tokens: {
          input: systemPrompt.length,
          output: generatedContent.length,
          total: systemPrompt.length + generatedContent.length
        }
      }
    });

    await contentRecord.save();

    const tokensUsed = Math.ceil(systemPrompt.length / 4) + Math.ceil(generatedContent.length / 4);
    
    await trackAIRequest({
      userId,
      contentType: 'skills-keywords',
      cached: false,
      success: true,
      tokensUsed,
      requestDuration: processingTime,
    });

    const responseData = {
      success: true,
      data: {
        id: contentRecord._id,
        content: generatedContent,
        parsedContent: parsedContent,
        metadata: {
          processingTime,
          qualityScore,
          wordCount: prompt.split(/\s+/).length,
          outputLength: generatedContent.length,
          skillsExtracted: parsedContent.summary?.totalSkillsFound || 'N/A'
        }
      }
    };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Skills & Keywords] ✅ Cached response for 1 hour');

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error) {
    console.error('Skills analysis generation error:', error);
    
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'skills-keywords',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze skills and keywords',
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

    const skillsAnalyses = await ContentGeneration.find({
      userId,
      contentType: 'skills-keywords'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .select('generatedContent metadata createdAt userRating isBookmarked');

    const total = await ContentGeneration.countDocuments({
      userId,
      contentType: 'skills-keywords'
    });

    return NextResponse.json({
      success: true,
      data: {
        analyses: skillsAnalyses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Fetch skills analyses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills analyses' },
      { status: 500 }
    );
  }
}

// Helper function to clean JSON response
function cleanJsonResponse(content: string): string {
  // Remove markdown code block markers if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Remove any leading/trailing whitespace
  content = content.trim();
  
  // If content doesn't start with {, try to find the JSON part
  if (!content.startsWith('{')) {
    const jsonStart = content.indexOf('{');
    if (jsonStart !== -1) {
      content = content.substring(jsonStart);
    }
  }
  
  // If content doesn't end with }, try to find the end
  if (!content.endsWith('}')) {
    const jsonEnd = content.lastIndexOf('}');
    if (jsonEnd !== -1) {
      content = content.substring(0, jsonEnd + 1);
    }
  }
  
  return content;
}

// Helper function to calculate skills analysis quality score
function calculateSkillsAnalysisQuality(parsedContent: SkillsContent, originalContent: string): number {
  let score = 50; // Base score

  // Check if parsing was successful
  if (parsedContent.error) {
    return 20; // Low score for parsing failures
  }

  const originalWordCount = originalContent.split(/\s+/).length;

  // Content length scoring
  if (originalWordCount >= 50) score += 10;
  if (originalWordCount >= 100) score += 10;

  // Structure completeness
  const expectedSections = [
    'technicalSkills', 'softSkills', 'industrySkills', 
    'certifications', 'atsKeywords', 'actionVerbs', 
    'recommendations', 'summary'
  ];

  const presentSections = expectedSections.filter(section => 
    parsedContent[section] && Array.isArray(parsedContent[section]) && parsedContent[section].length > 0
  );

  score += (presentSections.length / expectedSections.length) * 30;

  // Skills quantity scoring
  const totalSkills = (parsedContent.technicalSkills?.length || 0) + 
                     (parsedContent.softSkills?.length || 0) + 
                     (parsedContent.industrySkills?.length || 0);

  if (totalSkills >= 10) score += 15;
  else if (totalSkills >= 5) score += 10;
  else if (totalSkills >= 3) score += 5;

  // Quality indicators
  if ((parsedContent.atsKeywords?.length ?? 0) >= 5) score += 10;
  if ((parsedContent.recommendations?.length ?? 0) >= 3) score += 5;
  if (typeof parsedContent.summary === 'object' && parsedContent.summary?.overallAssessment) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}