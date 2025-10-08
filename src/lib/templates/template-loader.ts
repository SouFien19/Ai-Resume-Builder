/**
 * Template Loader Utility
 * Load and filter resume templates with metadata
 */

import {
  ResumeTemplate,
  TemplateFilters,
  TemplateStats,
  TemplateRegion,
  TemplateCategory,
} from "./template-types";

// List of all available template IDs
export const TEMPLATE_IDS = [
  "professional-modern",
  "creative-bold",
  "executive-classic",
  "minimalist-clean",
  "tech-minimal",
  "marketing-dynamic",
  "student-friendly",
  "consultant-strategy",
  "healthcare-professional",
  "academic-traditional",
  "corporate-classic",
  "sales-impact",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

/**
 * Load a single template by ID
 */
export async function loadTemplate(
  templateId: string
): Promise<ResumeTemplate> {
  try {
    const response = await fetch(`/templates/json/${templateId}.json`);
    if (!response.ok) {
      throw new Error(`Template ${templateId} not found`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading template ${templateId}:`, error);
    throw error;
  }
}

/**
 * Load all available templates
 */
export async function loadAllTemplates(): Promise<ResumeTemplate[]> {
  try {
    const templates = await Promise.all(
      TEMPLATE_IDS.map((id) => loadTemplate(id))
    );
    return templates;
  } catch (error) {
    console.error("Error loading templates:", error);
    return [];
  }
}

/**
 * Filter templates based on criteria
 */
export function filterTemplates(
  templates: ResumeTemplate[],
  filters: TemplateFilters
): ResumeTemplate[] {
  return templates.filter((template) => {
    const meta = template._metadata;

    // Region filter
    if (filters.region && filters.region !== "all") {
      if (meta.region !== filters.region && meta.region !== "international") {
        return false;
      }
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      if (meta.category !== filters.category) {
        return false;
      }
    }

    // Photo support filter
    if (filters.photoSupport !== undefined && filters.photoSupport !== "all") {
      if (meta.photo.supported !== filters.photoSupport) {
        return false;
      }
    }

    // Minimum ATS score filter
    if (filters.minAtsScore !== undefined && filters.minAtsScore > 0) {
      if (meta.atsScore < filters.minAtsScore) {
        return false;
      }
    }

    // Career level filter
    if (filters.careerLevel && filters.careerLevel !== "all") {
      if (!meta.careerLevel.includes(filters.careerLevel)) {
        return false;
      }
    }

    // Featured filter
    if (filters.featured !== undefined) {
      if (meta.featured !== filters.featured) {
        return false;
      }
    }

    // Premium filter
    if (filters.premium !== undefined) {
      if (meta.premium !== filters.premium) {
        return false;
      }
    }

    // Search filter (name, description, tags, bestFor)
    if (filters.search && filters.search.trim() !== "") {
      const searchLower = filters.search.toLowerCase();
      const matchesName = meta.name.toLowerCase().includes(searchLower);
      const matchesDescription = meta.description
        .toLowerCase()
        .includes(searchLower);
      const matchesTags = meta.tags.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );
      const matchesBestFor = meta.bestFor.some((job) =>
        job.toLowerCase().includes(searchLower)
      );
      const matchesIndustries = meta.industries.some((industry) =>
        industry.toLowerCase().includes(searchLower)
      );

      if (
        !matchesName &&
        !matchesDescription &&
        !matchesTags &&
        !matchesBestFor &&
        !matchesIndustries
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort templates by various criteria
 */
export function sortTemplates(
  templates: ResumeTemplate[],
  sortBy: "popularity" | "name" | "ats-score" | "newest" = "popularity"
): ResumeTemplate[] {
  const sorted = [...templates];

  switch (sortBy) {
    case "popularity":
      return sorted.sort(
        (a, b) => b._metadata.popularity - a._metadata.popularity
      );

    case "name":
      return sorted.sort((a, b) =>
        a._metadata.name.localeCompare(b._metadata.name)
      );

    case "ats-score":
      return sorted.sort((a, b) => b._metadata.atsScore - a._metadata.atsScore);

    case "newest":
      // Sort by version, then by popularity
      return sorted.sort((a, b) => {
        const versionCompare = b._metadata.version.localeCompare(
          a._metadata.version
        );
        if (versionCompare !== 0) return versionCompare;
        return b._metadata.popularity - a._metadata.popularity;
      });

    default:
      return sorted;
  }
}

/**
 * Get template statistics
 */
export function getTemplateStats(templates: ResumeTemplate[]): TemplateStats {
  const byRegion: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let totalAtsScore = 0;
  let featuredCount = 0;
  let premiumCount = 0;

  templates.forEach((template) => {
    const meta = template._metadata;

    // Count by region
    byRegion[meta.region] = (byRegion[meta.region] || 0) + 1;

    // Count by category
    byCategory[meta.category] = (byCategory[meta.category] || 0) + 1;

    // Sum ATS scores
    totalAtsScore += meta.atsScore;

    // Count featured
    if (meta.featured) featuredCount++;

    // Count premium
    if (meta.premium) premiumCount++;
  });

  return {
    totalTemplates: templates.length,
    byRegion: byRegion as Record<TemplateRegion, number>,
    byCategory: byCategory as Record<TemplateCategory, number>,
    avgAtsScore:
      templates.length > 0 ? Math.round(totalAtsScore / templates.length) : 0,
    featuredCount,
    premiumCount,
  };
}

/**
 * Get recommended templates for a user
 */
export function getRecommendedTemplates(
  templates: ResumeTemplate[],
  preferences: {
    jobTitle?: string;
    industry?: string;
    careerLevel?: string;
    region?: TemplateRegion;
  }
): ResumeTemplate[] {
  const scored = templates.map((template) => {
    let score = 0;
    const meta = template._metadata;

    // Match job title
    if (preferences.jobTitle) {
      const jobTitleLower = preferences.jobTitle.toLowerCase();
      if (
        meta.bestFor.some((job) => job.toLowerCase().includes(jobTitleLower))
      ) {
        score += 3;
      }
    }

    // Match industry
    if (preferences.industry) {
      const industryLower = preferences.industry.toLowerCase();
      if (
        meta.industries.some((ind) => ind.toLowerCase().includes(industryLower))
      ) {
        score += 2;
      }
    }

    // Match career level
    if (
      preferences.careerLevel &&
      meta.careerLevel.includes(preferences.careerLevel as any)
    ) {
      score += 2;
    }

    // Match region
    if (
      preferences.region &&
      (meta.region === preferences.region || meta.region === "international")
    ) {
      score += 1;
    }

    // Boost for featured
    if (meta.featured) {
      score += 1;
    }

    // Boost for high ATS score
    if (meta.atsScore >= 90) {
      score += 1;
    }

    return { template, score };
  });

  // Sort by score and return top templates
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 6).map((item) => item.template);
}

/**
 * Search templates by query
 */
export function searchTemplates(
  templates: ResumeTemplate[],
  query: string
): ResumeTemplate[] {
  if (!query || query.trim() === "") {
    return templates;
  }

  const queryLower = query.toLowerCase();

  return templates.filter((template) => {
    const meta = template._metadata;

    return (
      meta.name.toLowerCase().includes(queryLower) ||
      meta.description.toLowerCase().includes(queryLower) ||
      meta.tags.some((tag) => tag.toLowerCase().includes(queryLower)) ||
      meta.bestFor.some((job) => job.toLowerCase().includes(queryLower)) ||
      meta.industries.some((industry) =>
        industry.toLowerCase().includes(queryLower)
      ) ||
      meta.category.toLowerCase().includes(queryLower) ||
      meta.region.toLowerCase().includes(queryLower)
    );
  });
}
