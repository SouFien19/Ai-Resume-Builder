# 🧪 AI Experience Description - Testing Guide

## Quick Test Checklist

### Test 1: Generate Experience Description (Normal Flow)

**Endpoint**: `/api/ai/generate-experience-description`

**Test Data**:

```json
{
  "company": "Google",
  "position": "Senior Software Engineer",
  "startDate": "Jan 2020",
  "endDate": "Present",
  "description": "",
  "industry": "Technology",
  "experienceLevel": "senior"
}
```

**Expected Result**:

```json
{
  "success": true,
  "data": {
    "description": "2-3 line description (50-80 words max)",
    "achievements": [
      "Bullet 1 (15-20 words)",
      "Bullet 2 (15-20 words)",
      "Bullet 3 (15-20 words)"
    ]
  }
}
```

**Verification**:

- ✅ Description is 2-3 lines maximum
- ✅ Each bullet is 15-20 words
- ✅ Response time < 7 seconds (first call)
- ✅ Response time < 100ms (cached call)

---

### Test 2: Modify Experience Description

**Endpoint**: `/api/ai/modify-experience-description`

**Test Data**:

```json
{
  "description": "Led software development team at startup.",
  "achievements": ["Built mobile app", "Managed team of 5"],
  "prompt": "Make it more quantifiable and add metrics"
}
```

**Expected Result**:

```json
{
  "success": true,
  "data": {
    "description": "2-3 line enhanced description with metrics",
    "achievements": [
      "Built mobile app with 10K+ downloads and 4.5* rating",
      "Managed team of 5 engineers, increasing velocity by 30%",
      "Additional quantified achievement"
    ]
  }
}
```

**Verification**:

- ✅ Description is still 2-3 lines
- ✅ Metrics/numbers added where requested
- ✅ Achievements are concise (15-20 words)

---

### Test 3: 503 Error Handling

**Trigger**: Wait for peak API usage time or trigger manually

**Expected Behavior**:

```bash
# Console logs should show:
[Retry] Attempt 1/3 - Error: 503 Service Unavailable
[Retry] Waiting 2000ms before retry...
[Retry] Attempt 2/3 - Error: 503 Service Unavailable
[Retry] Waiting 4000ms before retry...
[Retry] Attempt 3/3 - Error: 503 Service Unavailable
[AI Experience Description] ⚠️ Using fallback response due to API error
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "description": "Served as Senior Software Engineer at Google, contributing to key business objectives and team success.",
    "achievements": [
      "Executed core responsibilities for Senior Software Engineer role",
      "Collaborated with cross-functional teams on projects",
      "Applied industry best practices and modern technologies"
    ],
    "metadata": {
      "fallback": true
    }
  }
}
```

**Verification**:

- ✅ No error returned to user
- ✅ Fallback content is professional
- ✅ Total wait time: ~14 seconds (2s + 4s + 8s)

---

### Test 4: Cache Performance

**Steps**:

1. Call `/api/ai/generate-experience-description` with same data
2. Call it again immediately

**Expected**:

- First call: 5-7 seconds (AI generation)
- Second call: < 100ms (Redis cache)

**Console Logs**:

```bash
# First call
[AI Experience Description] ⚠️ Cache MISS - Calling AI API
[AI Experience Description] ✅ Cached response for 1 hour

# Second call
[AI Experience Description] ✅ Cache HIT - Saved API cost!
```

---

## Testing in the UI

### Location: Dashboard → Resume Editor

1. **Open Resume Editor**:

   - Go to: `http://localhost:3000/dashboard/resumes/[id]/edit`
   - Click on "Experience" section

2. **Test Generate**:

   - Fill in: Company, Position, Dates
   - Click "✨ Generate with AI"
   - **Verify**: Description is 2-3 lines max
   - **Verify**: Bullets are short and impactful

3. **Test Modify**:

   - Select existing experience
   - Click "✨ Modify with AI"
   - Enter prompt: "Add more metrics and numbers"
   - **Verify**: Output is still concise
   - **Verify**: Numbers/metrics added

4. **Test Retry Behavior**:
   - If you see "The model is overloaded" error:
     - **Before fix**: Error shown to user immediately
     - **After fix**: Page waits ~14s, then shows fallback content
   - **Verify**: No error toast shown
   - **Verify**: User receives usable content

---

## Manual API Testing (Postman/Thunder Client)

### Request 1: Generate Experience

```http
POST http://localhost:3000/api/ai/generate-experience-description
Content-Type: application/json

{
  "company": "Microsoft",
  "position": "Product Manager",
  "startDate": "2021-06",
  "endDate": "2024-03",
  "industry": "Technology",
  "experienceLevel": "mid-level"
}
```

### Request 2: Modify Experience

```http
POST http://localhost:3000/api/ai/modify-experience-description
Content-Type: application/json

{
  "description": "Managed product roadmap",
  "achievements": ["Launched new features", "Worked with engineering"],
  "prompt": "Make it more specific with numbers and impact"
}
```

---

## Success Criteria ✅

### Description Quality

- [ ] Description is 2-3 lines (50-80 words)
- [ ] Uses strong action verbs
- [ ] Includes company and role context
- [ ] Professional and ATS-friendly

### Achievements Quality

- [ ] 3-4 bullet points
- [ ] Each bullet is 15-20 words
- [ ] Includes quantifiable metrics when possible
- [ ] Starts with action verbs
- [ ] Scannable and impactful

### Technical Performance

- [ ] First call: < 7 seconds
- [ ] Cached call: < 100ms
- [ ] Retry on 503: ~14 seconds max
- [ ] Fallback works when API unavailable
- [ ] No errors shown to user

### Error Handling

- [ ] 503 errors trigger retry (3 attempts)
- [ ] Exponential backoff: 2s → 4s → 8s
- [ ] Fallback content returned after retries
- [ ] Logs show retry attempts
- [ ] User experience is seamless

---

## Monitoring Commands

### Watch Logs in Real-Time

```powershell
# Terminal 1: Watch for retry logs
Get-Content -Path "C:\Users\hp\Desktop\ai-resume-v3\.next\trace" -Wait | Select-String "Retry|Cache|AI Experience"

# Or just watch the dev server output
```

### Check API Response Times

```bash
# Time the API call
Measure-Command { Invoke-WebRequest -Uri "http://localhost:3000/api/ai/generate-experience-description" -Method POST -Body '{"company":"Test","position":"Engineer","startDate":"2020","endDate":"2024"}' -ContentType "application/json" }
```

---

## Common Issues & Solutions

### Issue 1: Still getting long descriptions

**Solution**: Clear Redis cache

```bash
# If using Redis CLI
redis-cli FLUSHDB

# Or restart Redis
```

### Issue 2: 503 errors not retrying

**Solution**: Check retry logs in console

- Should see: `[Retry] Attempt 1/3...`
- If not, check error type: `error?.status === 503`

### Issue 3: Fallback content showing too often

**Solution**: Check Gemini API status

- May need to upgrade API tier
- Or implement rate limiting

---

## Quick Summary

**What was fixed**:

1. ✅ 503 errors now retry 3 times with exponential backoff
2. ✅ Descriptions constrained to 2-3 lines (50-80 words)
3. ✅ Achievements limited to 15-20 words each
4. ✅ Fallback content when API fails
5. ✅ Better error logging for debugging

**How to verify**:

1. Generate experience → Check length (2-3 lines)
2. Wait for 503 error → Check retry behavior (3 attempts)
3. Call twice → Check cache (< 100ms second call)
4. Modify experience → Check output stays concise

**Ready to test!** 🚀
