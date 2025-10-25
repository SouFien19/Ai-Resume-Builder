// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";

// This legacy route now redirects to the new, improved wizard at /dashboard/resumes/create
// We preserve any incoming query parameters (e.g., templateId, role, seniority) in the redirect.
export default function CreateResumeRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const qs = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        for (const v of value) qs.append(key, v);
      } else if (value !== undefined) {
        qs.set(key, value);
      }
    }
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/dashboard/resumes/create${suffix}`);
}

