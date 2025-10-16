# 🧪 Testing Guide: 15 Cached AI Endpoints

## ✅ Server Status

- **Status**: Running at http://localhost:3000
- **Turbopack**: Enabled
- **Redis**: Connected to Upstash
- **Cached Endpoints**: 15 ready to test

## 🎯 How Cache Testing Works

### First Request (Cache MISS)

1. User sends a prompt to AI endpoint
2. Server checks Redis cache → **Not found**
3. Console shows: `[AI Endpoint] ⚠️ Cache MISS - Calling AI API`
4. Server calls Gemini AI (~2-3 seconds)
5. Server caches the response for 1 hour
6. Console shows: `[AI Endpoint] ✅ Cached response for 1 hour`
7. Response headers: `X-Cache: MISS`

### Second Request (Cache HIT - Same Prompt)

1. User sends **same prompt** again
2. Server checks Redis cache → **Found!**
3. Console shows: `[AI Endpoint] ✅ Cache HIT - Saved API cost!`
4. Server returns cached response instantly (~5-10ms)
5. Response headers: `X-Cache: HIT`, `X-Cost-Saved: true`
6. **$0.001 saved + 200-600x faster!**

## 📝 Quick Test Checklist

### Easy Tests (Use Browser or Postman)

#### 1. Test Resume Summary (Most Popular)

**Endpoint**: `POST http://localhost:3000/api/ai/summary`

**Request Body**:

```json
{
  "resumeText": "John Doe - Software Engineer with 5 years of experience in React, Node.js, and cloud technologies."
}
```

**First Request**:

- Watch terminal for: `[AI Summary] ⚠️ Cache MISS - Calling AI API`
- Wait 2-3 seconds
- Watch terminal for: `[AI Summary] ✅ Cached response for 1 hour`

**Second Request (Same prompt)**:

- Watch terminal for: `[AI Summary] ✅ Cache HIT - Saved API cost!`
- Response instant (~10ms)
- Check headers: `X-Cache: HIT`

✅ **Success Criteria**: Second request is instant!

---

#### 2. Test Bullet Points

**Endpoint**: `POST http://localhost:3000/api/ai/bullets`

**Request Body**:

```json
{
  "input": "Managed a team and improved sales"
}
```

**Expected Behavior**:

- 1st request: Cache MISS → AI call → 2-3 sec
- 2nd request: Cache HIT → Instant response
- Terminal shows cache status

---

#### 3. Test Skills Suggestions

**Endpoint**: `POST http://localhost:3000/api/ai/suggest-skills`

**Request Body**:

```json
{
  "role": "Frontend Developer"
}
```

**Expected Behavior**:

- 1st request: Cache MISS → Returns skills array
- 2nd request: Cache HIT → Same skills, instant
- Check terminal logs

---

#### 4. Test Cover Letter Generation

**Endpoint**: `POST http://localhost:3000/api/ai/content-gen/cover-letter`

**Request Body**:

```json
{
  "prompt": "Write a cover letter for a senior developer role",
  "targetRole": "Senior Software Engineer",
  "targetCompany": "Tech Corp",
  "experienceLevel": "senior",
  "industry": "technology"
}
```

**Expected Behavior**:

- 1st request: Cache MISS → Generates cover letter → Saves to DB
- 2nd request: Cache HIT → Same cover letter instantly
- Both requests save to database (different IDs)

---

#### 5. Test Job Matching (30min cache)

**Endpoint**: `POST http://localhost:3000/api/ai/job-match`

**Request Body**:

```json
{
  "resumeText": "Senior React Developer with 5 years experience in TypeScript, Next.js, and AWS",
  "location": "Remote",
  "preferences": "Full-time, startup environment"
}
```

**Expected Behavior**:

- 1st request: Cache MISS → Returns 6 job matches
- 2nd request: Cache HIT → Same matches instantly
- Terminal shows: `[AI Job Match] ✅ Cache HIT - Saved API cost!`

---

## 🔍 Terminal Monitoring

While testing, watch your terminal for these logs:

### Cache MISS (First Request)

```
[AI Summary] ⚠️ Cache MISS - Calling AI API
[AI Summary] ✅ Cached response for 1 hour
```

### Cache HIT (Second Request - Same Prompt)

```
[AI Summary] ✅ Cache HIT - Saved API cost!
```

### Expected Pattern

```
Request 1 (new prompt) → MISS → AI call → Cache storage
Request 2 (same prompt) → HIT → Instant response
Request 3 (different prompt) → MISS → AI call → Cache storage
Request 4 (same as Request 1) → HIT → Instant response
```

---

## 📊 Upstash Dashboard Monitoring

1. **Login to Upstash**: https://console.upstash.com/
2. **Select your Redis database**
3. **Check these metrics**:

### Key Metrics to Watch

- **Commands/Day**: Should increase by 2 per cached AI request (GET + SET)

  - Expected: 800-1,400 commands/day
  - Limit: 10,000 commands/day
  - Status: ✅ Safe (8-14% usage)

- **Storage Used**: Should be 10-20 MB

  - Limit: 256 MB
  - Status: ✅ Safe (4-8% usage)

- **Bandwidth**: Should be minimal
  - Limit: 200 MB/day
  - Status: ✅ Safe

### Data Browser

Click "Data Browser" to see cached keys:

- `ai:1a2b3c4d5e6f7890` ← Cached AI responses
- Each key expires after 1 hour (3600 seconds)
- You should see new keys appear as you test

---

## 🎯 Complete Endpoint Testing List

### ✅ 15 Cached Endpoints to Test

#### Core Resume Features (5 endpoints)

1. ✅ `/api/ai/summary` - Resume summary
2. ✅ `/api/ai/bullets` - Bullet points
3. ✅ `/api/ai/tailored-bullets` - Job-specific bullets
4. ✅ `/api/ai/suggest-skills` - Skill suggestions
5. ✅ `/api/ai/keywords` - Keyword analysis

#### Descriptions (2 endpoints)

6. ✅ `/api/ai/generate-project-description` - Project descriptions
7. ✅ `/api/ai/education-description` - Education descriptions

#### Content Generation (2 endpoints)

8. ✅ `/api/ai/content-gen/cover-letter` - Cover letters
9. ✅ `/api/ai/content-gen/linkedin-post` - LinkedIn posts

#### Job Matching (4 endpoints)

10. ✅ `/api/ai/job-match` - Job matching (30min cache)
11. ✅ `/api/ai/quantify` - Quantify achievements
12. ✅ `/api/ai/outreach` - Outreach messages
13. ✅ `/api/ai/extract-skills-from-jd` - Extract skills from JD

#### Professional Development (3 endpoints)

14. ✅ `/api/ai/interests` - Interest suggestions
15. ✅ `/api/ai/certifications` - Certification suggestions
16. ✅ `/api/ai/certification-description` - Certification descriptions

---

## 💡 Testing Tips

### Use Postman or Insomnia for Easy Testing

1. Create a collection with all 15 endpoints
2. Add authentication headers (Clerk session token)
3. Save test requests for reuse
4. Check response headers for `X-Cache` status

### Chrome DevTools Network Tab

1. Open DevTools → Network tab
2. Make AI requests from your UI
3. Check response headers:
   - `X-Cache: HIT` ← Cached (instant)
   - `X-Cache: MISS` ← New AI call
   - `X-Cost-Saved: true` ← Saved $0.001

### Terminal Watching

```bash
# Keep terminal visible while testing
# Watch for cache HIT/MISS logs
# Logs appear immediately when endpoint is called
```

---

## 📈 Success Metrics

### After 1 Hour of Testing

- ✅ Cache HITs should be 30-40% (repeat prompts)
- ✅ Response time for HITs: 5-10ms (vs 2000-3000ms)
- ✅ Upstash commands: Should stay under 2,000/day
- ✅ No errors in terminal
- ✅ All 15 endpoints working

### After 1 Day of Production Use

- ✅ Cache hit rate: 30-40%
- ✅ Cost reduction: 50-55% (~$7-8/month savings)
- ✅ Upstash usage: 8-14% of free tier
- ✅ User experience: Instant responses for repeated prompts

### After 1 Week of Production Use

- ✅ Confirmed cost savings in Gemini API billing
- ✅ Redis usage stable and safe
- ✅ Ready to add remaining 7-9 endpoints

---

## 🚨 Troubleshooting

### Cache Not Working (Always MISS)

**Problem**: Terminal shows MISS on every request, even for same prompt

**Solutions**:

1. Check Redis credentials in `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```
2. Check Upstash dashboard - is database running?
3. Check terminal for Redis connection errors
4. Restart dev server: `npm run dev`

### Cache Too Aggressive (Old Data)

**Problem**: Getting stale responses, need fresher data

**Solution**: Clear specific keys in Upstash Data Browser, or adjust TTL:

```typescript
await setCache(cacheKey, responseData, 1800); // 30 minutes instead of 1 hour
```

### Redis Connection Errors

**Problem**: Terminal shows Redis errors

**Solution**: App still works! Graceful fallback means:

- Cache checks fail silently
- AI calls still work normally
- Fix Redis credentials and restart

---

## 🎉 Expected Results

### Performance Gains

- **Cache HIT**: 5-10ms response time
- **Cache MISS**: 2000-3000ms response time
- **Speed Improvement**: 200-600x faster on HITs

### Cost Savings

- **Before**: $0.001 per AI request
- **After (Cache HIT)**: $0.000 per request
- **Monthly Savings**: ~$7-8/month (50-55% reduction)
- **Yearly Savings**: ~$84-96/year

### User Experience

- Instant responses for 30-40% of requests
- No waiting for repeat prompts
- Same quality AI responses

---

## 📝 Test Report Template

After testing, document your results:

```markdown
# Cache Testing Report

## Test Date: [Date]

## Endpoints Tested: 15/15

## Test Duration: [X hours]

### Results:

- ✅ Cache HITs: [X]%
- ✅ Cache MISSes: [X]%
- ✅ Average HIT response time: [X]ms
- ✅ Average MISS response time: [X]ms
- ✅ Upstash commands used: [X]/10,000
- ✅ Upstash storage used: [X MB]/256 MB
- ✅ Errors encountered: [None/List]

### Conclusion:

[Your findings - is caching working as expected?]

### Next Steps:

- [ ] Monitor for 3-7 days
- [ ] Check cost reduction in Gemini billing
- [ ] Consider adding remaining 7-9 endpoints
```

---

## 🚀 Next Steps After Testing

1. **Monitor for 3-7 Days**

   - Watch Upstash dashboard daily
   - Check cache hit rates
   - Verify cost reduction in Gemini API billing

2. **Measure Real Cost Savings**

   - Compare Gemini API usage before/after
   - Calculate actual savings
   - Confirm 50-55% reduction

3. **Plan Remaining Endpoints** (Optional)

   - Add 5 high-priority endpoints (20 min)
   - Reach 65% cost reduction ($10/month savings)
   - Deploy incrementally

4. **Production Deployment**
   - Deploy to Vercel/your hosting
   - Update environment variables
   - Monitor production metrics

---

**Ready to test?** Start with endpoint #1 (Resume Summary) - it's the easiest and most popular! 🚀
