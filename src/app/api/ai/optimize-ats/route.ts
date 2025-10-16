import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { trackAIRequest } from "@/lib/ai/track-analytics";

export async function POST(req: Request) {
	const startTime = Date.now();
	try {
		const { userId } = await auth();
		const body = await req.json().catch(() => ({}))
		
		const requestDuration = Date.now() - startTime;
		if (userId) {
			await trackAIRequest({
				userId,
				contentType: 'work-experience',
				cached: false,
				success: true,
				requestDuration,
			});
		}
		
		// Minimal placeholder: return structure with basic suggestions
		return NextResponse.json({
			ok: true,
			score: 0,
			warnings: [],
			suggestions: [
				"Include role-specific keywords in your summary and top experience bullets.",
			],
			received: body,
		})
	} catch (error) {
		const { userId } = await auth();
		if (userId) {
			await trackAIRequest({
				userId,
				contentType: 'work-experience',
				cached: false,
				success: false,
				errorMessage: error instanceof Error ? error.message : 'Unknown error',
			});
		}
		return NextResponse.json({ ok: false }, { status: 500 })
	}
}

export async function GET() {
	return NextResponse.json({ ok: true, message: "optimize-ats endpoint" })
}
