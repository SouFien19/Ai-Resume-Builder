import { NextRequest, NextResponse } from "next/server";
import { generateText as generateTextFromLib } from "@/lib/ai/gemini";

function safeJson<T = unknown>(text: string): T | null {
  try {
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);

    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]);

    return JSON.parse(text);
  } catch (err) {
    console.error("JSON parse error:", err);
    return null;
  }
}

interface JobSuggestion {
  title: string;
  company: string;
  location: string;
  description: string;
  keywords: string[] | string;
  jobDescriptionText: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "Missing or invalid resumeText" }, { status: 400 });
    }

    const prompt = `You are a professional career advisor and recruiter. Based on the following resume, suggest 4 diverse, high-quality job opportunities that would be an excellent match for this candidate.

REQUIREMENTS:
- Mix of locations: Include remote-friendly roles, major tech hubs (San Francisco, New York, London, Berlin, etc.), and hybrid options
- Real companies: Use well-known tech companies, startups, or realistic company names
- Professional roles: Match the candidate's experience level and skills
- Competitive compensation: Reflect realistic market rates
- Diverse opportunities: Include different company sizes (startups, mid-size, enterprise)

For each job, provide a JSON object with these exact fields:
{
  "title": "Specific job title matching candidate's level",
  "company": "Real or realistic company name",
  "location": "City, Country (Remote/Hybrid/On-site)",
  "description": "2-3 sentence compelling description of the role and company",
  "keywords": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "jobDescriptionText": "Detailed 4-5 sentence job description including: responsibilities, requirements, tech stack, team structure, and benefits/salary range"
}

Resume:
${resumeText.substring(0, 2000)}

Return ONLY a valid JSON array of 4 job objects. No markdown, no code blocks, just the JSON array.`;

    console.log("🚀 Sending request to Gemini...");
    let text: string;
    
    try {
      text = await generateTextFromLib(prompt, { temperature: 0.7, maxTokens: 1500 });
      console.log("📦 Received from AI:", typeof text, text.substring(0, 300));
    } catch (aiError: any) {
      // Handle quota exceeded with intelligent, location-aware fallback
      if (aiError?.status === 429 || aiError?.isQuotaError || aiError?.message?.includes('QUOTA_EXCEEDED')) {
        console.log("⚠️ Quota exceeded, generating intelligent fallback suggestions based on resume");
        
        // Extract detailed info from resume
        const resumeLower = resumeText.toLowerCase();
        
        // Detect seniority level
        const isSenior = resumeLower.includes('senior') || resumeLower.includes('lead') || resumeLower.includes('principal');
        const isJunior = resumeLower.includes('junior') || resumeLower.includes('entry') || resumeLower.includes('graduate');
        const level = isSenior ? 'Senior' : isJunior ? 'Junior' : 'Mid-Level';
        
        // Detect tech stack and specialization
        const skills = {
          frontend: resumeLower.includes('react') || resumeLower.includes('vue') || resumeLower.includes('angular'),
          backend: resumeLower.includes('node') || resumeLower.includes('python') || resumeLower.includes('java') || resumeLower.includes('go'),
          cloud: resumeLower.includes('aws') || resumeLower.includes('azure') || resumeLower.includes('gcp') || resumeLower.includes('cloud'),
          devops: resumeLower.includes('docker') || resumeLower.includes('kubernetes') || resumeLower.includes('ci/cd'),
          mobile: resumeLower.includes('ios') || resumeLower.includes('android') || resumeLower.includes('react native'),
          data: resumeLower.includes('data science') || resumeLower.includes('machine learning') || resumeLower.includes('analytics')
        };
        
        // Determine primary specialization
        let specialization = 'Full Stack Developer';
        if (skills.data) specialization = 'Data Engineer';
        else if (skills.mobile) specialization = 'Mobile Developer';
        else if (skills.cloud && skills.devops) specialization = 'DevOps Engineer';
        else if (skills.cloud) specialization = 'Cloud Engineer';
        else if (skills.backend && !skills.frontend) specialization = 'Backend Engineer';
        else if (skills.frontend && !skills.backend) specialization = 'Frontend Engineer';
        
        // Extract location from resume (look for common patterns)
        let userLocation = 'Remote';
        const locationPatterns = [
          /location[:\s]+([^,\n]+,\s*[^,\n]+)/i,
          /based in[:\s]+([^,\n]+)/i,
          /([a-z\s]+,\s*[a-z]{2,})\s*\d{5}/i, // City, State ZIP
          /(san francisco|new york|london|paris|berlin|tokyo|sydney|toronto|boston|seattle|austin|chicago)/i
        ];
        
        for (const pattern of locationPatterns) {
          const match = resumeText.match(pattern);
          if (match && match[1]) {
            userLocation = match[1].trim();
            break;
          }
        }
        
        // Salary ranges based on level (in USD)
        const salaryRanges = {
          Junior: { min: 70, max: 95 },
          'Mid-Level': { min: 100, max: 140 },
          Senior: { min: 140, max: 190 }
        };
        const salary = salaryRanges[level as keyof typeof salaryRanges];
        
        // Generate 4 realistic, diverse job suggestions
        const fallbackJobs: JobSuggestion[] = [
          {
            title: `${level} ${specialization}`,
            company: "TechCorp Solutions",
            location: userLocation !== 'Remote' ? `${userLocation} (Hybrid)` : "Remote (Global)",
            description: `⚠️ API Quota Exceeded - Fallback suggestion. Join our innovative team building next-generation software solutions. We value collaboration, continuous learning, and work-life balance.`,
            keywords: Object.entries(skills).filter(([_, v]) => v).map(([k]) => k).slice(0, 5),
            jobDescriptionText: `This is a fallback suggestion due to API quota limits (resets in 24 hours). Based on your resume, we suggest: ${level} ${specialization} role. Location-aware matching: ${userLocation}. Expected salary: $${salary.min}k-$${salary.max}k. For real Gemini-powered suggestions, please upgrade to paid tier or wait for quota reset.`
          },
          {
            title: `${level} Software Engineer`,
            company: "Global Innovations Inc",
            location: "Remote (Worldwide)",
            description: `⚠️ Fallback job. Work remotely with a distributed team on cutting-edge projects. Flexible hours, competitive compensation, and growth opportunities.`,
            keywords: ["Remote Work", "Collaboration", "Agile", "Modern Stack", "Team Leadership"],
            jobDescriptionText: `Fallback suggestion. Fully remote position matching your experience level (${level}). Build scalable applications using modern technologies. Salary: $${salary.min}k-$${salary.max}k + equity. Real AI-powered matches available after quota reset.`
          },
          {
            title: `${level} ${skills.frontend ? 'Frontend' : skills.backend ? 'Backend' : 'Full Stack'} Developer`,
            company: "Startup Ventures",
            location: userLocation !== 'Remote' ? userLocation : "San Francisco, CA",
            description: `⚠️ Sample job. Fast-growing startup seeking talented engineers. Equity, competitive salary, and opportunity to shape product direction.`,
            keywords: skills.frontend ? ["React", "TypeScript", "UI/UX"] : skills.backend ? ["APIs", "Databases", "Microservices"] : ["Full Stack", "Modern Frameworks"],
            jobDescriptionText: `Fallback suggestion based on your skills. Startup environment with high growth potential. Location: ${userLocation !== 'Remote' ? userLocation : 'SF Bay Area'}. Salary: $${salary.min}k-$${salary.max}k + 0.5-2% equity. Upgrade to paid Gemini tier for real job matches.`
          },
          {
            title: `${level} ${specialization}`,
            company: "Enterprise Tech Ltd",
            location: userLocation !== 'Remote' ? `${userLocation} (On-site)` : "New York, NY",
            description: `⚠️ Fallback job. Enterprise-scale engineering role with established company. Excellent benefits, mentorship programs, and career advancement.`,
            keywords: ["Enterprise Software", "Team Collaboration", "System Design", "Best Practices", "Mentoring"],
            jobDescriptionText: `Sample suggestion. Enterprise-level ${specialization} position. Work on mission-critical systems with experienced teams. Location: ${userLocation !== 'Remote' ? userLocation : 'NYC'}. Salary: $${salary.min}k-$${salary.max}k + full benefits. For AI-powered personalized matches, wait for API quota reset.`
          }
        ];
        
        console.log(`✅ Returning ${fallbackJobs.length} intelligent fallback jobs (location-aware: ${userLocation}, level: ${level})`);
        
        return NextResponse.json({ 
          jobs: fallbackJobs,
          quotaExceeded: true,
          userLocation,
          detectedLevel: level,
          detectedSpecialization: specialization,
          message: "⚠️ API quota exceeded. Showing intelligent fallback suggestions based on your resume. For real Gemini-powered personalized job matches, quota resets in 24 hours or upgrade to paid tier ($5-7/month with caching)."
        }, { 
          status: 200,
          headers: { 
            'X-Quota-Exceeded': 'true', 
            'X-Fallback': 'true',
            'X-Fallback-Location': userLocation,
            'X-Fallback-Level': level
          }
        });
      }
      
      // Re-throw other errors
      throw aiError;
    }

    // Clean markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

    let jobs: JobSuggestion[] = [];
    try {
      jobs = JSON.parse(text);
      console.log("✅ Parsed as JSON, array?", Array.isArray(jobs), "length:", Array.isArray(jobs) ? jobs.length : 0);
    } catch (parseError) {
      console.log("⚠️ JSON.parse failed, trying safeJson...", parseError);
      const parsed = safeJson<JobSuggestion[]>(text);
      if (parsed) {
        jobs = parsed;
        console.log("✅ safeJson worked, array?", Array.isArray(jobs), "length:", Array.isArray(jobs) ? jobs.length : 0);
      }
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.error("❌ Final check failed - not array or empty:", Array.isArray(jobs), jobs);
      return NextResponse.json(
        { error: "No valid job suggestions returned by AI", raw: text.substring(0, 500) },
        { status: 500 }
      );
    }

    // Ensure proper defaults and clean data
    const validJobs = jobs
      .filter((job) => job && typeof job === "object")
      .map((job) => ({
        title: job.title || "Professional Role",
        company: job.company || "Various Companies",
        location: job.location || "Remote",
        description: job.description || "Position requiring relevant skills and experience.",
        keywords: Array.isArray(job.keywords)
          ? job.keywords
          : typeof job.keywords === "string"
          ? job.keywords.split(/,\s*/)
          : ["Skills required"],
        jobDescriptionText: job.jobDescriptionText || `Role: ${job.title} at ${job.company}. ${job.description}`,
      }));

    console.log(`✅ Returning ${validJobs.length} AI-generated job suggestions`);
    return NextResponse.json({ jobs: validJobs }, { status: 200 });
  } catch (err) {
    console.error("suggest-jobs error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to suggest jobs";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
