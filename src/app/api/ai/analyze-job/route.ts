import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
		// Minimal placeholder: echo back basic analysis shape so build passes.
		return NextResponse.json({
			ok: true,
			received: body ?? null,
			insights: [],
			score: 0,
		})
	} catch {
		return NextResponse.json({ ok: false, error: "analyze-job error" }, { status: 500 })
	}
}

export async function GET() {
	return NextResponse.json({ ok: true, message: "analyze-job endpoint" })
}
