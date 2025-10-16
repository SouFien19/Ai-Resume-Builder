/**
 * Custom Sign-In Handler
 * Provides role-aware redirect logic for faster auth flow
 */

"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useSmartRedirect() {
  const { isLoaded, userId, sessionClaims } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    // Get role from session claims
    const role = (sessionClaims?.metadata as any)?.role || 'user';
    
    // Determine destination
    const destination = (role === 'admin' || role === 'superadmin') ? '/admin' : '/dashboard';
    
    // Immediate redirect
    router.replace(destination);
  }, [isLoaded, userId, sessionClaims, router]);
}
