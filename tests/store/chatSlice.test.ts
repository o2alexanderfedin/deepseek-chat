import { describe, it, expect } from 'vitest';
import chatReducer, {
  addMessage,
  setLoading,
  setError,
  setModelStatus,
  setLoadProgress,
  clearChat,
  updateMessage,
  createConversation,
  deleteConversation,
  setActiveConversation,
  loadConversations,
  updateConversationTitle,
  initialState,
} from '../../src/store/slices/chatSlice';
import type { ChatState, ChatMessage, Conversation } from '../../src/types/chat';

describe('chatSlice', () => {
  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = chatReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should have correct initial values', () => {
      expect(initialState.conversations).toEqual([]);
      expect(initialState.activeConversationId).toBeNull();
      expect(initialState.isLoading).toBe(false);
      expect(initialState.error).toBeNull();
      expect(initialState.modelStatus).toBe('idle');
      expect(initialState.loadProgress).toBe(0);
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const state = chatReducer(initialState, createConversation(conversation));
      expect(state.conversations).toHaveLength(1);
      expect(state.conversations[0].id).toBe('conv-1');
      expect(state.activeConversationId).toBe('conv-1');
    });

    it('should set active conversation to the new one', () => {
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'Chat 1',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Chat 2',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conv1));
      state = chatReducer(state, createConversation(conv2));

      expect(state.activeConversationId).toBe('conv-2');
      expect(state.conversations).toHaveLength(2);
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, deleteConversation('conv-1'));

      expect(state.conversations).toHaveLength(0);
    });

    it('should clear activeConversationId when deleting active conversation', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, deleteConversation('conv-1'));

      expect(state.activeConversationId).toBeNull();
    });

    it('should switch to another conversation when deleting active', () => {
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'Chat 1',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Chat 2',
        messages: [],
        createdAt: Date.now() + 1000,
        updatedAt: Date.now() + 1000,
      };

      let state = chatReducer(initialState, createConversation(conv1));
      state = chatReducer(state, createConversation(conv2));
      state = chatReducer(state, deleteConversation('conv-2'));

      expect(state.activeConversationId).toBe('conv-1');
    });
  });

  describe('setActiveConversation', () => {
    it('should set the active conversation', () => {
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'Chat 1',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Chat 2',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conv1));
      state = chatReducer(state, createConversation(conv2));
      state = chatReducer(state, setActiveConversation('conv-1'));

      expect(state.activeConversationId).toBe('conv-1');
    });
  });

  describe('loadConversations', () => {
    it('should load conversations from storage', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Chat 1',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'conv-2',
          title: 'Chat 2',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const state = chatReducer(initialState, loadConversations(conversations));
      expect(state.conversations).toHaveLength(2);
      expect(state.activeConversationId).toBe('conv-1');
    });

    it('should set activeConversationId to null if no conversations', () => {
      const state = chatReducer(initialState, loadConversations([]));
      expect(state.activeConversationId).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('should add a message to active conversation', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, addMessage(message));

      const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
      expect(activeConv?.messages).toHaveLength(1);
      expect(activeConv?.messages[0]).toEqual(message);
    });

    it('should update conversation title from first user message', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'This is a very long message that should be truncated for the title',
        timestamp: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, addMessage(message));

      const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
      expect(activeConv?.title).toBe('This is a very long message that should be truncat...');
    });

    it('should not update title if already has user message', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Existing Title',
        messages: [
          {
            id: 'msg-0',
            role: 'user',
            content: 'Previous message',
            timestamp: Date.now() - 1000,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'New message',
        timestamp: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, addMessage(message));

      const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
      expect(activeConv?.title).toBe('Existing Title');
    });

    it('should update updatedAt timestamp', () => {
      const oldTime = Date.now() - 10000;
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [],
        createdAt: oldTime,
        updatedAt: oldTime,
      };
      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, addMessage(message));

      const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
      expect(activeConv?.updatedAt).toBeGreaterThan(oldTime);
    });
  });

  describe('updateMessage', () => {
    it('should update message content in active conversation', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [
          {
            id: 'msg-1',
            role: 'assistant',
            content: 'Initial',
            timestamp: Date.now(),
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, updateMessage({ id: 'msg-1', content: 'Updated content' }));

      const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
      expect(activeConv?.messages[0].content).toBe('Updated content');
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      const state = chatReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      const loadingState: ChatState = { ...initialState, isLoading: true };
      const state = chatReducer(loadingState, setLoading(false));
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Something went wrong';
      const state = chatReducer(initialState, setError(errorMessage));
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      const errorState: ChatState = { ...initialState, error: 'Previous error' };
      const state = chatReducer(errorState, setError(null));
      expect(state.error).toBeNull();
    });
  });

  describe('setModelStatus', () => {
    it('should set modelStatus to loading', () => {
      const state = chatReducer(initialState, setModelStatus('loading'));
      expect(state.modelStatus).toBe('loading');
    });

    it('should set modelStatus to ready', () => {
      const state = chatReducer(initialState, setModelStatus('ready'));
      expect(state.modelStatus).toBe('ready');
    });

    it('should set modelStatus to error', () => {
      const state = chatReducer(initialState, setModelStatus('error'));
      expect(state.modelStatus).toBe('error');
    });

    it('should set modelStatus to idle', () => {
      const readyState: ChatState = { ...initialState, modelStatus: 'ready' };
      const state = chatReducer(readyState, setModelStatus('idle'));
      expect(state.modelStatus).toBe('idle');
    });
  });

  describe('setLoadProgress', () => {
    it('should set loadProgress to 0', () => {
      const state = chatReducer(initialState, setLoadProgress(0));
      expect(state.loadProgress).toBe(0);
    });

    it('should set loadProgress to 50', () => {
      const state = chatReducer(initialState, setLoadProgress(50));
      expect(state.loadProgress).toBe(50);
    });

    it('should set loadProgress to 100', () => {
      const state = chatReducer(initialState, setLoadProgress(100));
      expect(state.loadProgress).toBe(100);
    });
  });

  describe('clearChat', () => {
    it('should clear messages in active conversation', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [
          { id: 'msg-1', role: 'user', content: 'Hello', timestamp: Date.now() },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, clearChat());

      const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
      expect(activeConv?.messages).toEqual([]);
    });

    it('should reset error to null', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      let state = chatReducer(initialState, createConversation(conversation));
      state = { ...state, error: 'Some error' };
      state = chatReducer(state, clearChat());
      expect(state.error).toBeNull();
    });

    it('should preserve modelStatus', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      let state = chatReducer(initialState, createConversation(conversation));
      state = { ...state, modelStatus: 'ready' };
      state = chatReducer(state, clearChat());
      expect(state.modelStatus).toBe('ready');
    });
  });

  describe('updateConversationTitle', () => {
    it('should update conversation title', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Old Title',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      let state = chatReducer(initialState, createConversation(conversation));
      state = chatReducer(state, updateConversationTitle({ id: 'conv-1', title: 'New Title' }));

      expect(state.conversations[0].title).toBe('New Title');
    });
  });
});
