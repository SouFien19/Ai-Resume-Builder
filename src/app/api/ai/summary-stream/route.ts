import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_GEMINI_API_KEY || 
  ''
);

export async function POST(request: NextRequest) {
  try {
    const { role, seniority, industry, skills, current } = await request.json();

    if (!role || !skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are a professional resume writer. Generate an improved professional summary for a ${seniority || ''} ${role} ${industry ? `in ${industry}` : ''}.

Current skills: ${skills.join(', ')}
Current summary: ${current || 'None'}

Requirements:
- 2-3 sentences maximum
- Focus on quantifiable achievements and impact
- Include top 3-4 relevant skills naturally
- Professional tone
- Industry-specific language when appropriate
- Avoid buzzwords and clichés

Return only the improved summary text, no explanations.`;

    // Use streaming for better UX
    const result = await model.generateContentStream(prompt);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            
            // Send progressive updates
            const data = JSON.stringify({ 
              type: 'chunk', 
              content: chunkText,
              fullText: fullText.trim()
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          
          // Send final result
          const finalData = JSON.stringify({ 
            type: 'complete', 
            summary: fullText.trim() 
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({ 
            type: 'error', 
            error: 'Failed to generate summary' 
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI Summary API Error:', error);
    return NextResponse.json(
      { error: 'Failed to improve summary' },
      { status: 500 }
    );
  }
}