import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebLLMService } from '../../src/services/webllm/WebLLMService';
import type { ChatMessage } from '../../src/services/webllm/types';

// Mock the @mlc-ai/web-llm module
vi.mock('@mlc-ai/web-llm', () => ({
  CreateMLCEngine: vi.fn(),
}));

import { CreateMLCEngine } from '@mlc-ai/web-llm';

describe('WebLLMService', () => {
  let service: WebLLMService;
  let mockEngine: {
    chat: {
      completions: {
        create: ReturnType<typeof vi.fn>;
      };
    };
    resetChat: ReturnType<typeof vi.fn>;
    interruptGenerate: ReturnType<typeof vi.fn>;
    unload: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    WebLLMService.resetInstance();
    mockEngine = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
      resetChat: vi.fn(),
      interruptGenerate: vi.fn(),
      unload: vi.fn(),
    };
    (CreateMLCEngine as ReturnType<typeof vi.fn>).mockResolvedValue(mockEngine);
    service = WebLLMService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = WebLLMService.getInstance();
      const instance2 = WebLLMService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize the engine successfully', async () => {
      const onProgress = vi.fn();
      await service.initialize(undefined, onProgress);
      expect(CreateMLCEngine).toHaveBeenCalledWith(
        'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
        expect.objectContaining({
          initProgressCallback: expect.any(Function),
        })
      );
      expect(service.isReady()).toBe(true);
    });

    it('should call progress callback with parsed progress', async () => {
      const onProgress = vi.fn();
      let capturedCallback: ((progress: { text: string; progress: number }) => void) | undefined;
      (CreateMLCEngine as ReturnType<typeof vi.fn>).mockImplementation(
        (_model: string, options: { initProgressCallback: (progress: { text: string; progress: number }) => void }) => {
          capturedCallback = options.initProgressCallback;
          return Promise.resolve(mockEngine);
        }
      );
      const initPromise = service.initialize(undefined, onProgress);
      capturedCallback?.({ text: 'Loading model...', progress: 0.5 });
      await initPromise;
      expect(onProgress).toHaveBeenCalledWith({
        progress: 50,
        stage: 'Loading model...',
        timeElapsed: expect.any(Number),
      });
    });

    it('should reinitialize when called again (for model switching)', async () => {
      await service.initialize();
      await service.initialize();
      // Engine should be unloaded and recreated when initialize is called again
      expect(mockEngine.unload).toHaveBeenCalledTimes(1);
      expect(CreateMLCEngine).toHaveBeenCalledTimes(2);
    });

    it('should throw error if WebGPU is not supported', async () => {
      (CreateMLCEngine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('WebGPU is not supported')
      );
      await expect(service.initialize()).rejects.toThrow('WebGPU is not supported');
      expect(service.isReady()).toBe(false);
    });

    it('should throw error on insufficient memory', async () => {
      (CreateMLCEngine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Out of memory')
      );
      await expect(service.initialize()).rejects.toThrow('Out of memory');
    });

    it('should handle network failures during download', async () => {
      (CreateMLCEngine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error: Failed to fetch')
      );
      await expect(service.initialize()).rejects.toThrow('Network error');
    });
  });

  describe('chat', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should send messages and return completion', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello!' }];
      mockEngine.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Hi there! How can I help you?' } }],
      });
      const result = await service.chat(messages);
      expect(mockEngine.chat.completions.create).toHaveBeenCalledWith({
        messages,
        temperature: 0,
        max_tokens: undefined,
        stream: false,
      });
      expect(result).toBe('Hi there! How can I help you?');
    });

    it('should support custom temperature and maxTokens', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello!' }];
      mockEngine.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });
      await service.chat(messages, { temperature: 0.5, maxTokens: 100 });
      expect(mockEngine.chat.completions.create).toHaveBeenCalledWith({
        messages,
        temperature: 0.5,
        max_tokens: 100,
        stream: false,
      });
    });

    it('should throw error if not initialized', async () => {
      WebLLMService.resetInstance();
      const uninitializedService = WebLLMService.getInstance();
      await expect(
        uninitializedService.chat([{ role: 'user', content: 'Hello' }])
      ).rejects.toThrow('Engine not initialized');
    });

    it('should handle generation errors', async () => {
      mockEngine.chat.completions.create.mockRejectedValue(
        new Error('Generation failed')
      );
      await expect(
        service.chat([{ role: 'user', content: 'Hello' }])
      ).rejects.toThrow('Generation failed');
    });
  });

  describe('chatStream', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should stream tokens using async iterator', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello!' }];
      const tokens = ['Hello', ' ', 'world', '!'];
      const mockAsyncIterator = {
        async *[Symbol.asyncIterator]() {
          for (const token of tokens) {
            yield { choices: [{ delta: { content: token } }] };
          }
        },
      };
      mockEngine.chat.completions.create.mockResolvedValue(mockAsyncIterator);
      const receivedTokens: string[] = [];
      for await (const token of service.chatStream(messages)) {
        receivedTokens.push(token);
      }
      expect(mockEngine.chat.completions.create).toHaveBeenCalledWith({
        messages,
        temperature: 0,
        max_tokens: undefined,
        stream: true,
      });
      expect(receivedTokens).toEqual(tokens);
    });

    it('should throw error if not initialized', async () => {
      WebLLMService.resetInstance();
      const uninitializedService = WebLLMService.getInstance();
      const stream = uninitializedService.chatStream([{ role: 'user', content: 'Hello' }]);
      await expect(async () => {
        for await (const _ of stream) { /* consume */ }
      }).rejects.toThrow('Engine not initialized');
    });
  });

  describe('abort', () => {
    it('should call interruptGenerate on engine', async () => {
      await service.initialize();
      service.abort();
      expect(mockEngine.interruptGenerate).toHaveBeenCalled();
    });

    it('should not throw if not initialized', () => {
      WebLLMService.resetInstance();
      const uninitializedService = WebLLMService.getInstance();
      expect(() => uninitializedService.abort()).not.toThrow();
    });
  });

  describe('reset', () => {
    it('should call resetChat on engine', async () => {
      await service.initialize();
      await service.reset();
      expect(mockEngine.resetChat).toHaveBeenCalled();
    });

    it('should not throw if not initialized', async () => {
      WebLLMService.resetInstance();
      const uninitializedService = WebLLMService.getInstance();
      await expect(uninitializedService.reset()).resolves.not.toThrow();
    });
  });

  describe('isReady', () => {
    it('should return false before initialization', () => {
      WebLLMService.resetInstance();
      const newService = WebLLMService.getInstance();
      expect(newService.isReady()).toBe(false);
    });

    it('should return true after successful initialization', async () => {
      await service.initialize();
      expect(service.isReady()).toBe(true);
    });

    it('should return false after failed initialization', async () => {
      (CreateMLCEngine as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Init failed')
      );
      WebLLMService.resetInstance();
      const newService = WebLLMService.getInstance();
      try {
        await newService.initialize();
      } catch {
        // expected
      }
      expect(newService.isReady()).toBe(false);
    });
  });
});
