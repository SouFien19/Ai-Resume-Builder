import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { generateText } from '@/lib/ai/gemini';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDescription, currentSkills } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const prompt = `Analyze the following job description and extract relevant skills that a candidate should highlight on their resume.

Job Description:
${jobDescription}

Current Skills Already Listed:
${currentSkills && currentSkills.length > 0 ? currentSkills.join(', ') : 'None'}

Requirements:
- Extract 8-15 specific skills mentioned or implied in the job description
- Focus on technical skills, tools, technologies, and important soft skills
- Exclude skills that are already in the "Current Skills Already Listed"
- Prioritize skills that are explicitly mentioned in the job description
- Include relevant programming languages, frameworks, methodologies, and certifications
- Return skills in order of importance/frequency in the job description
- Return as a JSON array of skill names

Example format: ["Python", "AWS", "Docker", "Agile", "CI/CD", "Team Leadership"]

Return only the JSON array, no other text or explanation.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ skills: string[] }>(cacheKey);
    if (cached) {
      console.log('[AI Extract Skills] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Extract Skills] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, { 
      temperature: 0.3, // Lower temperature for more consistent extraction
      maxTokens: 1500
    });

    try {
      // Try to parse as JSON
      const cleanedText = text?.trim() || '[]';
      const skills = JSON.parse(cleanedText);
      const responseData = { 
        skills: Array.isArray(skills) ? skills : [] 
      };
      
      // Cache for 1 hour
      await setCache(cacheKey, responseData, 3600);
      console.log('[AI Extract Skills] ✅ Cached response for 1 hour');
      
      return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});
    } catch {
      // Fallback: Try to extract array from text
      const skillsText = text?.trim() || '';
      
      // Try to find JSON array in the text
      const arrayMatch = skillsText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          const skills = JSON.parse(arrayMatch[0]);
          return NextResponse.json({ 
            skills: Array.isArray(skills) ? skills : [] 
          });
        } catch {
          // Continue to manual parsing
        }
      }
      
      // Manual parsing as last resort
      const skills = skillsText
        .split(/[,\n]/)
        .map(s => s.replace(/["\[\]]/g, '').trim())
        .filter(s => s.length > 0 && s.length < 50) // Reasonable skill name length
        .slice(0, 15);
      
      return NextResponse.json({ skills });
    }

  } catch (error) {
    console.error('Job description skills extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract skills from job description' },
      { status: 500 }
    );
  }
}
