import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { messages } = body;
    if (!messages) {
      throw new Error("Missing 'messages' in request body");
    }

    // Create a new ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const completion = await client.chat.completions.create({
          model: "nvidia/llama-3.1-nemotron-70b-instruct",
          messages: messages,
          temperature: 0.5,
          top_p: 1,
          max_tokens: 1024,
          stream: true
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // Encode and send the chunk
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`)
            );
          }
        }
        controller.close();
      }
    });

    // Return the stream with appropriate headers
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}