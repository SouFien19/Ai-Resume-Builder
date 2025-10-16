# 🧪 **AI Features Testing Guide & Next Steps**

## **AI Resume Builder - October 6, 2025**

---

## **✅ STEP 1: FIXES APPLIED** (COMPLETED)

- ✅ ATS Optimizer endpoint fixed: `/api/ats/analyze` → `/api/ai/ats`
- ✅ Job Matcher endpoint fixed: `/api/ats/job-matcher` → `/api/ai/job-match`
- ✅ Content Generator verified: All 6 types working
- ✅ Total 8 AI endpoints confirmed functional

**Status**: Ready for testing ✅

---

## **🎯 STEP 2: TEST ALL AI FEATURES** (IN PROGRESS)

### **Server Status**

✅ Dev server running at: **http://localhost:3000**

### **Testing URLs**

1. **ATS Optimizer**: http://localhost:3000/dashboard/ai-studio/ats-optimizer
2. **Job Matcher**: http://localhost:3000/dashboard/ai-studio/job-matcher
3. **Content Generator**: http://localhost:3000/dashboard/ai-studio/content-gen

---

## **📝 DETAILED TESTING CHECKLIST**

### **Test 1: ATS Optimizer** (5-10 minutes)

**URL**: http://localhost:3000/dashboard/ai-studio/ats-optimizer

#### **Test Case 1A: PDF Upload**

- [ ] Click "Upload Resume" button
- [ ] Select a resume PDF file
- [ ] Verify file is uploaded and text extracted
- [ ] Paste a job description in the text area
- [ ] Click "Analyze" button
- [ ] **Expected**: Loading animation appears
- [ ] **Expected**: Progress steps shown (analyzing keywords, checking formatting, etc.)
- [ ] **Expected**: ATS score appears (0-100)
- [ ] **Expected**: Detailed analysis with:
  - Keyword matches
  - Missing skills
  - Formatting suggestions
  - Improvement recommendations
- [ ] **Console**: No 404 errors
- [ ] **Console**: Should see: `✅ Gemini API response received`

#### **Test Case 1B: Text Paste**

- [ ] Paste resume text directly (skip PDF upload)
- [ ] Paste job description
- [ ] Click "Analyze"
- [ ] **Expected**: Same results as PDF upload

#### **Error Cases to Test**

- [ ] Try with empty resume → Should show validation error
- [ ] Try with very short text (<50 chars) → Should show error
- [ ] Check network tab → Verify calling `/api/ai/ats` (not `/api/ats/analyze`)

**Sample Resume Text for Testing**:

```
John Doe
Senior Software Engineer

EXPERIENCE
Tech Company (2020-Present)
- Led team of 5 developers building React applications
- Improved performance by 40% through code optimization
- Implemented CI/CD pipeline reducing deployment time by 60%

SKILLS
React, Node.js, TypeScript, AWS, Docker, Kubernetes, MongoDB
```

**Sample Job Description**:

```
Senior Full Stack Developer
Requirements:
- 5+ years with React and Node.js
- Experience with AWS and cloud infrastructure
- Team leadership experience
- Strong problem-solving skills
- Docker and Kubernetes knowledge
```

**✅ Success Criteria**:

- ATS score appears (should be 75-90 for this match)
- Shows matched skills (React, Node.js, AWS, Docker, Kubernetes)
- Shows missing skills if any
- No console errors

---

### **Test 2: Job Matcher** (5-10 minutes)

**URL**: http://localhost:3000/dashboard/ai-studio/job-matcher

#### **Test Case 2A: Resume Upload**

- [ ] Click "Upload Resume" button
- [ ] Upload resume PDF
- [ ] Verify text extraction
- [ ] (Optional) Add location filter
- [ ] (Optional) Add experience level filter
- [ ] Click "Find Matches" button
- [ ] **Expected**: Loading animation
- [ ] **Expected**: 6-8 job cards appear
- [ ] **Expected**: Each job shows:
  - Job title
  - Match score (0-100%)
  - Brief summary
  - Matched skills (green badges)
  - Missing skills (red badges)
- [ ] Click on a job card → Expands with full details
- [ ] **Console**: No 404 errors

#### **Test Case 2B: Text Paste**

- [ ] Paste resume text directly
- [ ] Add filters if desired
- [ ] Click "Find Matches"
- [ ] **Expected**: Same results as upload

#### **Error Cases to Test**

- [ ] Empty resume → Validation error
- [ ] Very short text → Error message
- [ ] Network tab → Verify calling `/api/ai/job-match` (not `/api/ats/job-matcher`)

**✅ Success Criteria**:

- 6-8 relevant job suggestions appear
- Match scores are reasonable (50-95%)
- Jobs are relevant to resume skills
- No console errors
- Can expand/collapse job cards

---

### **Test 3: Content Generator - All 6 Types** (15-20 minutes)

**URL**: http://localhost:3000/dashboard/ai-studio/content-gen

#### **Test 3A: Professional Summary**

- [ ] Select "Professional Summary" card
- [ ] Paste this prompt:
  ```
  I'm a senior software engineer with 7 years experience.
  Expert in React, Node.js, and AWS. Led multiple teams.
  Increased performance by 40% in last project.
  ```
- [ ] Click "Generate"
- [ ] **Expected**: 2-4 sentence professional summary
- [ ] **Expected**: Includes metrics and quantifiable achievements
- [ ] **Expected**: ATS-friendly language
- [ ] Click "Copy" button → Copies to clipboard
- [ ] Click "Regenerate" → Generates new version

#### **Test 3B: Achievement Bullets**

- [ ] Select "Achievement Bullets" card
- [ ] Paste this prompt:
  ```
  Role: Product Manager
  - Managed product roadmap
  - Worked with engineering team
  - Launched new features
  - Improved user satisfaction
  ```
- [ ] Click "Generate"
- [ ] **Expected**: 4-6 bullet points
- [ ] **Expected**: Each starts with strong action verb
- [ ] **Expected**: Includes metrics/numbers
- [ ] **Expected**: STAR format (Situation, Task, Action, Result)

#### **Test 3C: Cover Letter**

- [ ] Select "Cover Letter" card
- [ ] Paste this prompt:
  ```
  Applying for Senior Developer at Google.
  I have 5 years React experience and led multiple projects.
  Passionate about clean code and user experience.
  ```
- [ ] Click "Generate"
- [ ] **Expected**: 250-400 word cover letter
- [ ] **Expected**: Professional tone
- [ ] **Expected**: Mentions Google and Senior Developer
- [ ] **Expected**: Highlights relevant experience

#### **Test 3D: LinkedIn Post**

- [ ] Select "LinkedIn Posts" card
- [ ] Paste this prompt:
  ```
  Just completed AWS Solutions Architect certification!
  Excited to share my cloud journey and help others.
  ```
- [ ] Click "Generate"
- [ ] **Expected**: 100-300 word engaging post
- [ ] **Expected**: Includes relevant hashtags (#AWS, #CloudComputing, #Certification)
- [ ] **Expected**: Professional yet conversational tone
- [ ] **Expected**: Encourages engagement

#### **Test 3E: Job Description**

- [ ] Select "Job Description" card
- [ ] Paste this prompt:
  ```
  Full Stack Developer position.
  Need React and Node.js skills.
  Mid-level experience. Remote work available.
  ```
- [ ] Click "Generate"
- [ ] **Expected**: 500-800 word comprehensive job description
- [ ] **Expected**: Structured sections:
  - Company overview
  - Role summary
  - Key responsibilities
  - Required qualifications
  - Preferred qualifications
  - Benefits/What we offer
- [ ] **Expected**: Inclusive language

#### **Test 3F: Skills & Keywords**

- [ ] Select "Skills & Keywords" card
- [ ] Paste this prompt:
  ```
  Senior Software Engineer with expertise in React, Node.js, AWS.
  Led team of 5 developers. Built scalable microservices.
  Implemented CI/CD pipelines. Reduced deployment time by 60%.
  ```
- [ ] Click "Generate"
- [ ] **Expected**: Structured analysis with:
  - Technical skills (React, Node.js, AWS, etc.)
  - Soft skills (Leadership, Team Management)
  - ATS keywords with variations
  - Action verbs for resume
  - Recommendations for improvement
  - Summary assessment

**✅ Success Criteria for All Content Generators**:

- All 6 types generate relevant content
- No 404 errors in console
- Copy button works
- Regenerate produces different content
- Response time < 10 seconds
- Content is professional and relevant

---

## **📊 STEP 3: MONITOR GEMINI API USAGE**

### **Google Cloud Console Setup**

1. **Access Console**:

   - Go to: https://console.cloud.google.com/
   - Sign in with account that has Gemini API key

2. **Navigate to API Monitoring**:

   - Select your project
   - Go to "APIs & Services" → "Dashboard"
   - Click on "Generative Language API"

3. **View Metrics**:

   - Check "Requests" graph
   - Monitor "Errors" count
   - Review "Latency" metrics
   - Check "Quota Usage"

4. **Set Up Alerts** (Recommended):
   - Click "Create Alert Policy"
   - Set threshold: 1000 requests/day (80% of free tier)
   - Add email notification
   - Save alert

### **Rate Limits (Free Tier)**

- **15 requests/minute**
- **1,500 requests/day**
- **1 million tokens/month**

### **Cost Monitoring** (If on Paid Tier)

- Input: $0.00025 per 1K characters
- Output: $0.001 per 1K characters
- Set budget alerts at $10, $50, $100

### **What to Watch**:

- ✅ Request count stays under daily limit
- ✅ Error rate < 5%
- ✅ Average latency < 10 seconds
- ⚠️ Spike in requests (possible abuse)
- ⚠️ High error rate (API issues)

---

## **🔍 STEP 4: SET UP ERROR TRACKING**

### **Option A: Sentry (Recommended)**

#### **Installation**:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### **Configuration** (`sentry.client.config.ts`):

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

#### **Track AI Errors** (`src/lib/ai/gemini.ts`):

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  const text = await generateText(prompt);
  return text;
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: "ai-generation",
      model: "gemini-2.0-flash-exp",
    },
    extra: {
      promptLength: prompt.length,
    },
  });
  throw error;
}
```

### **Option B: LogRocket**

#### **Installation**:

```bash
npm install logrocket logrocket-react
```

#### **Configuration** (`src/app/layout.tsx`):

```typescript
import LogRocket from "logrocket";

if (process.env.NODE_ENV === "production") {
  LogRocket.init("your-app-id");
}
```

### **Key Metrics to Track**:

- ✅ AI API failures
- ✅ 404 errors on AI endpoints
- ✅ Slow response times (>15s)
- ✅ User session replays when errors occur
- ✅ API rate limit errors

---

## **👍 STEP 5: ADD USER FEEDBACK SYSTEM**

### **Implementation Plan**

#### **1. Create Feedback Component**

**File**: `src/components/ai-studio/AIFeedback.tsx`

```typescript
"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  contentId: string;
  contentType: string;
  onFeedback?: (rating: "positive" | "negative") => void;
}

export function AIFeedback({ contentId, contentType, onFeedback }: Props) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = async (rating: "positive" | "negative") => {
    setFeedback(rating);

    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          contentType,
          rating,
          timestamp: new Date().toISOString(),
        }),
      });

      setSubmitted(true);
      onFeedback?.(rating);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (submitted) {
    return (
      <div className="text-sm text-green-600">Thanks for your feedback! 🎉</div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Was this helpful?</span>
      <Button
        size="sm"
        variant={feedback === "positive" ? "default" : "outline"}
        onClick={() => handleFeedback("positive")}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={feedback === "negative" ? "default" : "outline"}
        onClick={() => handleFeedback("negative")}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

#### **2. Create Feedback API Endpoint**

**File**: `src/app/api/ai/feedback/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import AIFeedback from "@/lib/database/models/AIFeedback";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, contentType, rating } = await req.json();

    await dbConnect();
    await AIFeedback.create({
      userId,
      contentId,
      contentType,
      rating,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
```

#### **3. Create Mongoose Model**

**File**: `src/lib/database/models/AIFeedback.ts`

```typescript
import mongoose from "mongoose";

const AIFeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  contentId: { type: String, required: true },
  contentType: { type: String, required: true, index: true },
  rating: { type: String, enum: ["positive", "negative"], required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.models.AIFeedback ||
  mongoose.model("AIFeedback", AIFeedbackSchema);
```

#### **4. Integrate into AI Pages**

Add to `src/app/dashboard/ai-studio/content-gen/page.tsx`:

```typescript
import { AIFeedback } from "@/components/ai-studio/AIFeedback";

// After content is generated:
{
  result && (
    <div className="space-y-4">
      <div className="generated-content">{result}</div>
      <AIFeedback contentId={generateContentId()} contentType={activeType.id} />
    </div>
  );
}
```

---

## **💾 STEP 6: IMPLEMENT RESPONSE CACHING**

### **Why Cache?**

- Reduce API calls by 50-70%
- Save costs on Gemini API
- Faster response times
- Better user experience

### **What to Cache?**

- ✅ Identical resume + job description analysis
- ✅ Common job matcher queries
- ✅ Frequently requested content generation
- ❌ Don't cache user-specific data

### **Implementation**

#### **1. In-Memory Cache (Simple)**

**File**: `src/lib/cache/response-cache.ts`

```typescript
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttlMinutes: number = 60) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const aiCache = new ResponseCache();
```

#### **2. Use in API Routes**

**Example** (`src/app/api/ai/ats/route.ts`):

```typescript
import { aiCache } from "@/lib/cache/response-cache";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json();

  // Create cache key from inputs
  const cacheKey = crypto
    .createHash("md5")
    .update(`${resumeText}${jobDescription}`)
    .digest("hex");

  // Check cache first
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log("✅ Returning cached ATS analysis");
    return NextResponse.json(cached);
  }

  // Generate new analysis
  const analysis = await generateText(prompt);

  // Cache for 1 hour
  aiCache.set(cacheKey, { analysis }, 60);

  return NextResponse.json({ analysis });
}
```

#### **3. Redis Cache (Production)**

For production, use Redis:

```bash
npm install ioredis
```

**File**: `src/lib/cache/redis-cache.ts`

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export async function getCached(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCached(
  key: string,
  data: any,
  ttlSeconds: number = 3600
) {
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
}
```

### **Cache Strategy by Feature**:

| Feature            | Cache Duration | Cache Key                        |
| ------------------ | -------------- | -------------------------------- |
| **ATS Analysis**   | 1 hour         | Hash of resume + job description |
| **Job Matcher**    | 30 minutes     | Hash of resume text              |
| **Content Gen**    | 24 hours       | Hash of prompt + content type    |
| **Skills Extract** | 2 hours        | Hash of input text               |

---

## **📋 COMPLETION CHECKLIST**

### **Immediate (Today)**

- [ ] ✅ Test ATS Optimizer (all test cases)
- [ ] ✅ Test Job Matcher (all test cases)
- [ ] ✅ Test all 6 Content Generators
- [ ] ✅ Verify no 404 errors in console
- [ ] ✅ Check Gemini API responses in network tab

### **This Week**

- [ ] Set up Google Cloud monitoring dashboard
- [ ] Configure rate limit alerts
- [ ] Install Sentry or LogRocket
- [ ] Add AIFeedback component to AI pages
- [ ] Implement basic in-memory caching

### **This Month**

- [ ] Migrate to Redis cache (if needed)
- [ ] Analyze feedback data for improvements
- [ ] Optimize slow-performing endpoints
- [ ] Add A/B testing for different prompts
- [ ] Create admin dashboard for monitoring

---

## **🎉 SUCCESS METRICS**

### **After Testing (Step 2)**

✅ All 8 AI endpoints respond correctly  
✅ No 404 errors  
✅ Response times < 10 seconds  
✅ Generated content is relevant and professional

### **After Monitoring Setup (Step 3)**

✅ API usage tracking active  
✅ Rate limit alerts configured  
✅ Cost monitoring enabled  
✅ Daily usage reports

### **After Error Tracking (Step 4)**

✅ Error rate < 2%  
✅ Session replays capturing issues  
✅ Alerts for critical failures  
✅ Error trends analyzed weekly

### **After Feedback System (Step 5)**

✅ 70%+ positive feedback rate  
✅ User satisfaction data collected  
✅ Improvement areas identified  
✅ A/B test results tracked

### **After Caching (Step 6)**

✅ 50-70% cache hit rate  
✅ API calls reduced significantly  
✅ Response times < 2 seconds (cached)  
✅ Cost savings measurable

---

**Testing Started**: October 6, 2025  
**Server Running**: http://localhost:3000  
**Status**: ✅ Ready for comprehensive testing!
