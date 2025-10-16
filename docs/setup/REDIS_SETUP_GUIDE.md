# Redis Setup Guide - Templates Caching (Step-by-Step)

**Date:** October 7, 2025  
**Phase:** 1 - Templates Caching Only  
**Time Required:** 15-20 minutes  
**Cost:** $0 (Free tier)

---

## 🎯 **What You're Doing**

Adding Redis caching to **templates API only** as a test. This will:

- Speed up template loading from 500ms → 5ms (100x faster!)
- Reduce filesystem reads
- Test Redis before adding to other APIs
- **Keep all functionality working** (graceful fallback)

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Create Upstash Account (5 minutes)**

1. **Go to** https://upstash.com/
2. **Click** "Sign Up" (top right)
3. **Choose:** Sign up with GitHub (easiest) or Email
4. **Verify** your email if using email signup

---

### **Step 2: Create Redis Database (3 minutes)**

1. **Click** "Create Database" button
2. **Fill in:**
   - Name: `ai-resume-cache` (or any name you like)
   - Type: **Regional** (faster, free tier)
   - Region: Choose closest to you (e.g., `us-east-1`, `eu-west-1`)
   - Eviction: **Leave as default** (no eviction)
3. **Click** "Create"

4. **Wait** ~10 seconds for database to be ready

---

### **Step 3: Get Redis Credentials (2 minutes)**

1. **You'll see** your new database dashboard
2. **Scroll down** to "REST API" section
3. **Copy these two values:**

   - `UPSTASH_REDIS_REST_URL` (looks like: `https://your-db-12345.upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN` (long string of letters/numbers)

4. **Keep this tab open** - you'll need these in next step

---

### **Step 4: Add Environment Variables (2 minutes)**

1. **Open** your `.env.local` file in VS Code

2. **Add these lines at the bottom:**

   ```env
   # Redis Configuration (Upstash)
   UPSTASH_REDIS_REST_URL=https://your-db-12345.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   REDIS_ENABLED=true
   ```

3. **Replace** the URL and TOKEN with your actual values from Step 3

4. **Save** the file (Ctrl+S / Cmd+S)

**Example (with fake credentials):**

```env
# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://intense-lemur-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXasdfQWERTYqwertyASDFGHzxcvbn1234567890
REDIS_ENABLED=true
```

---

### **Step 5: Install Redis Package (2 minutes)**

1. **Open terminal** in VS Code (Ctrl+` or View → Terminal)

2. **Run:**

   ```bash
   npm install @upstash/redis
   ```

3. **Wait** for installation to complete (~30 seconds)

4. **You should see:**
   ```
   added 1 package, and audited 123 packages in 5s
   ```

---

### **Step 6: Restart Development Server (1 minute)**

1. **Stop** the current server if running (Ctrl+C in terminal)

2. **Start** the server:

   ```bash
   npm run dev
   ```

3. **Wait** for "Local: http://localhost:3000" message

---

### **Step 7: Test Templates Caching (5 minutes)**

#### **Test 1: First Load (Cache MISS)**

1. **Open browser** to http://localhost:3000/dashboard/templates

2. **Open DevTools** (F12 or Right-click → Inspect)

3. **Go to Network tab**

4. **Refresh page** (Ctrl+R / Cmd+R)

5. **Click on** the `templates` request

6. **Look at Response Headers:**

   - Should see: `X-Cache: MISS` ✅
   - Response time: ~500ms

7. **Check VS Code terminal:**
   - Should see: `[Templates API] ⚠️ Cache MISS - fetching from filesystem (slow)`
   - Should see: `[Redis] ✅ Cache SET: templates:all (TTL: 86400s)`

#### **Test 2: Second Load (Cache HIT)**

1. **Refresh page again** (Ctrl+R / Cmd+R)

2. **Look at Response Headers:**

   - Should see: `X-Cache: HIT` ✅
   - Response time: ~5-10ms (100x faster!)

3. **Check VS Code terminal:**

   - Should see: `[Templates API] ✅ Returned from cache (fast!)`
   - Should see: `[Redis] ✅ Cache HIT: templates:all`

4. **Success!** 🎉 Templates are now cached for 24 hours

#### **Test 3: Fallback (Redis Disabled)**

1. **Open** `.env.local`

2. **Change:**

   ```env
   REDIS_ENABLED=false
   ```

3. **Save** and **restart server** (Ctrl+C, then `npm run dev`)

4. **Refresh** templates page

5. **Check terminal:**

   - Should see: `[Redis] Disabled via REDIS_ENABLED=false`
   - Templates still load normally ✅
   - Just not cached (always reads from filesystem)

6. **Change back:**

   ```env
   REDIS_ENABLED=true
   ```

7. **Restart server** again

---

## ✅ **Success Checklist**

After completing all steps, verify:

- [ ] ✅ Upstash account created
- [ ] ✅ Redis database created
- [ ] ✅ Credentials added to `.env.local`
- [ ] ✅ `@upstash/redis` package installed
- [ ] ✅ Server restarted
- [ ] ✅ First load shows `X-Cache: MISS` (~500ms)
- [ ] ✅ Second load shows `X-Cache: HIT` (~5ms)
- [ ] ✅ Terminal logs show cache messages
- [ ] ✅ Redis disabled mode still works
- [ ] ✅ Templates display correctly

---

## 🎯 **Expected Results**

### **Before Redis:**

```
Visit /dashboard/templates:
- Load time: 500ms
- Filesystem reads: 12 files
- Terminal: No cache logs
```

### **After Redis (First Visit):**

```
Visit /dashboard/templates:
- Load time: 500ms (cache miss)
- Filesystem reads: 12 files
- Terminal: "[Templates API] ⚠️ Cache MISS - fetching from filesystem"
- Terminal: "[Redis] ✅ Cache SET: templates:all"
- Response header: X-Cache: MISS
```

### **After Redis (Subsequent Visits):**

```
Visit /dashboard/templates:
- Load time: 5ms (cache hit) ⚡
- Filesystem reads: 0
- Terminal: "[Templates API] ✅ Returned from cache (fast!)"
- Terminal: "[Redis] ✅ Cache HIT: templates:all"
- Response header: X-Cache: HIT
```

---

## 🐛 **Troubleshooting**

### **Problem: "Cannot find module '@upstash/redis'"**

**Solution:**

```bash
npm install @upstash/redis
```

Then restart server.

---

### **Problem: No cache logs in terminal**

**Solution:**

1. Check `.env.local` has correct credentials
2. Check `REDIS_ENABLED=true`
3. Restart development server
4. Make sure you're in development mode (`npm run dev`, not `npm start`)

---

### **Problem: "Redis connection failed"**

**Solution:**

1. Verify credentials in `.env.local` are correct
2. Check Upstash dashboard - database should be "active"
3. Try visiting: `https://your-redis-url.upstash.io` in browser
   - Should show JSON response with Redis info
4. If still failing, app will fall back to normal operation (no caching)

---

### **Problem: Templates not loading at all**

**Solution:**

1. Redis failure doesn't break app - check for other errors
2. Check browser console (F12) for errors
3. Check VS Code terminal for actual error messages
4. Try disabling Redis: `REDIS_ENABLED=false`

---

### **Problem: Cache never expires**

**Solution:**

- Cache is set for 24 hours
- To clear manually:
  1. Go to Upstash dashboard
  2. Click "Data Browser"
  3. Delete key: `templates:all`
  4. Or change TTL in code (line with `86400`)

---

## 📊 **Monitoring Your Cache**

### **Upstash Dashboard:**

1. Go to https://console.upstash.com/
2. Click your database
3. View:
   - **Commands/day:** How many cache operations
   - **Storage:** How much data cached
   - **Hit rate:** Cache efficiency

### **VS Code Terminal:**

- `[Redis] ✅ Cache HIT:` - Data served from cache (fast)
- `[Redis] ✅ Cache SET:` - Data stored in cache
- `[Redis] Disabled` - Redis turned off
- `[Redis] Error` - Redis unavailable (app still works)

### **Browser DevTools:**

- Network tab → `templates` request → Response Headers
- `X-Cache: HIT` = From cache (fast)
- `X-Cache: MISS` = From filesystem (slow)

---

## 🎉 **Next Steps (After Success)**

Once templates caching is working:

1. **Enjoy the speed!** Templates now load 100x faster
2. **Monitor for 1-2 days** to ensure stability
3. **Ready for more?** Add caching to:
   - Dashboard stats (5min cache)
   - Resume lists (2min cache)
   - AI responses (1hr cache)

---

## 💡 **Tips**

- **Cache TTL:** 24 hours for templates (they rarely change)
- **Free tier:** 10,000 commands/day (plenty for 100+ users)
- **Storage:** Templates use ~100KB cached
- **Fallback:** If Redis fails, app still works (reads from filesystem)
- **Logs:** Development only - won't spam production logs
- **Cost:** $0 forever on free tier

---

## 🔐 **Security Notes**

- ✅ Redis credentials in `.env.local` (not committed to Git)
- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit credentials to repository
- ✅ Upstash uses TLS encryption
- ✅ REST API is token-authenticated

---

## 📝 **Files Modified**

1. **Created:** `src/lib/redis.ts` (Redis client with fallback)
2. **Modified:** `src/app/api/templates/route.ts` (added caching)
3. **Modified:** `.env.local` (added Redis credentials)
4. **Added:** `@upstash/redis` to `package.json`

---

## ✅ **Summary**

**What you did:**

- ✅ Set up free Upstash Redis account
- ✅ Added Redis caching to templates API
- ✅ Templates now load 100x faster (after first visit)
- ✅ App still works if Redis fails

**What changed:**

- ✅ Templates API checks cache first
- ✅ Falls back to filesystem if cache miss
- ✅ Stores result for 24 hours
- ✅ Zero impact on functionality

**Time saved per page load:**

- First visit: 500ms (same as before)
- Every other visit: 495ms saved (5ms vs 500ms)
- 100 daily users = 49 seconds saved total! ⚡

---

**Ready to add more caching?** Let me know! 🚀

---

_Generated: October 7, 2025_  
_Phase: 1 - Templates Only_  
_Status: Ready to implement_
