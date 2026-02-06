import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CHUNK_SIZE = 4000;

async function generateAudioChunk(text: string, voice: string, speed: number): Promise<ArrayBuffer> {
  // Using browser's Web Speech API simulation for demo
  // In production, you would use OpenAI's TTS API or similar service

  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Simulate audio generation delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return data.buffer;
}

function estimateDuration(text: string, speed: number): number {
  const words = text.split(/\s+/).length;
  const baseWordsPerMinute = 150;
  const adjustedWPM = baseWordsPerMinute * speed;
  return Math.round((words / adjustedWPM) * 60);
}

export async function POST(request: NextRequest) {
  try {
    const { script, voice, speed } = await request.json();

    if (!script || typeof script !== 'string') {
      return new Response('Invalid script', { status: 400 });
    }

    const duration = estimateDuration(script, speed);

    // Split script into chunks for processing
    const chunks: string[] = [];
    const words = script.split(/\s+/);
    let currentChunk = '';

    for (const word of words) {
      if (currentChunk.length + word.length + 1 <= CHUNK_SIZE) {
        currentChunk += (currentChunk ? ' ' : '') + word;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = word;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ progress: 0, duration })}\n\n`)
          );

          const audioChunks: Uint8Array[] = [];

          // Process each chunk
          for (let i = 0; i < chunks.length; i++) {
            const progress = Math.round(((i + 1) / chunks.length) * 90);

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
            );

            // Simulate audio generation
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          // Create a simple audio data URL (demo purposes)
          // In production, you would concatenate actual audio buffers
          const synthesizedText = `Voice: ${voice}, Speed: ${speed}x, Script length: ${script.length} characters`;
          const audioData = encoder.encode(synthesizedText);
          const base64Audio = btoa(String.fromCharCode(...Array.from(audioData)));
          const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                progress: 100,
                audioUrl,
                duration
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
