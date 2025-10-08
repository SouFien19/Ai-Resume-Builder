import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { generateText } from '@/lib/ai/gemini';
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, industry, seniority, experience } = await req.json();

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a list of relevant skills for the following position:
Role: ${role}
Industry: ${industry || 'Technology'}
Seniority: ${seniority || 'Mid-level'}
Experience Context: ${experience || 'Standard professional experience'}

Requirements:
- Return 8-12 most relevant technical and soft skills
- Focus on skills that are commonly required for this role
- Include both hard skills (technical) and soft skills (interpersonal)
- Make skills specific and industry-relevant
- Return as a JSON array of skill names

Example format: ["JavaScript", "Project Management", "Problem Solving", "React", "Communication"]

Return only the JSON array, no other text.`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ skills: string[] }>(cacheKey);
    if (cached) {
      console.log('[AI Suggest Skills] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Suggest Skills] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, { 
      temperature: 0.7,
      maxTokens: 1000
    });

    try {
      const skills = JSON.parse(text?.trim() || '[]');
      const response = { 
        skills: Array.isArray(skills) ? skills : [] 
      };
      
      // Cache for 1 hour
      await setCache(cacheKey, response, 3600);
      console.log('[AI Suggest Skills] ✅ Cached response for 1 hour');
      
      return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' }});
    } catch {
      // Fallback if JSON parsing fails
      const skillsText = text?.trim() || '';
      const skills = skillsText
        .split(/[,\n]/)
        .map(s => s.replace(/["\[\]]/g, '').trim())
        .filter(s => s.length > 0)
        .slice(0, 12);
      
      return NextResponse.json({ skills });
    }

  } catch (error) {
    console.error('Skills suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate skills suggestions' },
      { status: 500 }
    );
  }
}