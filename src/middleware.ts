import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  
  // Allow public routes (including webhooks)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Require authentication for all other routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    // Only set redirect_url if it's not a dashboard route (let middleware handle role-based routing)
    const shouldSetRedirect = !req.url.includes('/dashboard') && !req.url.includes('/admin');
    if (shouldSetRedirect) {
      signInUrl.searchParams.set('redirect_url', req.url);
    }
    return NextResponse.redirect(signInUrl);
  }
  
  // Get role from JWT metadata (FAST - no DB query!)
  const role = (sessionClaims?.metadata as any)?.role || 'user';
  
  // Admin route protection
  if (isAdminRoute(req)) {
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  // Redirect logged-in users from auth pages to their appropriate dashboard
  if (isAuthRoute(req)) {
    const dashboardUrl = (role === 'admin' || role === 'superadmin') 
      ? '/admin' 
      : '/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }
  
  // Admins accessing regular dashboard should go to admin dashboard (INSTANT redirect)
  if (isDashboardRoute(req) && (role === 'admin' || role === 'superadmin')) {
    // Use 307 (Temporary Redirect) for instant redirect
    const response = NextResponse.redirect(new URL('/admin', req.url), 307);
    // Add cache headers to speed up subsequent redirects
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
