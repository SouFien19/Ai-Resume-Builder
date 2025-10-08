import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import Template, { TemplateCategory } from "@/lib/database/models/Template";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const industry = searchParams.get("industry");
    const jobLevel = searchParams.get("jobLevel");
    const isPremium = searchParams.get("premium");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "popularity";

    await dbConnect();

    // Build query
    const query: any = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (industry) {
      query.industries = { $in: [industry] };
    }

    if (jobLevel) {
      query.jobLevels = { $in: [jobLevel] };
    }

    if (isPremium !== null) {
      query.isPremium = isPremium === "true";
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    // Build sort object
    let sortObject: any = {};
    switch (sortBy) {
      case "rating":
        sortObject = { rating: -1, ratingCount: -1 };
        break;
      case "newest":
        sortObject = { createdAt: -1 };
        break;
      case "usage":
        sortObject = { usageCount: -1 };
        break;
      case "popularity":
      default:
        sortObject = { popularity: -1, usageCount: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [templates, totalCount] = await Promise.all([
      Template.find(query)
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .select(
          "name slug description category thumbnail previewImage styling tags industries jobLevels atsScore usageCount rating ratingCount isPremium isFeatured"
        )
        .lean(),
      Template.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        templates,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Enhanced templates API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch templates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
