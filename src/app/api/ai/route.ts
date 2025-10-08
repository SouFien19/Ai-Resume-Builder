import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({ ok: true, message: "AI API root" })
}

export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}))
	return NextResponse.json({ ok: true, received: body })
}
