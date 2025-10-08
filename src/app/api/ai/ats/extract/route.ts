import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "multipart/form-data required" }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get("resumeFile");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "resumeFile is required" }, { status: 400 });
    }
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || "").slice(0, 12000);
    return NextResponse.json({ text, numpages: parsed.numpages || 0 });
  } catch {
    return NextResponse.json({ text: "", numpages: 0 }, { status: 200 });
  }
}
