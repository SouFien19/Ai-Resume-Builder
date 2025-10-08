import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
  const { messages } = await req.json();
    const model = getModel("gemini-1.5-flash");
    if (!model) return NextResponse.json({ text: "AI is not configured." }, { status: 200 });

    // Build content array from chat-like messages
    const parts = [] as { role: "user" | "model"; parts: { text: string }[] }[];
    if (Array.isArray(messages)) {
      for (const m of messages) {
        const role = m.role === "assistant" ? "model" : "user";
        const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        parts.push({ role, parts: [{ text: content.slice(0, 6000) }] });
      }
    }

    const sys = `You are a helpful, concise resume and career assistant. Provide practical, ATS-friendly advice.`;
    const final = [ { role: "user", parts: [{ text: sys }] }, ...parts ];
  const result = await model.generateContent({ contents: final, generationConfig: { temperature: 0.6 } } as unknown as Parameters<typeof model.generateContent>[0]);
  const anyResult = result as unknown as { response?: { text?: () => string } };
  const response = anyResult.response;
    const text = response?.text?.() ?? "";
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: "" }, { status: 200 });
  }
}
