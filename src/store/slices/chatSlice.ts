import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatMessage, ModelStatus, Conversation } from '../../types/chat';

export const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  error: null,
  modelStatus: 'idle',
  loadProgress: 0,
};

const generateTitle = (content: string): string => {
  const maxLength = 50;
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.push(action.payload);
      state.activeConversationId = action.payload.id;
    },

    deleteConversation: (state, action: PayloadAction<string>) => {
      const index = state.conversations.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.conversations.splice(index, 1);
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = state.conversations.length > 0
            ? state.conversations[0].id
            : null;
        }
      }
    },

    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },

    loadConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.activeConversationId = action.payload.length > 0 ? action.payload[0].id : null;
    },

    updateConversationTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.id);
      if (conversation) {
        conversation.title = action.payload.title;
      }
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        conversation.messages.push(action.payload);
        conversation.updatedAt = Date.now();

        // Auto-generate title from first user message
        if (action.payload.role === 'user' &&
            !conversation.messages.slice(0, -1).some(m => m.role === 'user')) {
          conversation.title = generateTitle(action.payload.content);
        }
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setModelStatus: (state, action: PayloadAction<ModelStatus>) => {
      state.modelStatus = action.payload;
    },

    setLoadProgress: (state, action: PayloadAction<number>) => {
      state.loadProgress = action.payload;
    },

    clearChat: (state) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        conversation.messages = [];
        conversation.updatedAt = Date.now();
      }
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    updateMessage: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const conversation = state.conversations.find(c => c.id === state.activeConversationId);
      if (conversation) {
        const message = conversation.messages.find(m => m.id === action.payload.id);
        if (message) {
          message.content = action.payload.content;
          conversation.updatedAt = Date.now();
        }
      }
    },
  },
});

export const {
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
} = chatSlice.actions;

export default chatSlice.reducer;
