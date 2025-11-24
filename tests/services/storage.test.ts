import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService, Conversation } from '../../src/services/storage/types';
import { IndexedDBStorageService } from '../../src/services/storage';

// Mock IndexedDB using fake-indexeddb
import 'fake-indexeddb/auto';

describe('IndexedDBStorageService', () => {
  let storageService: StorageService;

  const createTestConversation = (id: string, title: string = 'Test Chat'): Conversation => ({
    id,
    title,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  beforeEach(async () => {
    // Create a fresh instance for each test
    storageService = new IndexedDBStorageService('test-db-' + Date.now());
  });

  afterEach(async () => {
    await storageService.clearAll();
  });

  describe('saveConversation', () => {
    it('should save a new conversation', async () => {
      const conversation = createTestConversation('conv-1');
      await storageService.saveConversation(conversation);

      const retrieved = await storageService.getConversation('conv-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('conv-1');
      expect(retrieved?.title).toBe('Test Chat');
    });

    it('should update an existing conversation', async () => {
      const conversation = createTestConversation('conv-1');
      await storageService.saveConversation(conversation);

      const updated = { ...conversation, title: 'Updated Title' };
      await storageService.saveConversation(updated);

      const retrieved = await storageService.getConversation('conv-1');
      expect(retrieved?.title).toBe('Updated Title');
    });
  });

  describe('getAllConversations', () => {
    it('should return empty array when no conversations exist', async () => {
      const conversations = await storageService.getAllConversations();
      expect(conversations).toEqual([]);
    });

    it('should return all saved conversations', async () => {
      await storageService.saveConversation(createTestConversation('conv-1', 'Chat 1'));
      await storageService.saveConversation(createTestConversation('conv-2', 'Chat 2'));
      await storageService.saveConversation(createTestConversation('conv-3', 'Chat 3'));

      const conversations = await storageService.getAllConversations();
      expect(conversations).toHaveLength(3);
    });

    it('should return conversations sorted by updatedAt descending', async () => {
      const now = Date.now();

      await storageService.saveConversation({
        ...createTestConversation('conv-1', 'Old'),
        updatedAt: now - 2000,
      });
      await storageService.saveConversation({
        ...createTestConversation('conv-2', 'Newest'),
        updatedAt: now,
      });
      await storageService.saveConversation({
        ...createTestConversation('conv-3', 'Middle'),
        updatedAt: now - 1000,
      });

      const conversations = await storageService.getAllConversations();
      expect(conversations[0].title).toBe('Newest');
      expect(conversations[1].title).toBe('Middle');
      expect(conversations[2].title).toBe('Old');
    });
  });

  describe('getConversation', () => {
    it('should return undefined for non-existent conversation', async () => {
      const conversation = await storageService.getConversation('non-existent');
      expect(conversation).toBeUndefined();
    });

    it('should return the correct conversation by id', async () => {
      await storageService.saveConversation(createTestConversation('conv-1', 'Chat 1'));
      await storageService.saveConversation(createTestConversation('conv-2', 'Chat 2'));

      const conversation = await storageService.getConversation('conv-2');
      expect(conversation?.title).toBe('Chat 2');
    });
  });

  describe('deleteConversation', () => {
    it('should delete an existing conversation', async () => {
      await storageService.saveConversation(createTestConversation('conv-1'));
      await storageService.deleteConversation('conv-1');

      const conversation = await storageService.getConversation('conv-1');
      expect(conversation).toBeUndefined();
    });

    it('should not throw when deleting non-existent conversation', async () => {
      await expect(storageService.deleteConversation('non-existent')).resolves.not.toThrow();
    });

    it('should only delete the specified conversation', async () => {
      await storageService.saveConversation(createTestConversation('conv-1'));
      await storageService.saveConversation(createTestConversation('conv-2'));

      await storageService.deleteConversation('conv-1');

      const conversations = await storageService.getAllConversations();
      expect(conversations).toHaveLength(1);
      expect(conversations[0].id).toBe('conv-2');
    });
  });

  describe('clearAll', () => {
    it('should remove all conversations', async () => {
      await storageService.saveConversation(createTestConversation('conv-1'));
      await storageService.saveConversation(createTestConversation('conv-2'));

      await storageService.clearAll();

      const conversations = await storageService.getAllConversations();
      expect(conversations).toHaveLength(0);
    });
  });
});
