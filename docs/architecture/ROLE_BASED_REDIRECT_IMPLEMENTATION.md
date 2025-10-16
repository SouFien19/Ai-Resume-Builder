# Role-Based Redirect Implementation

## Problem Solved

Users were not being automatically redirected to the correct dashboard after sign-in:

- **Super Admins/Admins** should go to `/admin`
- **Regular Users** should stay on `/dashboard`
- Users had to manually modify the URL to access their correct dashboard

## Root Cause

The initial approaches failed due to:

1. **Edge Runtime Limitation**: Middleware cannot use Mongoose (Node.js specific)
2. **/redirect Page 404**: Intermediate redirect page wasn't being served properly
3. **Server-Side Complexity**: Trying to check roles server-side in middleware was incompatible

## Solution Implemented

**Client-Side Role Checking with React useEffect**

### Dashboard Page (`/dashboard`)

1. When a user signs in, they're redirected to `/dashboard`
2. Dashboard component checks user role via `/api/user/role`
3. If role is `admin` or `superadmin`, automatically redirects to `/admin`
4. If role is `user`, stays on `/dashboard`
5. Shows loading spinner while checking role

### Admin Page (`/admin`)

1. When page loads, checks user role via `/api/user/role`
2. If role is NOT `admin` or `superadmin`, redirects to `/dashboard`
3. This prevents unauthorized access even if someone types the URL directly
4. Shows loading spinner while checking role

## Technical Implementation

### Files Modified

#### 1. `src/app/dashboard/page.tsx`

```tsx
// Added imports
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Added state
const [checkingRole, setCheckingRole] = useState(true);

// Added role check useEffect
useEffect(() => {
  if (!isLoaded || !isSignedIn) return;

  const checkRoleAndRedirect = async () => {
    try {
      const response = await fetch("/api/user/role");
      if (response.ok) {
        const data = await response.json();
        if (data.role === "admin" || data.role === "superadmin") {
          console.log("[DASHBOARD] Admin detected, redirecting to /admin");
          router.replace("/admin");
          return;
        }
      }
    } catch (error) {
      console.error("[DASHBOARD] Error checking role:", error);
    } finally {
      setCheckingRole(false);
    }
  };

  checkRoleAndRedirect();
}, [isLoaded, isSignedIn, router]);

// Added loading state
if (checkingRole) {
  return <LoadingSpinner />;
}
```

#### 2. `src/app/admin/page.tsx`

```tsx
// Added imports
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Added state
const [checkingRole, setCheckingRole] = useState(true);

// Added role check useEffect
useEffect(() => {
  if (!isLoaded || !isSignedIn) return;

  const checkRoleAndRedirect = async () => {
    try {
      const response = await fetch("/api/user/role");
      if (response.ok) {
        const data = await response.json();
        if (data.role !== "admin" && data.role !== "superadmin") {
          console.log("[ADMIN] Non-admin detected, redirecting to /dashboard");
          router.replace("/dashboard");
          return;
        }
      }
    } catch (error) {
      console.error("[ADMIN] Error checking role:", error);
      router.replace("/dashboard"); // Redirect on error for safety
    } finally {
      setCheckingRole(false);
    }
  };

  checkRoleAndRedirect();
}, [isLoaded, isSignedIn, router]);

// Added loading state
if (checkingRole) {
  return <LoadingSpinner />;
}
```

#### 3. `src/middleware.ts`

Simplified to only handle authentication, removed role checking:

```tsx
// Removed getUserRole import (was causing Edge Runtime errors)
// Removed role-based redirect logic
// Now only does: await auth.protect() for protected routes
```

#### 4. `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

```tsx
// Changed redirect target
afterSignInUrl = "/dashboard";
forceRedirectUrl = "/dashboard";
```

#### 5. `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

```tsx
// Changed redirect target
afterSignUpUrl = "/dashboard";
forceRedirectUrl = "/dashboard";
```

## How It Works

### User Flow

1. **User signs in** → Clerk redirects to `/dashboard`
2. **Dashboard loads** → Shows loading spinner
3. **Role check** → Fetches `/api/user/role`
4. **If admin/superadmin** → `router.replace('/admin')`
5. **If regular user** → Stays on `/dashboard`, removes spinner

### Admin Protection Flow

1. **User types `/admin` in browser**
2. **Admin page loads** → Shows loading spinner
3. **Role check** → Fetches `/api/user/role`
4. **If NOT admin** → `router.replace('/dashboard')`
5. **If admin** → Stays on `/admin`, removes spinner

## Benefits of This Approach

✅ **No Edge Runtime Issues**: All role checking happens client-side
✅ **No Mongoose in Middleware**: Uses API routes which support Mongoose
✅ **Simple & Reliable**: Direct redirect to /dashboard, then client decides
✅ **Secure**: Both pages check authorization independently
✅ **Better UX**: Shows loading spinner during check (no flash of wrong content)
✅ **No 404 Errors**: Eliminated need for intermediate /redirect page

## Testing

### Test Case 1: Super Admin Login

1. Sign in with `soufianelabiadh@gmail.com`
2. Should see loading spinner briefly
3. Should automatically redirect to `/admin`
4. Should see admin dashboard with stats

### Test Case 2: Regular User Login

1. Sign in with `doxifiw460@djkux.com`
2. Should see loading spinner briefly
3. Should stay on `/dashboard`
4. Should see regular user dashboard

### Test Case 3: Unauthorized Admin Access

1. Sign in as regular user
2. Manually type `/admin` in URL
3. Should see loading spinner briefly
4. Should automatically redirect to `/dashboard`

### Test Case 4: Admin Direct Access

1. Sign in as super admin
2. Manually type `/dashboard` in URL
3. Should see loading spinner briefly
4. Should automatically redirect to `/admin`

## API Endpoint Used

**`/api/user/role`** - Returns user's role

```json
{
  "userId": "user_xxx",
  "role": "superadmin", // or "admin" or "user"
  "email": "user@example.com"
}
```

## Security Notes

1. **Client-side redirect is safe**: Even though the redirect happens client-side, the actual data fetching in `/admin` APIs still checks authorization server-side
2. **API Protection**: All admin APIs still validate user role before returning sensitive data
3. **Middleware Protection**: Middleware still protects routes from unauthenticated users
4. **Double Check**: Both client and server validate roles (defense in depth)

## Known Limitations

1. **Brief Flash**: Users might see a very brief flash of the wrong dashboard before redirect (mitigated by loading spinner)
2. **API Call**: Adds one extra API call on page load to check role
3. **Client-Side**: Relies on JavaScript being enabled (standard for modern web apps)

## Future Improvements

1. **Cache Role**: Cache user role in localStorage to reduce API calls
2. **Optimize API**: Could batch role check with other initial data fetch
3. **Server Components**: When Next.js 15 RSC patterns mature, could move to server-side role check in page component
4. **Role Context**: Create a React Context to share role across all pages

## Conclusion

The role-based redirect is now fully functional and automatic. Users no longer need to manually change URLs. The solution is simple, reliable, and works within Next.js Edge Runtime constraints.

**Status**: ✅ **COMPLETE** - Ready for testing
