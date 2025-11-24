import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Conversation, StorageService } from './types';

interface ChatDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'deepseek-chat';
const DB_VERSION = 1;
const STORE_NAME = 'conversations';

export class IndexedDBStorageService implements StorageService {
  private dbName: string;
  private dbPromise: Promise<IDBPDatabase<ChatDB>>;

  constructor(dbName: string = DB_NAME) {
    this.dbName = dbName;
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase<ChatDB>> {
    return openDB<ChatDB>(this.dbName, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      },
    });
  }

  async getAllConversations(): Promise<Conversation[]> {
    const db = await this.dbPromise;
    const conversations = await db.getAll(STORE_NAME);
    // Sort by updatedAt descending (newest first)
    return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, id);
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, conversation);
  }

  async deleteConversation(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }
}

// Export singleton instance for production use - lazy initialization
let _storageService: IndexedDBStorageService | null = null;

export const getStorageService = (): IndexedDBStorageService => {
  if (!_storageService) {
    _storageService = new IndexedDBStorageService();
  }
  return _storageService;
};

// For backward compatibility, but this will fail if IndexedDB is not available
export const storageService = {
  getAllConversations: () => getStorageService().getAllConversations(),
  getConversation: (id: string) => getStorageService().getConversation(id),
  saveConversation: (conversation: Conversation) => getStorageService().saveConversation(conversation),
  deleteConversation: (id: string) => getStorageService().deleteConversation(id),
  clearAll: () => getStorageService().clearAll(),
};

// Re-export types
export type { Conversation, StorageService } from './types';
