import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebLLMService } from '../../src/services/webllm/WebLLMService';
import type { ChatMessage } from '../../src/services/webllm/types';

// Mock the @mlc-ai/web-llm module
vi.mock('@mlc-ai/web-llm', () => ({
  CreateMLCEngine: vi.fn(),
}));

import { CreateMLCEngine } from '@mlc-ai/web-llm';

describe('WebLLMService - Multi-turn Conversations', () => {
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

  describe('Consecutive Message Handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle consecutive messages in same conversation', async () => {
      // First message
      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'Hello! How can I help you?' } }],
      });

      const messages1: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ];
      const response1 = await service.chat(messages1);
      expect(response1).toBe('Hello! How can I help you?');

      // Second message with context
      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'I can help with many things!' } }],
      });

      const messages2: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hello! How can I help you?' },
        { role: 'user', content: 'What can you help me with?' },
      ];
      const response2 = await service.chat(messages2);
      expect(response2).toBe('I can help with many things!');

      // Verify both calls were made
      expect(mockEngine.chat.completions.create).toHaveBeenCalledTimes(2);
    });

    it('should maintain conversation context across multiple turns', async () => {
      const responses = [
        'My name is DeepSeek!',
        'You asked about my name.',
        'We discussed my name and what you asked about.',
      ];

      for (const response of responses) {
        mockEngine.chat.completions.create.mockResolvedValueOnce({
          choices: [{ message: { content: response } }],
        });
      }

      // Turn 1
      await service.chat([{ role: 'user', content: 'What is your name?' }]);

      // Turn 2
      await service.chat([
        { role: 'user', content: 'What is your name?' },
        { role: 'assistant', content: 'My name is DeepSeek!' },
        { role: 'user', content: 'What did I just ask?' },
      ]);

      // Turn 3
      await service.chat([
        { role: 'user', content: 'What is your name?' },
        { role: 'assistant', content: 'My name is DeepSeek!' },
        { role: 'user', content: 'What did I just ask?' },
        { role: 'assistant', content: 'You asked about my name.' },
        { role: 'user', content: 'Summarize our conversation' },
      ]);

      expect(mockEngine.chat.completions.create).toHaveBeenCalledTimes(3);

      // Verify the last call had the full context
      const lastCall = mockEngine.chat.completions.create.mock.calls[2];
      expect(lastCall[0].messages).toHaveLength(5);
    });

    it('should recover from error and process next message', async () => {
      // First call fails
      mockEngine.chat.completions.create.mockRejectedValueOnce(
        new Error('Generation timeout')
      );

      await expect(
        service.chat([{ role: 'user', content: 'Test message' }])
      ).rejects.toThrow('Generation timeout');

      // Second call should succeed
      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'Success after failure' } }],
      });

      const response = await service.chat([
        { role: 'user', content: 'Second attempt' },
      ]);

      expect(response).toBe('Success after failure');
    });

    it('should handle rapid consecutive requests', async () => {
      const responses = ['Response 1', 'Response 2', 'Response 3'];

      for (const response of responses) {
        mockEngine.chat.completions.create.mockResolvedValueOnce({
          choices: [{ message: { content: response } }],
        });
      }

      const promises = [
        service.chat([{ role: 'user', content: 'Message 1' }]),
        service.chat([{ role: 'user', content: 'Message 2' }]),
        service.chat([{ role: 'user', content: 'Message 3' }]),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual(responses);
      expect(mockEngine.chat.completions.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Long Message Handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle long user messages', async () => {
      const longMessage = 'A'.repeat(5000);

      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'Processed long message' } }],
      });

      const response = await service.chat([
        { role: 'user', content: longMessage },
      ]);

      expect(response).toBe('Processed long message');
      expect(mockEngine.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: longMessage }],
        })
      );
    });

    it('should handle long conversation history', async () => {
      const longHistory: ChatMessage[] = [];
      for (let i = 0; i < 50; i++) {
        longHistory.push({ role: 'user', content: `Question ${i}` });
        longHistory.push({ role: 'assistant', content: `Answer ${i}` });
      }
      longHistory.push({ role: 'user', content: 'Final question' });

      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'Final answer' } }],
      });

      const response = await service.chat(longHistory);

      expect(response).toBe('Final answer');
      expect(mockEngine.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: longHistory,
        })
      );
    });
  });

  describe('Streaming Multi-turn', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle streaming for consecutive messages', async () => {
      const createMockStream = (tokens: string[]) => ({
        async *[Symbol.asyncIterator]() {
          for (const token of tokens) {
            yield { choices: [{ delta: { content: token } }] };
          }
        },
      });

      // First streaming message
      mockEngine.chat.completions.create.mockResolvedValueOnce(
        createMockStream(['Hello', ' ', 'world'])
      );

      const tokens1: string[] = [];
      for await (const token of service.chatStream([
        { role: 'user', content: 'First' },
      ])) {
        tokens1.push(token);
      }
      expect(tokens1.join('')).toBe('Hello world');

      // Second streaming message
      mockEngine.chat.completions.create.mockResolvedValueOnce(
        createMockStream(['Second', ' ', 'response'])
      );

      const tokens2: string[] = [];
      for await (const token of service.chatStream([
        { role: 'user', content: 'First' },
        { role: 'assistant', content: 'Hello world' },
        { role: 'user', content: 'Second' },
      ])) {
        tokens2.push(token);
      }
      expect(tokens2.join('')).toBe('Second response');
    });
  });

  describe('Error Recovery', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should not corrupt state after abort', async () => {
      // Start a request and abort
      mockEngine.chat.completions.create.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const chatPromise = service.chat([{ role: 'user', content: 'Test' }]);
      service.abort();

      // Wait a bit and try again
      await new Promise((resolve) => setTimeout(resolve, 100));

      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'After abort' } }],
      });

      const response = await service.chat([
        { role: 'user', content: 'After abort' },
      ]);

      expect(response).toBe('After abort');
    });

    it('should handle empty response from model', async () => {
      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: '' } }],
      });

      const response = await service.chat([
        { role: 'user', content: 'Test' },
      ]);

      expect(response).toBe('');
    });

    it('should throw error for undefined content in response', async () => {
      mockEngine.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: undefined } }],
      });

      await expect(
        service.chat([{ role: 'user', content: 'Test' }])
      ).rejects.toThrow('No content in response');
    });
  });
});
