import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const systemMessage = `You are an expert financial analyst with decades of experience in global markets, economic trends, and investment strategies. Your knowledge spans across various sectors including technology, healthcare, energy, and finance. You have a keen ability to analyze complex financial data, identify market trends, and provide actionable insights. Your advice is sought after by top executives and investors worldwide. In your responses, please:

1. Provide a brief and concise analysis of the given financial situation or query.
2. Use relevant financial metrics and ratios when applicable.
3. Consider both short-term and long-term implications.
4. Discuss potential risks and opportunities.
5. Offer data-driven recommendations or strategies when appropriate.
6. Use industry-specific terminology, but explain complex concepts when necessary.
7. Cite recent market events or economic indicators that may impact the analysis.
8. Maintain a balanced and objective viewpoint, considering multiple perspectives.

Please tailor your response to the specific query or situation presented, and provide insights that would be valuable to a sophisticated financial audience.`;

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
