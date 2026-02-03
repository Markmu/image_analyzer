import { replicate } from './index';

/**
 * Input parameters for text generation
 */
export interface GenerateTextInput {
  /** The model to use for text generation */
  model?: string;
  /** Prompt to generate text from */
  prompt: string;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature for randomness (0-1) */
  temperature?: number;
  /** Top-p sampling parameter */
  topP?: number;
  /** Whether to stream the response */
  stream?: boolean;
}

/**
 * Output from text generation
 */
export interface GenerateTextOutput {
  /** Generated text */
  text: string;
  /** Number of tokens generated */
  tokenCount: number;
  /** Model used for generation */
  model: string;
  /** Time taken to generate */
  latency: number;
}

/**
 * Replicate API response type (varies by model)
 */
interface ReplicateTextResponse {
  text?: string;
  token_count?: number;
  latency?: number;
  [key: string]: unknown;
}

/**
 * Generate text using Replicate's text models
 * @param input - Text generation parameters
 * @returns Generated text and metadata
 */
export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
  const model = process.env.REPLICATE_TEXT_MODEL_ID || input.model || 'your-text-model-id';

  const response = await replicate.run(model as `${string}/${string}` | `${string}/${string}:${string}`, {
    input: {
      prompt: input.prompt,
      max_tokens: input.maxTokens || 1000,
      temperature: input.temperature || 0.7,
      top_p: input.topP || 0.9,
      stream: input.stream || false,
    },
  });

  const respObj = response as ReplicateTextResponse | string;

  return {
    text: typeof respObj === 'string' ? respObj : (respObj.text || String(respObj)),
    tokenCount: typeof respObj === 'string' ? 0 : (respObj.token_count || 0),
    model,
    latency: typeof respObj === 'string' ? 0 : (respObj.latency || 0),
  };
}

/**
 * Stream text generation for real-time output
 * @param input - Text generation parameters
 * @returns Async generator yielding text chunks
 */
export async function* streamText(
  input: Omit<GenerateTextInput, 'stream'>
): AsyncGenerator<string, void, unknown> {
  const model = process.env.REPLICATE_TEXT_MODEL_ID || input.model || 'your-text-model-id';

  const output = await replicate.run(model as `${string}/${string}` | `${string}/${string}:${string}`, {
    input: {
      ...input,
      stream: true,
    },
  });

  for await (const chunk of output as AsyncIterable<{ text?: string }>) {
    yield chunk.text || String(chunk);
  }
}
