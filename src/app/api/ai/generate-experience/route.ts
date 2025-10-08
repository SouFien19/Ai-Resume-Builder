import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
		return NextResponse.json({ ok: true, experience: [], received: body })
	} catch {
		return NextResponse.json({ ok: false }, { status: 500 })
	}
}

export async function GET() {
	return NextResponse.json({ ok: true, message: "generate-experience endpoint" })
}
