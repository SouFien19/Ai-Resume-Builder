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
		
		return NextResponse.json({ ok: true, experience: [], received: body })
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
	return NextResponse.json({ ok: true, message: "generate-experience endpoint" })
}
