# 🎯 Role-Based Auto-Redirect Implementation

## ✅ What Was Implemented

Automatic role-based redirection that sends users to the correct dashboard after sign-in/sign-up:

- **👑 Super Admin** → `/admin`
- **🛡️ Admin** → `/admin`
- **👤 Regular User** → `/dashboard`

---

## 🔄 How It Works

### 1. **Sign-In/Sign-Up Flow**

After successful authentication, users are redirected to `/redirect` page:

```tsx
// Sign-In Component
<SignIn
  afterSignInUrl="/redirect"
  forceRedirectUrl="/redirect"
/>

// Sign-Up Component
<SignUp
  afterSignUpUrl="/redirect"
  forceRedirectUrl="/redirect"
/>
```

### 2. **Redirect Page (`/redirect`)**

The redirect page:

1. ✅ Syncs user to MongoDB (calls `/api/sync-user`)
2. ✅ Fetches user role (calls `/api/user/role`)
3. ✅ Redirects based on role:
   - `superadmin` or `admin` → `/admin`
   - `user` → `/dashboard`

### 3. **Middleware Protection**

The middleware enforces role-based access:

```typescript
// Redirect admins trying to access /dashboard → /admin
if (
  (role === "admin" || role === "superadmin") &&
  url.pathname.startsWith("/dashboard")
) {
  return NextResponse.redirect(new URL("/admin", req.url));
}

// Redirect users trying to access /admin → /dashboard
if (role === "user" && url.pathname.startsWith("/admin")) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

---

## 📋 User Experience

### For Regular Users:

1. Sign up/Sign in
2. See loading screen: "Setting up your dashboard... 👤 User"
3. Automatically redirected to `/dashboard`
4. If they try to access `/admin`, middleware redirects them back to `/dashboard`

### For Admins/Super Admins:

1. Sign up/Sign in
2. See loading screen: "Setting up your dashboard... 👑 Super Admin"
3. Automatically redirected to `/admin`
4. If they try to access `/dashboard`, middleware redirects them to `/admin`
5. See 👑 crown icon in sidebar
6. Have full admin panel access

---

## 🛠️ Files Modified

1. **`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`**

   - Added `afterSignInUrl="/redirect"`
   - Added `forceRedirectUrl="/redirect"`

2. **`src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`**

   - Added `afterSignUpUrl="/redirect"`
   - Added `forceRedirectUrl="/redirect"`

3. **`src/components/auth/RoleBasedRedirect.tsx`**

   - Enhanced to sync user first
   - Fetches role from API
   - Shows loading state with role badge
   - Redirects based on role

4. **`src/middleware.ts`**
   - Added role-based redirection logic
   - Prevents admins from accessing `/dashboard`
   - Prevents users from accessing `/admin`
   - Allows `/redirect` route for authentication

---

## 🧪 Testing

### Test as Regular User:

```bash
# 1. Create a new account
# 2. Should see "Setting up your dashboard... 👤 User"
# 3. Should land on /dashboard
# 4. Try accessing /admin → Should redirect back to /dashboard
```

### Test as Super Admin:

```bash
# 1. Sign in with: soufianelabiadh@gmail.com
# 2. Should see "Setting up your dashboard... 👑 Super Admin"
# 3. Should land on /admin
# 4. Should see crown icon in sidebar
# 5. Try accessing /dashboard → Should redirect to /admin
```

---

## 🔍 Troubleshooting

### Issue: Stuck on redirect page

**Solution**: Check browser console for errors. The sync or role API might be failing.

### Issue: Wrong dashboard after login

**Solution**: Check user role in database:

```bash
node scripts/list-users.js
```

### Issue: Redirect loop

**Solution**: Clear browser cookies and cache, then try again.

---

## 📊 Flow Diagram

```
┌─────────────┐
│  Sign In/Up │
└──────┬──────┘
       │
       v
┌─────────────┐
│  /redirect  │ ← Landing page after auth
└──────┬──────┘
       │
       v
┌──────────────────┐
│ Sync to MongoDB  │ ← POST /api/sync-user
└──────┬───────────┘
       │
       v
┌──────────────────┐
│  Fetch Role      │ ← GET /api/user/role
└──────┬───────────┘
       │
       v
    ┌──┴──┐
    │ Role?│
    └──┬──┘
       │
   ┌───┴───┐
   │       │
   v       v
┌─────┐ ┌──────┐
│Admin│ │ User │
│     │ │      │
│/admin│ │/dash │
└─────┘ └──────┘
```

---

## ✅ Benefits

1. **Seamless UX** - Users automatically land on the correct dashboard
2. **Security** - Middleware enforces role-based access
3. **No Manual Navigation** - No need to remember which URL to visit
4. **Instant Sync** - User data synced to MongoDB immediately after auth
5. **Visual Feedback** - Loading screen shows role with appropriate icon

---

## 🎓 How to Promote Users to Admin

```bash
# Promote to super admin
node scripts/direct-promote.js user@email.com

# Or use the setup script
node scripts/setup-superadmin.js user@email.com

# Verify in database
node scripts/list-users.js
```

After promotion, user needs to:

1. Sign out
2. Sign in again
3. Will be automatically redirected to `/admin`

---

**Note**: First-time sign-ups default to `role: 'user'`. Admins must be manually promoted using the scripts above.
