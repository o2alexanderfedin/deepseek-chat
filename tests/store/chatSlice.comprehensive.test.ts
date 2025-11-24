import { describe, it, expect } from 'vitest';
import chatReducer, {
  initialState,
  createConversation,
  deleteConversation,
  setActiveConversation,
  loadConversations,
  updateConversationTitle,
  addMessage,
  setLoading,
  setError,
  setModelStatus,
  setLoadProgress,
  clearChat,
  clearError,
  updateMessage,
} from '../../src/store/slices/chatSlice';
import type { ChatState, Conversation, ChatMessage } from '../../src/types/chat';

describe('chatSlice - Comprehensive Tests', () => {
  const createTestConversation = (id: string, title: string = 'Test'): Conversation => ({
    id,
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const createTestMessage = (role: 'user' | 'assistant', content: string): ChatMessage => ({
    id: `${role}-${Date.now()}-${Math.random()}`,
    role,
    content,
    timestamp: Date.now(),
  });

  describe('initialState', () => {
    it('should have correct initial values', () => {
      expect(initialState).toEqual({
        conversations: [],
        activeConversationId: null,
        isLoading: false,
        error: null,
        modelStatus: 'idle',
        loadProgress: 0,
      });
    });
  });

  describe('createConversation', () => {
    it('should add conversation and set it as active', () => {
      const conversation = createTestConversation('conv-1');
      const newState = chatReducer(initialState, createConversation(conversation));

      expect(newState.conversations).toHaveLength(1);
      expect(newState.conversations[0]).toEqual(conversation);
      expect(newState.activeConversationId).toBe('conv-1');
    });

    it('should add multiple conversations', () => {
      let state = initialState;
      state = chatReducer(state, createConversation(createTestConversation('conv-1')));
      state = chatReducer(state, createConversation(createTestConversation('conv-2')));

      expect(state.conversations).toHaveLength(2);
      expect(state.activeConversationId).toBe('conv-2'); // Last created is active
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation by id', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [
          createTestConversation('conv-1'),
          createTestConversation('conv-2'),
        ],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(state, deleteConversation('conv-2'));
      expect(newState.conversations).toHaveLength(1);
      expect(newState.conversations[0].id).toBe('conv-1');
    });

    it('should set first conversation as active when deleting active', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [
          createTestConversation('conv-1'),
          createTestConversation('conv-2'),
        ],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(state, deleteConversation('conv-1'));
      expect(newState.activeConversationId).toBe('conv-2');
    });

    it('should set activeConversationId to null when deleting last conversation', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [createTestConversation('conv-1')],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(state, deleteConversation('conv-1'));
      expect(newState.conversations).toHaveLength(0);
      expect(newState.activeConversationId).toBeNull();
    });

    it('should not modify state when deleting non-existent conversation', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [createTestConversation('conv-1')],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(state, deleteConversation('non-existent'));
      expect(newState.conversations).toHaveLength(1);
    });
  });

  describe('setActiveConversation', () => {
    it('should set active conversation id', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [
          createTestConversation('conv-1'),
          createTestConversation('conv-2'),
        ],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(state, setActiveConversation('conv-2'));
      expect(newState.activeConversationId).toBe('conv-2');
    });
  });

  describe('loadConversations', () => {
    it('should load conversations and set first as active', () => {
      const conversations = [
        createTestConversation('conv-1'),
        createTestConversation('conv-2'),
      ];

      const newState = chatReducer(initialState, loadConversations(conversations));
      expect(newState.conversations).toHaveLength(2);
      expect(newState.activeConversationId).toBe('conv-1');
    });

    it('should set activeConversationId to null for empty array', () => {
      const newState = chatReducer(initialState, loadConversations([]));
      expect(newState.conversations).toHaveLength(0);
      expect(newState.activeConversationId).toBeNull();
    });

    it('should replace existing conversations', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [createTestConversation('old-conv')],
        activeConversationId: 'old-conv',
      };

      const newConversations = [createTestConversation('new-conv')];
      const newState = chatReducer(state, loadConversations(newConversations));

      expect(newState.conversations).toHaveLength(1);
      expect(newState.conversations[0].id).toBe('new-conv');
    });
  });

  describe('addMessage', () => {
    it('should add message to active conversation', () => {
      const conversation = createTestConversation('conv-1');
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const message = createTestMessage('user', 'Hello');
      const newState = chatReducer(state, addMessage(message));

      expect(newState.conversations[0].messages).toHaveLength(1);
      expect(newState.conversations[0].messages[0]).toEqual(message);
    });

    it('should auto-generate title from first user message', () => {
      const conversation = createTestConversation('conv-1', 'New Conversation');
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const message = createTestMessage('user', 'What is the weather today?');
      const newState = chatReducer(state, addMessage(message));

      expect(newState.conversations[0].title).toBe('What is the weather today?');
    });

    it('should truncate long titles with ellipsis', () => {
      const conversation = createTestConversation('conv-1', 'New Conversation');
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const longContent = 'A'.repeat(100);
      const message = createTestMessage('user', longContent);
      const newState = chatReducer(state, addMessage(message));

      expect(newState.conversations[0].title).toBe('A'.repeat(50) + '...');
    });

    it('should not update title for subsequent user messages', () => {
      const conversation: Conversation = {
        ...createTestConversation('conv-1', 'First Message'),
        messages: [createTestMessage('user', 'First')],
      };
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const message = createTestMessage('user', 'Second Message');
      const newState = chatReducer(state, addMessage(message));

      expect(newState.conversations[0].title).toBe('First Message');
    });

    it('should not update title for assistant messages', () => {
      const conversation = createTestConversation('conv-1', 'Original Title');
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const message = createTestMessage('assistant', 'Hello, how can I help?');
      const newState = chatReducer(state, addMessage(message));

      expect(newState.conversations[0].title).toBe('Original Title');
    });

    it('should update conversation updatedAt timestamp', () => {
      const oldTimestamp = Date.now() - 10000;
      const conversation: Conversation = {
        ...createTestConversation('conv-1'),
        updatedAt: oldTimestamp,
      };
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const message = createTestMessage('user', 'Hello');
      const newState = chatReducer(state, addMessage(message));

      expect(newState.conversations[0].updatedAt).toBeGreaterThan(oldTimestamp);
    });

    it('should not add message when no active conversation', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [createTestConversation('conv-1')],
        activeConversationId: null,
      };

      const message = createTestMessage('user', 'Hello');
      const newState = chatReducer(state, addMessage(message));

      expect(newState.conversations[0].messages).toHaveLength(0);
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      const newState = chatReducer(initialState, setLoading(true));
      expect(newState.isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      const state = { ...initialState, isLoading: true };
      const newState = chatReducer(state, setLoading(false));
      expect(newState.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const newState = chatReducer(initialState, setError('Something went wrong'));
      expect(newState.error).toBe('Something went wrong');
    });

    it('should clear error with null', () => {
      const state = { ...initialState, error: 'Previous error' };
      const newState = chatReducer(state, setError(null));
      expect(newState.error).toBeNull();
    });
  });

  describe('setModelStatus', () => {
    it('should set model status to loading', () => {
      const newState = chatReducer(initialState, setModelStatus('loading'));
      expect(newState.modelStatus).toBe('loading');
    });

    it('should set model status to ready', () => {
      const newState = chatReducer(initialState, setModelStatus('ready'));
      expect(newState.modelStatus).toBe('ready');
    });

    it('should set model status to error', () => {
      const newState = chatReducer(initialState, setModelStatus('error'));
      expect(newState.modelStatus).toBe('error');
    });
  });

  describe('setLoadProgress', () => {
    it('should set load progress', () => {
      const newState = chatReducer(initialState, setLoadProgress(50));
      expect(newState.loadProgress).toBe(50);
    });

    it('should handle 0%', () => {
      const newState = chatReducer(initialState, setLoadProgress(0));
      expect(newState.loadProgress).toBe(0);
    });

    it('should handle 100%', () => {
      const newState = chatReducer(initialState, setLoadProgress(100));
      expect(newState.loadProgress).toBe(100);
    });
  });

  describe('clearChat', () => {
    it('should clear messages from active conversation', () => {
      const conversation: Conversation = {
        ...createTestConversation('conv-1'),
        messages: [
          createTestMessage('user', 'Hello'),
          createTestMessage('assistant', 'Hi'),
        ],
      };
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(state, clearChat());
      expect(newState.conversations[0].messages).toHaveLength(0);
    });

    it('should clear error state', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [createTestConversation('conv-1')],
        activeConversationId: 'conv-1',
        error: 'Some error',
      };

      const newState = chatReducer(state, clearChat());
      expect(newState.error).toBeNull();
    });

    it('should update conversation updatedAt timestamp', () => {
      const oldTimestamp = Date.now() - 10000;
      const conversation: Conversation = {
        ...createTestConversation('conv-1'),
        updatedAt: oldTimestamp,
        messages: [createTestMessage('user', 'Hello')],
      };
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(state, clearChat());
      expect(newState.conversations[0].updatedAt).toBeGreaterThan(oldTimestamp);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const state = { ...initialState, error: 'Some error' };
      const newState = chatReducer(state, clearError());
      expect(newState.error).toBeNull();
    });
  });

  describe('updateMessage', () => {
    it('should update message content', () => {
      const message = createTestMessage('assistant', 'Original content');
      const conversation: Conversation = {
        ...createTestConversation('conv-1'),
        messages: [message],
      };
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(
        state,
        updateMessage({ id: message.id, content: 'Updated content' })
      );

      expect(newState.conversations[0].messages[0].content).toBe('Updated content');
    });

    it('should not modify state when message not found', () => {
      const conversation: Conversation = {
        ...createTestConversation('conv-1'),
        messages: [createTestMessage('user', 'Hello')],
      };
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(
        state,
        updateMessage({ id: 'non-existent', content: 'Updated' })
      );

      expect(newState.conversations[0].messages[0].content).toBe('Hello');
    });

    it('should update conversation updatedAt timestamp', () => {
      const oldTimestamp = Date.now() - 10000;
      const message = createTestMessage('assistant', 'Original');
      const conversation: Conversation = {
        ...createTestConversation('conv-1'),
        updatedAt: oldTimestamp,
        messages: [message],
      };
      const state: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(
        state,
        updateMessage({ id: message.id, content: 'Updated' })
      );

      expect(newState.conversations[0].updatedAt).toBeGreaterThan(oldTimestamp);
    });
  });

  describe('updateConversationTitle', () => {
    it('should update conversation title', () => {
      const state: ChatState = {
        ...initialState,
        conversations: [createTestConversation('conv-1', 'Old Title')],
        activeConversationId: 'conv-1',
      };

      const newState = chatReducer(
        state,
        updateConversationTitle({ id: 'conv-1', title: 'New Title' })
      );

      expect(newState.conversations[0].title).toBe('New Title');
    });
  });
});
