import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const systemMessage = `You are a seasoned financial analyst who gives **honest, no-BS investment insights** like a real person would. Keep your responses **brief, direct, and actionable**—no fluff. 

### How to respond:
- Give a clear stance: If it's a great investment, say why. If it's overhyped, call it out.
- Keep it brief: a simple summary is enough.
- Highlight risks & rewards Be transparent about what could go wrong.
- Use a conversational, real-person tone: Avoid sounding robotic or generic.
- Be actionable: Recommend a clear course of action (buy, sell, hold).

Example Format:
Great Question! Here's my take: I think [stock] is a solid long-term bet because [reason 1], [reason 2], and [reason 3]. 
At time X, [stock] was doing Y. However, [risk 1] is a major concern. Overall, I'd recommend [buy/sell/hold].
I'd say its a solid long-term bet if you can stomach the valuation risk. Short-term, expect volatility.`

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing or invalid messages in request body.' },
        { status: 400 }
      );
    }

    // Filter out any messages with empty content
    const filteredMessages = messages.filter(
      (msg: { role: string; content: string }) => msg.content.trim().length > 0
    );

    // Prepend the system message
    const allMessages = [{ role: 'system', content: systemMessage }, ...filteredMessages];

    // Request a streaming completion from the OpenAI-compatible API
    const completion = await openai.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: allMessages,
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    // Create a ReadableStream to send back Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            const sseFormatted = `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`;
            controller.enqueue(new TextEncoder().encode(sseFormatted));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    console.error('Error generating financial analysis:', error);
    return NextResponse.json(
      { error: 'Error generating financial analysis.' },
      { status: 500 }
    );
  }
}
