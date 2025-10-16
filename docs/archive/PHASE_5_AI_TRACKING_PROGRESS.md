# Phase 5 AI Tracking Progress

## Endpoints Updated (2/25)

### ✅ Completed

1. `/api/ai/summary` - Resume summary generation
2. `/api/ai/bullets` - Experience bullets generation

### 🔄 In Progress

3. `/api/ai/tailored-bullets` - Job-specific bullets
4. `/api/ai/quantify` - Add metrics to bullets
5. `/api/ai/suggest-skills` - Skills suggestions
6. `/api/ai/keywords` - Keyword extraction

### ⏸️ Pending High Priority

7. `/api/ai/content-gen/cover-letter` - Cover letter generation
8. `/api/ai/content-gen/linkedin-post` - LinkedIn post generation
9. `/api/ai/content-gen/skills-keywords` - Skills keywords
10. `/api/ai/career` - Career advice
11. `/api/ai/ats/extract` - ATS extraction
12. `/api/ai/optimize-ats` - ATS optimization

### ⏸️ Pending Medium Priority

13. `/api/ai/analyze-job` - Job analysis
14. `/api/ai/job-match` - Job matching
15. `/api/ai/generate-experience` - Experience generation
16. `/api/ai/modify-experience-description` - Modify experience
17. `/api/ai/education-description` - Education descriptions
18. `/api/ai/certification-description` - Certification descriptions
19. `/api/ai/interests` - Interest suggestions
20. `/api/ai/certifications` - Certification suggestions

### ⏸️ Pending Lower Priority

21. `/api/ai/chat` - AI chat
22. `/api/ai/outreach` - Outreach messages
23. `/api/ai/summary-stream` - Streaming summary
24. `/api/ai/extract-skills-from-jd` - Extract skills from JD
25. `/api/ai/content-gen/job-description` - Job description generation

## Tracking Pattern

```typescript
import { trackAIRequest } from "@/lib/ai/track-analytics";

// Before AI call
const startTime = Date.now();
const response = await generateText(prompt, options);
const requestDuration = Date.now() - startTime;

// Track success
await trackAIRequest({
  userId,
  contentType: "feature-name", // Map to appropriate feature
  cached: false,
  success: true,
  tokensUsed: Math.ceil(prompt.length / 4) + Math.ceil(response.length / 4),
  requestDuration,
});

// Track failure (in catch block)
await trackAIRequest({
  userId: (await auth()).userId || "unknown",
  contentType: "feature-name",
  cached: false,
  success: false,
  errorMessage: error instanceof Error ? error.message : "Unknown error",
});
```

## Content Type Mapping

| Endpoint                            | contentType Value |
| ----------------------------------- | ----------------- |
| `/api/ai/summary`                   | `resume-summary`  |
| `/api/ai/bullets`                   | `work-experience` |
| `/api/ai/tailored-bullets`          | `work-experience` |
| `/api/ai/quantify`                  | `work-experience` |
| `/api/ai/suggest-skills`            | `skills-keywords` |
| `/api/ai/keywords`                  | `skills-keywords` |
| `/api/ai/content-gen/cover-letter`  | `cover-letter`    |
| `/api/ai/content-gen/linkedin-post` | `linkedin-post`   |
| `/api/ai/career`                    | `work-experience` |
| `/api/ai/ats/*`                     | `work-experience` |
