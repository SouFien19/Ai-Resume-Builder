# Role-Based Redirect Testing Guide

## 🧪 How to Test the Redirect System

### Prerequisites

- Dev server running: `npm run dev`
- Browser console open (F12 → Console tab)
- Two test accounts ready

### Test Accounts

1. **Super Admin**: `soufianelabiadh@gmail.com`
2. **Regular User**: `doxifiw460@djkux.com` (or any other test user)

---

## 📝 Test Scenarios

### Test 1: Regular User Sign-In

**Goal**: Verify regular users stay on `/dashboard`

**Steps**:

1. Open browser console (F12)
2. Go to `http://localhost:3000/sign-in`
3. Sign in with regular user credentials
4. **Watch the console for these logs**:
   ```
   [DASHBOARD] Role check useEffect triggered {isLoaded: true, isSignedIn: true}
   [DASHBOARD] Fetching user role...
   [DASHBOARD] Role API response: 200
   [DASHBOARD] User role: user
   [DASHBOARD] Regular user, staying on dashboard
   ```
5. **Expected Result**:
   - ✅ You stay on `/dashboard`
   - ✅ You see the user dashboard with stats
   - ✅ URL remains `http://localhost:3000/dashboard`

**Terminal Logs to Check**:

```
GET /dashboard 200 in XXXms
GET /api/user/role 200 in XXXms
```

---

### Test 2: Super Admin Sign-In

**Goal**: Verify admins are redirected to `/admin`

**Steps**:

1. Sign out from previous test
2. Clear browser console
3. Go to `http://localhost:3000/sign-in`
4. Sign in with super admin credentials
5. **Watch the console for these logs**:
   ```
   [DASHBOARD] Role check useEffect triggered {isLoaded: true, isSignedIn: true}
   [DASHBOARD] Fetching user role...
   [DASHBOARD] Role API response: 200
   [DASHBOARD] User role: superadmin
   [DASHBOARD] Admin detected, redirecting to /admin
   ```
6. Then you should see:
   ```
   [ADMIN] Role check useEffect triggered {isLoaded: true, isSignedIn: true}
   [ADMIN] Fetching user role...
   [ADMIN] Role API response: 200
   [ADMIN] User role: superadmin
   [ADMIN] Admin user confirmed, staying on admin page
   ```
7. **Expected Result**:
   - ✅ You're redirected from `/dashboard` to `/admin`
   - ✅ You see the admin dashboard with statistics
   - ✅ URL changes to `http://localhost:3000/admin`

**Terminal Logs to Check**:

```
GET /dashboard 200 in XXXms
GET /api/user/role 200 in XXXms
GET /admin 200 in XXXms
GET /api/user/role 200 in XXXms
GET /api/admin/stats 200 in XXXms
```

---

### Test 3: Regular User Tries to Access Admin

**Goal**: Verify unauthorized users are blocked from `/admin`

**Steps**:

1. Sign in as regular user
2. Clear browser console
3. Manually type in browser: `http://localhost:3000/admin`
4. **Watch the console for these logs**:
   ```
   [ADMIN] Role check useEffect triggered {isLoaded: true, isSignedIn: true}
   [ADMIN] Fetching user role...
   [ADMIN] Role API response: 200
   [ADMIN] User role: user
   [ADMIN] Non-admin detected, redirecting to /dashboard
   ```
5. **Expected Result**:
   - ✅ You're redirected back to `/dashboard`
   - ✅ You see the user dashboard (not admin dashboard)
   - ✅ URL changes back to `http://localhost:3000/dashboard`

**Terminal Logs to Check**:

```
GET /admin 200 in XXXms
GET /api/user/role 200 in XXXms
GET /dashboard 200 in XXXms
```

---

### Test 4: Admin Accessing User Dashboard

**Goal**: Verify admins are redirected to their admin dashboard

**Steps**:

1. Sign in as super admin
2. Clear browser console
3. Manually type in browser: `http://localhost:3000/dashboard`
4. **Watch the console for these logs**:
   ```
   [DASHBOARD] Role check useEffect triggered {isLoaded: true, isSignedIn: true}
   [DASHBOARD] Fetching user role...
   [DASHBOARD] Role API response: 200
   [DASHBOARD] User role: superadmin
   [DASHBOARD] Admin detected, redirecting to /admin
   ```
5. **Expected Result**:
   - ✅ You're redirected from `/dashboard` to `/admin`
   - ✅ You see the admin dashboard
   - ✅ URL changes to `http://localhost:3000/admin`

---

## 🐛 Troubleshooting

### Issue: No console logs appear

**Possible Causes**:

1. Console is not showing logs from the correct source
2. JavaScript is disabled
3. Page didn't fully load

**Solutions**:

- Make sure "Preserve log" is checked in console
- Refresh the page (F5)
- Check if any errors appear in console
- Verify the dev server is running

---

### Issue: Role API returns 401

**Console shows**:

```
[DASHBOARD] Role API response: 401
```

**Possible Causes**:

1. User is not fully authenticated yet
2. Clerk session not established

**Solutions**:

- Wait a few seconds and refresh the page
- Sign out and sign in again
- Check terminal for `[SYNC] User sync started` logs
- Verify MongoDB connection is successful

---

### Issue: Infinite redirect loop

**Console shows**:

```
[DASHBOARD] Admin detected, redirecting to /admin
[ADMIN] Non-admin detected, redirecting to /dashboard
[DASHBOARD] Admin detected, redirecting to /admin
...
```

**This should NOT happen**, but if it does:

**Solutions**:

1. Check the `/api/user/role` response in Network tab
2. Verify user role in MongoDB database
3. Clear browser cache and cookies
4. Sign out completely and sign in again

---

### Issue: Loading spinner never disappears

**Console shows**:

```
[DASHBOARD] Waiting for auth to load...
```

**Possible Causes**:

1. Clerk is not loading properly
2. Network issue

**Solutions**:

- Check if Clerk keys are set in `.env.local`
- Verify internet connection
- Check for CORS errors in console
- Restart the dev server

---

## 📊 What to Look For

### In Browser Console

✅ **Good Signs**:

- `[DASHBOARD] Role check useEffect triggered`
- `[DASHBOARD] Fetching user role...`
- `[DASHBOARD] User role: user` or `superadmin`
- Role-appropriate redirect message
- No errors

❌ **Bad Signs**:

- No logs at all
- 401 or 500 errors
- JavaScript errors
- "Waiting for auth to load..." stuck forever

### In Terminal

✅ **Good Signs**:

```
GET /dashboard 200 in XXXms
GET /api/user/role 200 in XXXms
[2025-10-15T...] INFO: MongoDB connected successfully
```

❌ **Bad Signs**:

```
GET /api/user/role 401 in XXXms
GET /api/user/role 500 in XXXms
[SYNC] Unauthorized - no clerk user
MongoDB connection errors
```

---

## 🎯 Success Criteria

All tests pass if:

1. ✅ Regular users stay on `/dashboard` after sign-in
2. ✅ Admins are redirected to `/admin` after sign-in
3. ✅ Regular users cannot access `/admin` (redirected away)
4. ✅ Admins accessing `/dashboard` are redirected to `/admin`
5. ✅ No console errors
6. ✅ All API calls return 200 status
7. ✅ Console logs show correct role detection
8. ✅ Loading spinner appears briefly then disappears

---

## 📝 Testing Checklist

Use this checklist while testing:

- [ ] Dev server is running
- [ ] Browser console is open
- [ ] Test 1: Regular user sign-in ✅
- [ ] Test 2: Super admin sign-in ✅
- [ ] Test 3: User tries admin page ✅
- [ ] Test 4: Admin tries user page ✅
- [ ] No console errors ✅
- [ ] No terminal errors ✅
- [ ] Loading spinner works ✅
- [ ] Redirects are instant ✅

---

## 🔍 Debug Checklist

If something doesn't work:

- [ ] Check browser console for logs
- [ ] Check terminal for API calls
- [ ] Verify user role in console log
- [ ] Check Network tab for API responses
- [ ] Verify MongoDB connection in terminal
- [ ] Check if user exists in database
- [ ] Try signing out and back in
- [ ] Try different browser/incognito mode
- [ ] Clear browser cache
- [ ] Restart dev server

---

## 📞 Report Format

If you encounter issues, report in this format:

**Test**: [Test number and name]
**User**: [Regular user / Super admin]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Logs**: [Copy paste relevant logs]
**Terminal Logs**: [Copy paste relevant logs]
**Screenshots**: [If applicable]

---

**Last Updated**: October 15, 2025
**Status**: Ready for testing with enhanced debugging
