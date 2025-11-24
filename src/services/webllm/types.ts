/**
 * Progress information during model initialization
 */
export interface WebLLMProgress {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current loading stage description */
  stage: string;
  /** Seconds elapsed since initialization started */
  timeElapsed?: number;
}

/**
 * Chat message format compatible with OpenAI API
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system';
  /** Message content */
  content: string;
}

/**
 * Options for chat completion requests
 */
export interface ChatCompletionOptions {
  /** Sampling temperature (0-2), higher = more creative */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Whether to stream the response */
  stream?: boolean;
}

/**
 * Callback type for progress updates
 */
export type ProgressCallback = (progress: WebLLMProgress) => void;

/**
 * WebLLM service error types
 */
export enum WebLLMErrorType {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  WEBGPU_NOT_SUPPORTED = 'WEBGPU_NOT_SUPPORTED',
  INSUFFICIENT_MEMORY = 'INSUFFICIENT_MEMORY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
}

/**
 * Custom error class for WebLLM service errors
 */
export class WebLLMError extends Error {
  constructor(
    message: string,
    public readonly type: WebLLMErrorType,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'WebLLMError';
  }
}
