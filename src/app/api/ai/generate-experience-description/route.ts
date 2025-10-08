import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

// Initialize Gemini AI with fallback to multiple environment variable names
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_GEMINI_API_KEY || 
  ""
);

export async function POST(req: NextRequest) {
  try {
    // ✅ Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Parse request body
    const body = await req.json();
    const {
      company,
      position,
      startDate,
      endDate,
      description,
      industry,
      experienceLevel = "mid-level",
    } = body;

    if (!company || !position) {
      return NextResponse.json(
        { success: false, error: "Company and position are required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // ✅ AI prompt
    const systemPrompt = `You are an expert resume writer and career coach. Generate a professional, ATS-optimized work experience description that highlights achievements and impact.

**Guidelines:**
- Start with strong action verbs (Led, Developed, Implemented, Managed, Created, etc.)
- Include quantifiable achievements where possible (percentages, dollar amounts, timeframes)
- Focus on impact and results, not just responsibilities
- Use relevant industry keywords for ATS optimization
- Write 3-5 bullet points in past tense (or present if current role)
- Make it specific and compelling
- Avoid generic descriptions
- Highlight skills and technologies used

**Experience Details:**
- Company: ${company}
- Position: ${position}
- Duration: ${startDate} - ${endDate || "Present"}
- Industry: ${industry || "General"}
- Experience Level: ${experienceLevel}
- Current Description: ${description || "None provided"}

Return strictly JSON:
{
  "description": "Main role description paragraph",
  "achievements": ["Achievement bullet point 1", "Achievement bullet point 2", "..."]
}`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Experience Description] ✅ Cache HIT - Saved API cost!');
      return cached;
    }
    
    console.log('[AI Experience Description] ⚠️ Cache MISS - Calling AI API');

    // ✅ Use gemini-2.0-flash-exp (working model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    let result;
    try {
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      throw error;
    }

    if (!result?.response) {
      throw new Error("No response from Gemini API");
    }

    const generatedContent = result.response.text();
    const processingTime = Date.now() - startTime;

    // ✅ Parse JSON output safely
    let parsedContent;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // ✅ Fallback: convert raw text to structured content
      const lines = generatedContent.split("\n").filter((line) => line.trim());
      const achievements = lines
        .filter(
          (line) =>
            line.trim().startsWith("•") ||
            line.trim().startsWith("-") ||
            line.trim().startsWith("*")
        )
        .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
        .filter((line) => line.length > 0);

      const desc = lines
        .filter(
          (line) =>
            !line.trim().startsWith("•") &&
            !line.trim().startsWith("-") &&
            !line.trim().startsWith("*")
        )
        .join(" ")
        .trim();

      parsedContent = {
        description: desc || `Professional ${position} with experience at ${company}`,
        achievements:
          achievements.length > 0
            ? achievements
            : [
                `Contributed to key projects and initiatives at ${company}`,
                `Collaborated with cross-functional teams to achieve business objectives`,
                `Applied industry best practices and modern technologies`,
              ],
      };
    }

    const responseData = NextResponse.json({
      success: true,
      data: {
        description: parsedContent.description || "",
        achievements: Array.isArray(parsedContent.achievements)
          ? parsedContent.achievements
          : [],
        metadata: {
          processingTime,
          company,
          position,
          experienceLevel,
        },
      },
    });
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Experience Description] ✅ Cached response for 1 hour');
    
    return responseData;
  } catch (error) {
    console.error("Experience description generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate experience description",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
