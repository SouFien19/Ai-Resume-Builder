/**
 * Resume API Routes
 * Handles CRUD operations for resumes with validation and security
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";
import { handleAPIError, APIErrors } from "@/lib/api/error-handler";
import { successResponse, createdResponse } from "@/lib/api/response";
import { CreateResumeSchema } from "@/lib/validation/schemas";
import { sanitizeInput } from "@/lib/validation/sanitizers";
import { logger } from "@/lib/logger";
import { getCache, setCache, deleteCache, CacheKeys } from "@/lib/redis";
import { analytics } from "@/lib/analytics/posthog";

/**
 * GET /api/resumes
 * Fetch all resumes for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId }).select('_id');

    if (!user) {
      // User not in local DB yet (webhook pending)
      return successResponse([]);
    }

    // Try Redis cache first (2-minute cache per user)
    const cacheKey = CacheKeys.resumes.user(user._id.toString());
    const cached = await getCache<any[]>(cacheKey);
    
    if (cached) {
      console.log('[Resumes API] ✅ Returned from cache (fast!)');
      return successResponse(cached, {
        'X-Cache': 'HIT',
        'X-Cache-Key': cacheKey
      });
    }
    
    console.log('[Resumes API] ⚠️ Cache MISS - fetching from database (slow)');

    const resumes = await Resume.find({ userId: user._id })
      .select('-__v') // Exclude version key
      .sort({ updatedAt: -1 })
      .lean(); // Return plain objects for better performance

    logger.info('Resumes fetched', {
      userId: user._id,
      count: resumes.length,
    });

    // Cache for 2 minutes (120 seconds)
    await setCache(cacheKey, resumes, 120);
    console.log('[Resumes API] ✅ Cached resume list for 2 minutes');

    return successResponse(resumes, {
      'X-Cache': 'MISS',
      'X-Cache-Key': cacheKey
    });
  } catch (error) {
    logger.error('Error fetching resumes', { error });
    return handleAPIError(error);
  }
}

/**
 * POST /api/resumes
 * Create a new resume with validation
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    await dbConnect();

    // Get or create user
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // Fetch user details from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      
      const primaryEmail =
        clerkUser.emailAddresses?.find(
          (e: { id: string; emailAddress: string }) =>
            e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

      user = new User({
        clerkId: userId,
        email: primaryEmail || `clerk-user-${userId}@placeholder.com`,
        name: sanitizeInput(clerkUser.firstName || clerkUser.username || ""),
      });
      
      await user.save();
      
      logger.info('User created from Clerk data', {
        userId: user._id,
        clerkId: userId,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    
    logger.debug('Resume creation request', {
      userId: user._id,
      hasName: !!body.name || !!body.title,
      hasTemplateId: !!body.templateId,
    });

    // Support both 'name' and 'title' fields for backward compatibility
    // Schema expects 'title' (required) and 'name' (optional)
    const normalizedBody = {
      title: body.title || body.name, // Title is required by schema
      name: body.name, // Optional in schema
      templateId: body.templateId,
      content: body.content || body.data || {}, // Schema expects 'content', not 'data'
      data: body.data || body.content || {}, // Keep for backward compatibility
    };

    // Validate with Zod
    const validatedData = CreateResumeSchema.parse(normalizedBody);

    // Use title (required) or name (optional) for the resume name, ensuring it remains user-friendly
    let baseName = sanitizeInput(validatedData.name || validatedData.title || '').trim();
    if (!baseName) {
      baseName = 'Untitled Resume';
    }

    let finalResumeName = baseName;

    // Handle duplicates deterministically by appending enumerated suffixes
    if (await Resume.exists({ userId: user._id, name: finalResumeName })) {
      let suffix = 2;
      let candidateName = `${baseName} (${suffix})`;

      // Increment suffix until we find an available name
      // Limit loop to a reasonable number to avoid infinite loops in pathological cases
      while (suffix < 1000 && await Resume.exists({ userId: user._id, name: candidateName })) {
        suffix += 1;
        candidateName = `${baseName} (${suffix})`;
      }

      finalResumeName = candidateName;
    }

    // Create resume - use content if present, otherwise data
    const newResume = new Resume({
      name: finalResumeName,
      userId: user._id,
      templateId: validatedData.templateId || 'azurill',
      data: validatedData.content || validatedData.data || {},
    });

    await newResume.save();

    // Invalidate resume list cache for this user
    const cacheKey = CacheKeys.resumes.user(user._id.toString());
    await deleteCache(cacheKey);
    console.log('[Resumes API] 🗑️ Invalidated cache after resume creation');

    // Track resume creation in analytics
    analytics.resumeSaved(newResume._id.toString(), true);
    analytics.templateSelected(newResume.templateId);

    logger.info('Resume created', {
      resumeId: newResume._id,
      userId: user._id,
      name: finalResumeName,
      templateId: newResume.templateId,
    });

    return createdResponse(newResume);
  } catch (error) {
    logger.error('Error creating resume', { error });
    return handleAPIError(error);
  }
}
