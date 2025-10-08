import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
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
	} catch {
		return NextResponse.json({ ok: false }, { status: 500 })
	}
}

export async function GET() {
	return NextResponse.json({ ok: true, message: "optimize-ats endpoint" })
}
