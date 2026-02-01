import { createRuntime } from '@yourgpt/llm-sdk';
import { createAnthropic } from '@yourgpt/llm-sdk/anthropic';
import { config } from '@/lib/config';

const runtime = createRuntime({
  provider: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }),
  model: 'claude-haiku-4-5',
  systemPrompt: config.copilot.systemPrompt,
  debug: process.env.NODE_ENV === 'development',
});

export async function POST(req: Request) {
  try {
    // Use handleRequest instead of stream().toResponse()
    // This properly handles the full request/response cycle including tool execution
    const response = await runtime.handleRequest(req);
    return response;
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
