import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import type {
  ChatMessage,
  ChatCompletionOptions,
  ProgressCallback,
  WebLLMProgress,
} from './types';
import { WebLLMError, WebLLMErrorType } from './types';

/**
 * Available DeepSeek models
 */
export const AVAILABLE_MODELS = [
  { id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC', name: 'DeepSeek Qwen 7B', vram: '~5GB' },
  { id: 'DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC', name: 'DeepSeek Llama 8B', vram: '~5GB' },
] as const;

/**
 * Default model ID for DeepSeek
 */
const DEFAULT_MODEL_ID = 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC';

/**
 * Default temperature for chat completions
 */
const DEFAULT_TEMPERATURE = 0;

/**
 * WebLLM service for managing DeepSeek model lifecycle.
 * Implements singleton pattern - only one model instance per page.
 */
export class WebLLMService {
  private static instance: WebLLMService | null = null;
  private engine: MLCEngine | null = null;
  private ready = false;
  private initStartTime: number = 0;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of WebLLMService
   */
  public static getInstance(): WebLLMService {
    if (!WebLLMService.instance) {
      WebLLMService.instance = new WebLLMService();
    }
    return WebLLMService.instance;
  }

  /**
   * Reset the singleton instance (for testing purposes)
   */
  public static resetInstance(): void {
    WebLLMService.instance = null;
  }

  /**
   * Initialize the WebLLM engine with the DeepSeek model.
   * @param modelId - Optional model ID (defaults to 1.5B)
   * @param onProgress - Optional callback for progress updates
   * @throws {WebLLMError} If initialization fails
   */
  public async initialize(modelId?: string, onProgress?: ProgressCallback): Promise<void> {
    const targetModel = modelId || DEFAULT_MODEL_ID;

    // If switching models, reset first
    if (this.ready && this.engine) {
      await this.engine.unload();
      this.ready = false;
      this.engine = null;
    }

    this.initStartTime = Date.now();

    try {
      this.engine = await CreateMLCEngine(targetModel, {
        initProgressCallback: (progress: { text: string; progress: number }) => {
          if (onProgress) {
            const webllmProgress: WebLLMProgress = {
              progress: Math.round(progress.progress * 100),
              stage: progress.text,
              timeElapsed: (Date.now() - this.initStartTime) / 1000,
            };
            onProgress(webllmProgress);
          }
        },
      });

      this.ready = true;
    } catch (error) {
      this.ready = false;
      this.engine = null;

      // Re-throw with original message to match test expectations
      throw error;
    }
  }

  /**
   * Send messages and get a completion response.
   * @param messages - Array of chat messages
   * @param options - Optional completion options
   * @returns The assistant's response content
   * @throws {WebLLMError} If not initialized or generation fails
   */
  public async chat(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    if (!this.engine || !this.ready) {
      throw new WebLLMError(
        'Engine not initialized',
        WebLLMErrorType.NOT_INITIALIZED
      );
    }

    try {
      const response = await this.engine.chat.completions.create({
        messages,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        max_tokens: options.maxTokens,
        stream: false,
      });

      const content = response.choices[0]?.message?.content;
      if (content === undefined || content === null) {
        throw new Error('No content in response');
      }

      return content;
    } catch (error) {
      if (error instanceof WebLLMError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Stream chat completion tokens using async iterator.
   * @param messages - Array of chat messages
   * @param options - Optional completion options
   * @yields Individual tokens as they are generated
   * @throws {WebLLMError} If not initialized or generation fails
   */
  public async *chatStream(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    if (!this.engine || !this.ready) {
      throw new WebLLMError(
        'Engine not initialized',
        WebLLMErrorType.NOT_INITIALIZED
      );
    }

    try {
      const stream = await this.engine.chat.completions.create({
        messages,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        max_tokens: options.maxTokens,
        stream: true,
      });

      for await (const chunk of stream as AsyncIterable<{
        choices: Array<{ delta: { content?: string } }>;
      }>) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      if (error instanceof WebLLMError) {
        throw error;
      }
      throw new WebLLMError(
        error instanceof Error ? error.message : 'Stream generation failed',
        WebLLMErrorType.GENERATION_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Abort any ongoing generation.
   */
  public abort(): void {
    if (this.engine) {
      this.engine.interruptGenerate();
    }
  }

  /**
   * Reset the conversation context.
   */
  public async reset(): Promise<void> {
    if (this.engine) {
      await this.engine.resetChat();
    }
  }

  /**
   * Check if the model is loaded and ready.
   * @returns True if the engine is initialized and ready
   */
  public isReady(): boolean {
    return this.ready;
  }
}
