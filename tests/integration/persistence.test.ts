import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDBStorageService } from '../../src/services/storage';
import type { Conversation } from '../../src/types/chat';

describe('Persistence Integration Tests', () => {
  let storage: IndexedDBStorageService;

  beforeEach(() => {
    // Use unique DB name for each test to avoid conflicts
    storage = new IndexedDBStorageService(`test-db-${Date.now()}-${Math.random()}`);
  });

  afterEach(async () => {
    // Clear all data after each test
    await storage.clearAll();
  });

  const createTestConversation = (id: string): Conversation => ({
    id,
    title: `Test ${id}`,
    messages: [
      {
        id: `msg-${id}-1`,
        role: 'user',
        content: 'Test message',
        timestamp: Date.now(),
      },
      {
        id: `msg-${id}-2`,
        role: 'assistant',
        content: 'Test response',
        timestamp: Date.now(),
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  describe('Save and Load Roundtrip', () => {
    it('should save and retrieve a conversation', async () => {
      const conversation = createTestConversation('conv-1');

      await storage.saveConversation(conversation);
      const loaded = await storage.getConversation('conv-1');

      expect(loaded).toBeDefined();
      expect(loaded?.id).toBe('conv-1');
      expect(loaded?.title).toBe('Test conv-1');
      expect(loaded?.messages).toHaveLength(2);
    });

    it('should save and retrieve multiple conversations', async () => {
      const conv1 = createTestConversation('conv-1');
      const conv2 = createTestConversation('conv-2');
      const conv3 = createTestConversation('conv-3');

      await storage.saveConversation(conv1);
      await storage.saveConversation(conv2);
      await storage.saveConversation(conv3);

      const all = await storage.getAllConversations();
      expect(all).toHaveLength(3);
    });

    it('should preserve message content and metadata', async () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Important Chat',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'What is 2 + 2?',
            timestamp: 1234567890,
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: '2 + 2 = 4',
            timestamp: 1234567891,
          },
        ],
        createdAt: 1234567800,
        updatedAt: 1234567891,
      };

      await storage.saveConversation(conversation);
      const loaded = await storage.getConversation('conv-1');

      expect(loaded).toEqual(conversation);
    });

    it('should handle special characters in content', async () => {
      const conversation: Conversation = {
        id: 'conv-special',
        title: 'Special Characters',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test: <script>alert("xss")</script> & "quotes" \'apostrophes\' \n\t',
            timestamp: Date.now(),
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.saveConversation(conversation);
      const loaded = await storage.getConversation('conv-special');

      expect(loaded?.messages[0].content).toBe(
        'Test: <script>alert("xss")</script> & "quotes" \'apostrophes\' \n\t'
      );
    });

    it('should handle unicode and emojis', async () => {
      const conversation: Conversation = {
        id: 'conv-unicode',
        title: '日本語タイトル 🚀',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: '你好世界 🌍 مرحبا',
            timestamp: Date.now(),
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.saveConversation(conversation);
      const loaded = await storage.getConversation('conv-unicode');

      expect(loaded?.title).toBe('日本語タイトル 🚀');
      expect(loaded?.messages[0].content).toBe('你好世界 🌍 مرحبا');
    });

    it('should handle very long messages', async () => {
      const longContent = 'A'.repeat(100000);
      const conversation: Conversation = {
        id: 'conv-long',
        title: 'Long Message',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: longContent,
            timestamp: Date.now(),
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.saveConversation(conversation);
      const loaded = await storage.getConversation('conv-long');

      expect(loaded?.messages[0].content).toBe(longContent);
      expect(loaded?.messages[0].content.length).toBe(100000);
    });
  });

  describe('Update Operations', () => {
    it('should update existing conversation', async () => {
      const conversation = createTestConversation('conv-1');
      await storage.saveConversation(conversation);

      // Update title
      const updated = {
        ...conversation,
        title: 'Updated Title',
        updatedAt: Date.now(),
      };
      await storage.saveConversation(updated);

      const loaded = await storage.getConversation('conv-1');
      expect(loaded?.title).toBe('Updated Title');
    });

    it('should add messages to existing conversation', async () => {
      const conversation = createTestConversation('conv-1');
      await storage.saveConversation(conversation);

      // Add new message
      const newMessage = {
        id: 'msg-3',
        role: 'user' as const,
        content: 'Follow-up question',
        timestamp: Date.now(),
      };
      const updated = {
        ...conversation,
        messages: [...conversation.messages, newMessage],
        updatedAt: Date.now(),
      };
      await storage.saveConversation(updated);

      const loaded = await storage.getConversation('conv-1');
      expect(loaded?.messages).toHaveLength(3);
      expect(loaded?.messages[2].content).toBe('Follow-up question');
    });
  });

  describe('Delete Operations', () => {
    it('should delete a conversation', async () => {
      const conversation = createTestConversation('conv-1');
      await storage.saveConversation(conversation);

      await storage.deleteConversation('conv-1');

      const loaded = await storage.getConversation('conv-1');
      expect(loaded).toBeUndefined();
    });

    it('should handle deleting non-existent conversation', async () => {
      // Should not throw
      await expect(
        storage.deleteConversation('non-existent')
      ).resolves.not.toThrow();
    });

    it('should not affect other conversations when deleting', async () => {
      const conv1 = createTestConversation('conv-1');
      const conv2 = createTestConversation('conv-2');

      await storage.saveConversation(conv1);
      await storage.saveConversation(conv2);

      await storage.deleteConversation('conv-1');

      const remaining = await storage.getAllConversations();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('conv-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty conversation list', async () => {
      const all = await storage.getAllConversations();
      expect(all).toEqual([]);
    });

    it('should handle getting non-existent conversation', async () => {
      const loaded = await storage.getConversation('non-existent');
      expect(loaded).toBeUndefined();
    });

    it('should handle conversation with no messages', async () => {
      const conversation: Conversation = {
        id: 'empty',
        title: 'Empty Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.saveConversation(conversation);
      const loaded = await storage.getConversation('empty');

      expect(loaded?.messages).toEqual([]);
    });

    it('should handle conversation with many messages', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now() + i,
      }));

      const conversation: Conversation = {
        id: 'many-messages',
        title: 'Long Conversation',
        messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.saveConversation(conversation);
      const loaded = await storage.getConversation('many-messages');

      expect(loaded?.messages).toHaveLength(100);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent saves', async () => {
      const conversations = Array.from({ length: 10 }, (_, i) =>
        createTestConversation(`conv-${i}`)
      );

      await Promise.all(
        conversations.map((conv) => storage.saveConversation(conv))
      );

      const all = await storage.getAllConversations();
      expect(all).toHaveLength(10);
    });

    it('should handle concurrent reads', async () => {
      const conversation = createTestConversation('conv-1');
      await storage.saveConversation(conversation);

      const results = await Promise.all([
        storage.getConversation('conv-1'),
        storage.getConversation('conv-1'),
        storage.getConversation('conv-1'),
      ]);

      expect(results.every((r) => r?.id === 'conv-1')).toBe(true);
    });
  });
});
