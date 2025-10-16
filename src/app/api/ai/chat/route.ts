import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModel } from "@/lib/ai/gemini";
import { trackAIRequest } from "@/lib/ai/track-analytics";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
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
    
    const requestDuration = Date.now() - startTime;
    if (userId) {
      const tokensUsed = Math.ceil((sys + JSON.stringify(messages)).length / 4) + Math.ceil(text.length / 4);
      await trackAIRequest({
        userId,
        contentType: 'work-experience',
        cached: false,
        success: true,
        tokensUsed,
        requestDuration,
      });
    }
    
    return NextResponse.json({ text });
  } catch (error) {
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'work-experience',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return NextResponse.json({ text: "" }, { status: 200 });
  }
}
