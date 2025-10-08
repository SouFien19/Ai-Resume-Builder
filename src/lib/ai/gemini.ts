import { logger } from '@/lib/logger';

// Gemini AI integration utilities
export async function generateText(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.GOOGLE_GEMINI_API_KEY;
  const maxTokens = options?.maxTokens || 2000;
  const temperature = options?.temperature || 0.7;
  
  logger.info('AI text generation initiated', { maxTokens, temperature, hasApiKey: !!apiKey });
  
  // If API key is available, use real Gemini API
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: temperature,
              maxOutputTokens: maxTokens,
              responseMimeType: "text/plain"
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Gemini API error', { status: response.status, error: errorText });
        
        // For quota exceeded errors, throw a more specific error type
        if (response.status === 429) {
          const quotaError: any = new Error(`QUOTA_EXCEEDED`);
          quotaError.status = 429;
          quotaError.isQuotaError = true;
          quotaError.details = errorText;
          throw quotaError;
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) {
        logger.warn('Empty response from Gemini API');
        throw new Error('Empty response from Gemini API');
      }

      logger.info('✅ Gemini API response received', { length: text.length });
      return text;
      
    } catch (error) {
      logger.error('Gemini API call failed', { error });
      throw error;
    }
  }
  
  // Fallback to mock for development (no API key)
  logger.warn('No API key found, using mock responses');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  // Return appropriate mock responses based on prompt content
  if (prompt.includes('career') || prompt.includes('skillGaps') || prompt.includes('salaryInsights')) {
    return JSON.stringify({
      skillGaps: ["Advanced TypeScript", "System Design", "Cloud Architecture", "Microservices"],
      salaryInsights: "Based on your experience, expected salary range is $120k-$180k (estimate only)",
      progression: ["Senior Developer", "Lead Developer", "Engineering Manager", "Technical Director"],
      interviewPrep: ["Practice system design questions", "Review data structures", "Prepare behavioral examples", "Study company culture"]
    });
  }
  
  if (prompt.includes('certifications')) {
    return JSON.stringify({
      items: [
        { name: "AWS Solutions Architect", issuer: "Amazon Web Services", priority: "high" },
        { name: "Google Cloud Professional", issuer: "Google Cloud", priority: "medium" },
        { name: "Certified Kubernetes Administrator", issuer: "CNCF", priority: "high" },
        { name: "Docker Certified Associate", issuer: "Docker Inc.", priority: "medium" }
      ]
    });
  }
  
  if (prompt.includes('interests')) {
    return JSON.stringify({
      items: ["Open Source Contributing", "Technical Writing", "Mentoring Junior Developers", "AI/ML Research", "Cloud Architecture"]
    });
  }
  
  // Check for job suggestions request FIRST (before generic 'suggest' check)
  const isJobSuggestion = prompt.toLowerCase().includes('suggest') && prompt.toLowerCase().includes('job');
  const isJobListing = prompt.toLowerCase().includes('job') && (prompt.toLowerCase().includes('roles') || prompt.toLowerCase().includes('suitable'));
  
  if (isJobSuggestion || isJobListing) {
    console.log('🎯 Mock AI detected job suggestion request');
    // AI-generated job suggestions based on resume content
    // Extract skills and experience from the resume text in the prompt
    const resumeText = prompt.toLowerCase();
    
    // Detect skills and technologies from resume
    const detectedSkills = [];
    const skillsMap = {
      'react': 'React', 'vue': 'Vue.js', 'angular': 'Angular',
      'node': 'Node.js', 'python': 'Python', 'java': 'Java', 'javascript': 'JavaScript',
      'typescript': 'TypeScript', 'aws': 'AWS', 'azure': 'Azure', 'gcp': 'Google Cloud',
      'docker': 'Docker', 'kubernetes': 'Kubernetes', 'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL', 'sql': 'SQL', 'graphql': 'GraphQL',
      'nextjs': 'Next.js', 'express': 'Express', 'django': 'Django',
      'machine learning': 'Machine Learning', 'ai': 'AI', 'data': 'Data Analysis',
      'devops': 'DevOps', 'ci/cd': 'CI/CD', 'terraform': 'Terraform',
      'frontend': 'Frontend', 'backend': 'Backend', 'full stack': 'Full Stack'
    };
    
    for (const [key, value] of Object.entries(skillsMap)) {
      if (resumeText.includes(key)) detectedSkills.push(value);
    }
    
    // Determine experience level
    let experienceLevel = 'Mid-level';
    let salaryRange = '$80k-$120k';
    if (resumeText.includes('senior') || resumeText.includes('lead') || resumeText.includes('5+ year') || resumeText.includes('7+ year')) {
      experienceLevel = 'Senior';
      salaryRange = '$130k-$180k';
    } else if (resumeText.includes('junior') || resumeText.includes('entry') || resumeText.includes('1-2 year')) {
      experienceLevel = 'Junior';
      salaryRange = '$60k-$90k';
    }
    
    // Determine primary role type
    let primaryRole = 'Full Stack Developer';
    if (resumeText.includes('frontend') || resumeText.includes('react') && !resumeText.includes('backend')) {
      primaryRole = 'Frontend Developer';
    } else if (resumeText.includes('backend') || resumeText.includes('api') && !resumeText.includes('frontend')) {
      primaryRole = 'Backend Developer';
    } else if (resumeText.includes('devops') || resumeText.includes('infrastructure')) {
      primaryRole = 'DevOps Engineer';
    } else if (resumeText.includes('data') || resumeText.includes('machine learning')) {
      primaryRole = 'Data Engineer';
    }
    
    // Generate dynamic job listings based on detected profile
    const jobs = [
      {
        title: `${experienceLevel} ${primaryRole}`,
        company: "TechCorp Solutions",
        location: "San Francisco, CA (Remote)",
        description: `Join our innovative team building cutting-edge applications. Work with ${detectedSkills.slice(0, 3).join(', ')} and modern technologies.`,
        keywords: detectedSkills.slice(0, 5).length > 0 ? detectedSkills.slice(0, 5) : ["JavaScript", "Web Development"],
        jobDescriptionText: `We're seeking a ${experienceLevel} ${primaryRole} with expertise in ${detectedSkills.slice(0, 3).join(', ')}. You'll work on challenging projects, collaborate with cross-functional teams, and drive technical decisions. Requirements: ${detectedSkills.slice(0, 5).join(', ')}, strong problem-solving skills, experience with modern development practices. Benefits: Competitive salary (${salaryRange}), equity, health insurance, unlimited PTO, professional development budget.`
      },
      {
        title: `Lead ${primaryRole}`,
        company: "Digital Innovations Inc",
        location: "New York, NY (Hybrid)",
        description: "Lead a team of talented engineers building scalable solutions. Drive technical excellence and mentor team members.",
        keywords: [...detectedSkills.slice(0, 3), "Leadership", "Architecture"],
        jobDescriptionText: `Digital Innovations is looking for a Lead ${primaryRole} to guide our engineering team. You'll be responsible for system architecture, code reviews, and technical mentorship using ${detectedSkills.slice(0, 4).join(', ')}. Must have strong leadership and system design skills. Tech stack: ${detectedSkills.join(', ')}. Compensation: ${salaryRange.replace(/\d+k/g, (m) => parseInt(m) + 20 + 'k')}, stock options, full benefits.`
      },
      {
        title: primaryRole.includes('Full Stack') ? 'Frontend Specialist' : `${primaryRole} (Remote)`,
        company: "InnovateTech",
        location: "Austin, TX (Remote)",
        description: `Build exceptional user experiences and scalable systems. Work with ${detectedSkills.slice(0, 2).join(' and ')}.`,
        keywords: detectedSkills.slice(0, 4).length > 0 ? detectedSkills.slice(0, 4) : ["Programming", "Development"],
        jobDescriptionText: `We need a talented ${primaryRole} to join our remote team. Focus on ${detectedSkills.slice(0, 3).join(', ')} development. Qualifications: Experience with ${detectedSkills.join(', ')}, strong coding skills, passion for clean code. Stack: Modern tech stack including ${detectedSkills.slice(0, 5).join(', ')}. Offer: ${salaryRange}, full remote, flexible hours, equity options.`
      },
      {
        title: `${experienceLevel} Software Engineer`,
        company: "CloudScale Systems",
        location: "Seattle, WA",
        description: `Build infrastructure and applications that serve millions. ${detectedSkills.includes('AWS') || detectedSkills.includes('Azure') ? 'Cloud experience highly valued.' : 'Modern tech stack.'}`,
        keywords: [...detectedSkills.slice(0, 3), "Scalability", "Performance"],
        jobDescriptionText: `CloudScale is hiring a ${experienceLevel} Software Engineer to work on distributed systems. Responsibilities include building scalable applications, optimizing performance, and ensuring reliability using ${detectedSkills.slice(0, 4).join(', ')}. Skills needed: ${detectedSkills.join(', ')}, experience with large-scale systems. Benefits: ${salaryRange}, health benefits, 401k matching, learning budget $2000/year.`
      }
    ];
    
    return JSON.stringify(jobs);
  }
  
  if (prompt.includes('ATS') || prompt.includes('score')) {
    return JSON.stringify({
      score: 85,
      feedback: "Good keyword match. Consider adding more industry-specific terms.",
      suggestions: ["Add more quantified achievements", "Include relevant certifications", "Use stronger action verbs"]
    });
  }
  
  if (prompt.includes('bullet') || prompt.includes('improve')) {
    return JSON.stringify([
      "Developed and maintained scalable web applications using React and Node.js, serving 100K+ users",
      "Implemented CI/CD pipelines that reduced deployment time by 60% and improved code quality",
      "Led cross-functional team of 5 developers to deliver projects 20% ahead of schedule"
    ]);
  }
  
  if (prompt.includes('job') && prompt.includes('match')) {
    return JSON.stringify({
      matchScore: 87,
      strengths: ["Technical skills alignment", "Experience level match", "Industry knowledge"],
      gaps: ["Domain-specific experience", "Leadership experience"],
      recommendations: ["Highlight relevant projects", "Emphasize transferable skills"]
    });
  }
  
  // Skills suggestion - more specific check (not just 'suggest')
  if (prompt.includes('skills') || (prompt.includes('suggest') && !prompt.includes('job'))) {
    return JSON.stringify(["React", "TypeScript", "Node.js", "Python", "Docker", "Kubernetes", "AWS", "GraphQL", "PostgreSQL", "Redis"]);
  }
  
  if (prompt.includes('summary') || prompt.includes('improve summary')) {
    return "Results-driven Full Stack Developer with 5+ years of experience building scalable web applications. Proven track record of delivering high-impact solutions using React, Node.js, and cloud technologies. Strong problem-solving skills and experience leading cross-functional teams to achieve business objectives.";
  }
  
  // Default fallback - always return valid JSON or string
  return JSON.stringify({
    message: "Mock AI response - configure your Gemini API key for production use",
    data: [],
    status: "development_mode"
  });
}

export function safeJson<T = unknown>(jsonString: string, fallback: T | null = null): T | null {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return fallback;
    }
    
    // Clean markdown code blocks if present
    let cleaned = jsonString.trim();
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    // Try to extract complete JSON by finding balanced braces/brackets
    const extractCompleteJson = (text: string): string | null => {
      // Try to find a complete object
      let braceCount = 0;
      let startIndex = -1;
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
          if (startIndex === -1) startIndex = i;
          braceCount++;
        } else if (text[i] === '}') {
          braceCount--;
          if (braceCount === 0 && startIndex !== -1) {
            return text.substring(startIndex, i + 1);
          }
        }
      }
      
      // Try to find a complete array
      let bracketCount = 0;
      startIndex = -1;
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '[') {
          if (startIndex === -1) startIndex = i;
          bracketCount++;
        } else if (text[i] === ']') {
          bracketCount--;
          if (bracketCount === 0 && startIndex !== -1) {
            return text.substring(startIndex, i + 1);
          }
        }
      }
      
      return null;
    };
    
    const completeJson = extractCompleteJson(cleaned);
    if (completeJson) {
      return JSON.parse(completeJson) as T;
    }
    
    // Fallback to original regex approach
    const arrayMatch = cleaned.match(/\[[\s\S]*?\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {
        // Continue to next attempt
      }
    }
    
    const objectMatch = cleaned.match(/\{[\s\S]*?\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {
        // Continue to next attempt
      }
    }
    
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Failed to parse:', jsonString?.substring(0, 200) || 'empty string');
    return fallback;
  }
}

export async function generateJobDescription(role: string, company: string, industry: string, requirements: string): Promise<string> {
  // Mock job description generation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return `## ${role} - ${company}

**About the Role:**
We are seeking a talented ${role} to join our ${industry} team. This is an exciting opportunity to work with cutting-edge technologies and make a significant impact on our products and services.

**Key Responsibilities:**
• Design and develop high-quality software solutions
• Collaborate with cross-functional teams to deliver features
• Participate in code reviews and maintain coding standards
• Contribute to technical decision-making and architecture discussions

**Requirements:**
${requirements}

**What We Offer:**
• Competitive salary and benefits package
• Professional development opportunities
• Flexible working arrangements
• Collaborative and inclusive work environment`;
}

export async function improveSummary(currentSummary: string, role: string, seniority: string, industry: string, skills: string[]): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const topSkills = skills.slice(0, 3).join(", ");
  
  // Generate an improved summary
  return `Results-driven ${seniority} ${role} with expertise in ${topSkills}. Proven track record of delivering high-impact solutions in the ${industry} industry, with strong analytical and problem-solving abilities. Passionate about leveraging technology to drive business outcomes and mentor team members to achieve excellence.`;
}

// Mock model interface for chat API
interface MockModel {
  generateContent: (content: unknown) => Promise<{
    response: {
      text: () => string;
    };
  }>;
}

// Mock model function for chat API
export function getModel(modelName: string): MockModel | null {
  if (modelName.includes("gemini")) {
    return {
      generateContent: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          response: {
            text: () => "I'm a helpful resume and career assistant. I can help you improve your resume, optimize it for ATS systems, provide career guidance, and suggest relevant skills and certifications. How can I assist you today?"
          }
        };
      }
    };
  }
  return null;
}