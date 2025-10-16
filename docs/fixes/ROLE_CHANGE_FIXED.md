# 🔧 Role Change Issues - FIXED!

## ❌ What Was Wrong:

### Issue 1: Webhook Wasn't Syncing Roles

**Problem**: When you changed role in Clerk Dashboard, the webhook updated MongoDB but **didn't sync the role**.

**Why**: The webhook was only updating basic profile info (name, email, photo), not the role from `public_metadata`.

### Issue 2: JWT Token Cache

**Problem**: Even after changing role, you were still redirected to /dashboard.

**Why**: Clerk caches JWT tokens in your browser. The old token still had `role: "user"`.

---

## ✅ What I Fixed:

### 1. Updated Webhook to Sync Roles

**File**: `src/app/api/webhooks/clerk/route.ts`

**Before**:

```typescript
case 'user.updated': {
  await User.findOneAndUpdate(
    { clerkId: id },
    {
      email: email_addresses[0]?.email_address,
      // ... other fields
      // ❌ Role NOT synced
    }
  );
}
```

**After**:

```typescript
case 'user.updated': {
  const roleFromClerk = (public_metadata as any)?.role || 'user';

  await User.findOneAndUpdate(
    { clerkId: id },
    {
      email: email_addresses[0]?.email_address,
      role: roleFromClerk, // ✅ Role NOW synced
      // ... other fields
    }
  );

  console.log(`[WEBHOOK] ✅ User updated: ${id} (role: ${roleFromClerk})`);
}
```

---

## 🎯 What You Need to Do NOW:

### Step 1: Sign Out Completely ⚠️

**IMPORTANT**: You must sign out to clear the old JWT token!

1. Click your profile picture
2. Click **Sign Out**
3. Wait for redirect to sign-in page

### Step 2: Sign Back In

1. Sign in with your account
2. This will fetch a NEW JWT token with `role: "superadmin"`

### Step 3: Check Where You're Redirected

**Expected Result**: Should go to **/admin** (not /dashboard)

**If it works**: ✅ You'll see:

```
[MIDDLEWARE] 🔄 Redirecting logged-in superadmin from auth page to /admin
```

---

## 🧪 How to Verify Role is Updated:

### Check Terminal Logs:

After changing role in Clerk, you should see:

```
[WEBHOOK] 📨 Received event: user.updated
[WEBHOOK] ✅ User updated: user_xxx (role: superadmin)
```

### Check MongoDB:

1. Open MongoDB Compass
2. Find your user document
3. Should now show: `"role": "superadmin"`

### Check JWT:

After signing in, open DevTools console and run:

```javascript
// This will show your JWT token data
await fetch("/api/user/role").then((r) => r.json());
```

Should return:

```json
{
  "success": true,
  "role": "superadmin",
  "redirectUrl": "/admin"
}
```

---

## 🔍 Understanding JWT Token Caching:

### Why Sign Out is Required:

```
┌─────────────────────────────────────────────┐
│  Before: Old JWT Token                      │
│  {                                          │
│    "userId": "user_xxx",                    │
│    "metadata": {                            │
│      "role": "user"  ← OLD VALUE           │
│    }                                        │
│  }                                          │
└─────────────────────────────────────────────┘
                    ↓
         Change role in Clerk Dashboard
                    ↓
         Webhook updates MongoDB ✅
                    ↓
         BUT: Browser still has old JWT ❌
                    ↓
         Must sign out to clear cache
                    ↓
         Sign back in = New JWT fetched
                    ↓
┌─────────────────────────────────────────────┐
│  After: New JWT Token                       │
│  {                                          │
│    "userId": "user_xxx",                    │
│    "metadata": {                            │
│      "role": "superadmin"  ← NEW VALUE ✅  │
│    }                                        │
│  }                                          │
└─────────────────────────────────────────────┘
```

---

## 📊 What Should Happen Now:

### Scenario 1: Change Role in Clerk Dashboard

```
1. You change: user → superadmin in Clerk
2. Clerk sends webhook → Your server
3. Webhook syncs role to MongoDB ✅
4. You sign out (clears JWT cache)
5. You sign in (gets new JWT with superadmin)
6. Middleware redirects to /admin ✅
```

### Scenario 2: Change Role in MongoDB (NOT RECOMMENDED)

```
1. You change: user → superadmin in MongoDB
2. Nothing happens (Clerk doesn't know) ❌
3. JWT still has old role
4. Need to run migration script to sync to Clerk
5. Then sign out/in to refresh JWT
```

**ALWAYS change role in Clerk Dashboard** (it's the source of truth for JWT).

---

## 🎯 Quick Checklist:

- [ ] Webhook updated to sync roles ✅ (already done)
- [ ] Changed role to "superadmin" in Clerk Dashboard
- [ ] Signed out completely from app
- [ ] Signed back in
- [ ] Check terminal logs for webhook confirmation
- [ ] Check redirect goes to /admin (not /dashboard)

---

## 🆘 Troubleshooting:

### Still Redirected to /dashboard?

1. **Hard refresh**: Ctrl+Shift+R
2. **Clear cookies**: DevTools → Application → Cookies → Delete all for localhost:3000
3. **Incognito mode**: Try signing in there
4. **Check JWT**: Run `await fetch('/api/user/role').then(r => r.json())` in console

### Role Not in MongoDB?

Check terminal after changing role in Clerk - should see:

```
[WEBHOOK] 📨 Received event: user.updated
[WEBHOOK] ✅ User updated: user_xxx (role: superadmin)
```

If you DON'T see this:

- Check ngrok is still running
- Check webhook URL in Clerk Dashboard is correct
- Check CLERK_WEBHOOK_SECRET is in .env.local

### Can't Access /admin?

Check middleware logs in terminal:

```
[MIDDLEWARE] ⚠️ Non-admin user xxx tried to access /admin
```

If you see this, your JWT doesn't have the superadmin role yet. Sign out and back in.

---

## 🚀 Next Steps:

1. **Sign out now** (clear JWT cache)
2. **Sign back in** (get new JWT)
3. **Report back**: Where did it redirect you?

If it goes to /admin → Success! 🎉
If it goes to /dashboard → Check troubleshooting steps above.

---

**Current Status**: Webhook fixed, ready to test! Just need to sign out/in! 🔑
