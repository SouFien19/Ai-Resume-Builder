# 🧪 Testing Guide - New Auth System

## Quick Test Checklist

### ✅ Test 1: Check Server is Running

```bash
# Server should be running at http://localhost:3000
# Check terminal for any errors
```

**Expected Output**:

```
✓ Compiled middleware in 488ms
✓ Ready in 2.3s
```

---

### ✅ Test 2: Test Sign-In Page Loading

1. Open browser: `http://localhost:3000/sign-in`
2. Page should load instantly (no loading spinner)
3. Should see the new UI with stats (10K+ Users, etc.)

**What Changed**:

- ❌ Before: Loading spinner for 200-500ms
- ✅ Now: Instant render

---

### ✅ Test 3: Sign In as Regular User

1. Sign out if logged in
2. Go to `/sign-in`
3. Sign in with regular user credentials
4. Watch the browser URL bar

**Expected Behavior**:

- Should redirect DIRECTLY to `/dashboard`
- No `/sign-in` → `/dashboard` → `/sign-in` loop
- Should take < 1.5 seconds total

**Check Terminal Logs**:

```
[MIDDLEWARE] 🔄 Redirecting logged-in user from auth page to /dashboard
GET /dashboard 200 in 800ms
```

**Check Browser Network Tab**:

- Should see ONE redirect (not 3-4)
- No 404 errors
- No 401 errors on API calls

---

### ✅ Test 4: Sign In as Admin

1. First, you need to promote a user to admin
2. Option A: Use Clerk Dashboard

   - Go to Clerk Dashboard → Users
   - Select a user
   - Go to "Metadata" tab
   - Add to Public Metadata:
     ```json
     {
       "role": "admin"
     }
     ```

3. Option B: Use the setUserRole function

   - We'll create a quick API route for this

4. Sign in with that admin user
5. Should redirect DIRECTLY to `/admin`

**Expected Terminal Log**:

```
[MIDDLEWARE] 🔄 Redirecting logged-in admin from auth page to /admin
GET /admin 200 in 600ms
```

---

### ✅ Test 5: Access Control

**Test 5A: Regular user tries to access /admin**

1. Sign in as regular user
2. Try to visit `http://localhost:3000/admin`
3. Should redirect to `/dashboard`
4. Terminal should show:
   ```
   [MIDDLEWARE] ⚠️ Non-admin user user_xxx tried to access /admin
   ```

**Test 5B: Admin tries to access /dashboard**

1. Sign in as admin
2. Try to visit `http://localhost:3000/dashboard`
3. Should redirect to `/admin`
4. Terminal should show:
   ```
   [MIDDLEWARE] 🔄 Redirecting admin from /dashboard to /admin
   ```

---

### ✅ Test 6: No More 401 Errors

1. Sign in as any user
2. Go to dashboard
3. Open Browser DevTools → Network tab
4. Refresh the page
5. Check all API calls

**Expected**:

- ✅ All API calls return 200 (success)
- ❌ No 401 Unauthorized errors
- ❌ No 404 Not Found errors

---

### ✅ Test 7: Webhook (After Setup)

**Prerequisites**:

- Webhook configured in Clerk
- `CLERK_WEBHOOK_SECRET` in `.env.local`

**Test**:

1. Go to Clerk Dashboard
2. Create a new test user
3. Check your server terminal

**Expected Output**:

```
[WEBHOOK] 📨 Received event: user.created
[2025-10-15T14:30:00.000Z] INFO: Connecting to MongoDB...
[2025-10-15T14:30:00.500Z] INFO: MongoDB connected successfully
[WEBHOOK] ✅ User created: user_2abc123xyz
```

4. Check MongoDB - user should exist with all metadata

---

### ✅ Test 8: Performance Check

**Use Browser DevTools → Network**:

1. Clear browser cache
2. Sign out
3. Open DevTools → Network tab
4. Go to `/sign-in`
5. Sign in
6. Measure total time from sign-in to dashboard load

**Expected Performance**:

- Total time: < 1.5 seconds
- Redirects: 1 (not 3-4)
- API calls: Normal data fetching only
- No repeated role checks

**Before vs After**:
| Metric | Before | After |
|--------|--------|-------|
| Login time | 5-6s | <1.5s |
| Redirects | 3-4 | 1 |
| 404 errors | 2-3 | 0 |
| 401 errors | 3-4 | 0 |

---

## 🐛 Common Issues & Solutions

### Issue 1: "Still seeing redirect loops"

**Solution**:

1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check that `/api/auth/callback` route is deleted
4. Restart dev server

### Issue 2: "Role is still 'user' even after setting to 'admin'"

**Solution**:

- Clerk JWT tokens are cached
- Sign out completely
- Sign in again
- Or wait 1-2 minutes for token refresh

### Issue 3: "Dashboard shows 401 errors"

**Solution**:

- This means Clerk session isn't ready yet
- Check if you're signed in
- Try refreshing the page
- Check `.env.local` has correct Clerk keys

### Issue 4: "Middleware not redirecting"

**Solution**:

1. Check middleware logs in terminal
2. Make sure role is set in Clerk metadata
3. Try: `console.log('Role:', role)` in middleware to debug
4. Verify JWT contains role in `sessionClaims`

---

## 📊 What to Look For (Success Indicators)

### ✅ Good Signs:

- ✅ Single redirect per login
- ✅ Login completes in < 1.5 seconds
- ✅ No 404 or 401 errors
- ✅ Terminal shows role-based redirects
- ✅ Admins go to /admin, users go to /dashboard
- ✅ Access control works (users can't access /admin)

### ❌ Bad Signs (Need fixing):

- ❌ Multiple redirects (loop)
- ❌ 404 errors for /dashboard or /admin
- ❌ 401 Unauthorized errors on API calls
- ❌ Login takes > 3 seconds
- ❌ Users can access /admin
- ❌ Admins see dashboard flash

---

## 🎯 Next: Configure Webhook

Once local testing passes, you need to:

1. **For Production**:

   - Deploy to Vercel/production
   - Configure Clerk webhook with production URL
   - Run migration script

2. **For Local Testing**:
   - Use ngrok to expose localhost
   - Configure Clerk webhook with ngrok URL
   - Test webhook by creating users

See `PHASE_1_COMPLETE_AUTH_OPTIMIZATION.md` for detailed webhook setup instructions.

---

**Current Status**: ✅ Phase 1 Complete - Ready for Testing!
