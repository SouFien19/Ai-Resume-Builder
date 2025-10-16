/**
 * Resume API Routes - Individual Resume Operations
 * Handles GET, PUT, DELETE for specific resumes
 */

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";
import { handleAPIError, APIErrors } from "@/lib/api/error-handler";
import { successResponse, noContentResponse } from "@/lib/api/response";
import { UpdateResumeSchema } from "@/lib/validation/schemas";
import { sanitizeInput, sanitizeObject, sanitizeObjectId } from "@/lib/validation/sanitizers";
import { logger } from "@/lib/logger";
import { deleteCache, deleteCacheMultiple, CacheKeys } from "@/lib/redis";
import { analytics } from "@/lib/analytics/posthog";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const pruneValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => pruneValue(item))
      .filter((item) => {
        if (item === undefined) return false;
        if (isObject(item)) {
          return Object.keys(item).length > 0;
        }
        if (Array.isArray(item)) {
          return item.length > 0;
        }
        return true;
      });

    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (isObject(value)) {
    const cleanedEntries = Object.entries(value).reduce<Record<string, unknown>>((acc, [key, val]) => {
      const cleanedVal = pruneValue(val);
      if (cleanedVal !== undefined) {
        acc[key] = cleanedVal;
      }
      return acc;
    }, {});

    return Object.keys(cleanedEntries).length > 0 ? cleanedEntries : undefined;
  }

  return value ?? undefined;
};

const pruneResumeContent = (content: unknown): Record<string, unknown> | undefined => {
  const cleaned = pruneValue(content);
  return isObject(cleaned) ? cleaned : undefined;
};

/**
 * GET /api/resumes/[id]
 * Fetch a single resume by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    const resolvedParams = await params;
    const resumeId = sanitizeObjectId(resolvedParams.id);

    logger.debug('🔍 GET Resume Request', {
      requestedId: resolvedParams.id,
      sanitizedId: resumeId,
      clerkUserId: userId,
    });

    if (!resumeId) {
      throw APIErrors.BadRequest('Invalid resume ID format');
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId }).select('_id');
    if (!user) {
      throw APIErrors.NotFound('User not found');
    }

    logger.debug('👤 User found', {
      userId: user._id,
      clerkId: userId,
    });

    // First, check if resume exists at all
    const resumeExists = await Resume.findOne({ _id: resumeId }).select('_id userId');
    
    if (resumeExists) {
      logger.debug('📄 Resume exists in DB', {
        resumeId: resumeExists._id,
        resumeUserId: resumeExists.userId,
        currentUserId: user._id,
        ownershipMatch: resumeExists.userId.toString() === user._id.toString(),
      });
      
      if (resumeExists.userId.toString() !== user._id.toString()) {
        logger.warn('⚠️ Resume belongs to different user', {
          resumeUserId: resumeExists.userId,
          currentUserId: user._id,
        });
        throw APIErrors.NotFound('Resume not found');
      }
    } else {
      logger.warn('❌ Resume not found in database', {
        resumeId,
      });
      
      // List all resumes for this user to help debug
      const userResumes = await Resume.find({ userId: user._id })
        .select('_id name createdAt')
        .limit(5)
        .sort({ createdAt: -1 });
      
      logger.debug('📋 User\'s recent resumes', {
        count: userResumes.length,
        resumes: userResumes.map(r => ({
          id: r._id,
          name: r.name,
          createdAt: r.createdAt,
        })),
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: user._id,
    })
      .select('-__v')
      .lean();

    if (!resume) {
      throw APIErrors.NotFound('Resume not found');
    }

    logger.debug('Resume fetched', {
      resumeId,
      userId: user._id,
    });

    return successResponse(resume);
  } catch (error) {
    logger.error('Error fetching resume', { error });
    return handleAPIError(error);
  }
}

/**
 * PUT /api/resumes/[id]
 * Update a resume by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    const resolvedParams = await params;
    const resumeId = sanitizeObjectId(resolvedParams.id);

    if (!resumeId) {
      throw APIErrors.BadRequest('Invalid resume ID format');
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId }).select('_id');
    if (!user) {
      throw APIErrors.NotFound('User not found');
    }

    // Verify resume ownership
    const existingResume = await Resume.findOne({
      _id: resumeId,
      userId: user._id,
    });

    if (!existingResume) {
      throw APIErrors.NotFound('Resume not found');
    }

    // Parse and validate request body
    const body = await request.json();

    // Support both 'name' and 'title' fields for backward compatibility
    const normalizedBody = {
      name: body.name,
      title: body.title,
      templateId: body.templateId,
      data: body.data,
      content: body.content,
    };

    // Validate with Zod (partial update)
    const validatedData = UpdateResumeSchema.parse(normalizedBody);

    // Build update object
    const update: Record<string, unknown> = {};

    const requestedName = validatedData.name ?? validatedData.title;

    if (requestedName !== undefined) {
      const sanitizedName = sanitizeInput(requestedName);

      // Check for duplicate name (excluding current resume)
      const duplicateResume = await Resume.findOne({
        userId: user._id,
        name: sanitizedName,
        _id: { $ne: resumeId },
      });

      if (duplicateResume) {
        throw APIErrors.Conflict('A resume with this name already exists');
      }

      update.name = sanitizedName;
    }

    if (validatedData.templateId !== undefined) {
      update.templateId = validatedData.templateId;
    }

    if (validatedData.data !== undefined) {
      const cleanedContent = pruneResumeContent(validatedData.data);
      update.data = cleanedContent ? sanitizeObject(cleanedContent) : {};
    } else if (validatedData.content !== undefined) {
      const cleanedContent = pruneResumeContent(validatedData.content);
      update.data = cleanedContent ? sanitizeObject(cleanedContent) : {};
    }

    update.updatedAt = new Date();

    const updatedResume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId: user._id },
      { $set: update },
      { new: true, runValidators: true }
    )
      .select('-__v')
      .lean();

    // Invalidate caches (both list and individual resume)
    await deleteCacheMultiple([
      CacheKeys.resumes.user(user._id.toString()),
      CacheKeys.resumes.byId(resumeId),
    ]);
    console.log('[Resumes API] 🗑️ Invalidated cache after resume update');

    // Track resume update in analytics
    analytics.resumeSaved(resumeId, false);
    if ('templateId' in update) {
      analytics.templateSelected(update.templateId as string);
    }

    logger.info('Resume updated', {
      resumeId,
      userId: user._id,
      fields: Object.keys(update),
    });

    return successResponse(updatedResume);
  } catch (error) {
    logger.error('Error updating resume', { error });
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/resumes/[id]
 * Delete a resume by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    const resolvedParams = await params;
    const resumeId = sanitizeObjectId(resolvedParams.id);

    if (!resumeId) {
      throw APIErrors.BadRequest('Invalid resume ID format');
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId }).select('_id');
    if (!user) {
      throw APIErrors.NotFound('User not found');
    }

    const deletedResume = await Resume.findOneAndDelete({
      _id: resumeId,
      userId: user._id,
    });

    if (!deletedResume) {
      throw APIErrors.NotFound('Resume not found');
    }

    // Invalidate caches (both list and individual resume)
    await deleteCacheMultiple([
      CacheKeys.resumes.user(user._id.toString()),
      CacheKeys.resumes.byId(resumeId),
    ]);
    console.log('[Resumes API] 🗑️ Invalidated cache after resume deletion');

    // Track resume deletion in analytics
    analytics.resumeDeleted(resumeId);

    logger.info('Resume deleted', {
      resumeId,
      userId: user._id,
      name: deletedResume.name,
    });

    return noContentResponse();
  } catch (error) {
    logger.error('Error deleting resume', { error });
    return handleAPIError(error);
  }
}

